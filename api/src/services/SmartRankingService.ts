/* eslint-disable @typescript-eslint/no-explicit-any */
import Logger from '../Logger';
import * as UserProfileDao from '../database/dao/UserProfileDao';
import * as JobDao from '../database/dao/JobDao';
import * as DistrictService from './DistrictService';

import { ActiveUserResponseModel } from '../typings/ResponseFormats';

const LOG = new Logger('SmartRankingService.ts');

/**
 * get list technicians proximity score between two postal codes
 */
export const getSmartRangkingTechnician = async (
  jobId: number,
  toPostalCode: string,
  skills: string,
  useSkill: boolean,
  useProximity: boolean
): Promise<ActiveUserResponseModel[]> => {
  LOG.debug('Getting Technician Proximity Scores');

  const [technicians, adminTechnicians] = await Promise.all([UserProfileDao.getActiveTechnicians(), UserProfileDao.getActiveAdminTechnicians()]);

  if (!jobId) {
    LOG.warn('No Job ID provided for Smart Ranking');
    throw new Error('Job ID is required');
  }

  const job = await JobDao.getJobDetailByIdForSmartRank(jobId);

  if (!job) {
    LOG.warn(`Job with ID ${jobId} not found for Smart Ranking`);
    throw new Error(`Job with ID ${jobId} not found`);
  }

  // merge & dedupe by id
  const mergedMap = new Map<number, ActiveUserResponseModel>();
  for (const t of [...technicians, ...adminTechnicians]) mergedMap.set(t.id, t);
  const activeTechnicians = Array.from(mergedMap.values());

  // parse required skills once
  const requiredSkills = (skills ?? '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  const requiredCount = requiredSkills.length;

  const toSkillKey = (s: any) => {
    if (!s) return '';
    if (typeof s === 'string') return s.trim();
    return String(s.name ?? s.skill ?? s.key ?? s.value ?? '').trim();
  };

  const scored = await Promise.all(
    activeTechnicians.map(async technician => {
      // ---- Proximity score ----
      let proximityScore = 0;
      let techLocation: string | null = null;
      // let jobLocation: string | null = null;

      if (useProximity) {
        // Determine which postal code to use for technician based on rules:
        // - For future jobs (from next day onwards) use technician home postal code
        // - If the job is scheduled before technician's first job of the same day, use home postal code
        // - If the technician has no active/completed jobs today, use home postal code
        // Otherwise, use technician's last job postal code
        const jobDate = job?.startDateTime ? new Date(job.startDateTime) : null;
        const today = new Date();

        // helper to compare date-only (yyyy-mm-dd)
        const sameDay = (d1: Date | null, d2: Date | null) => {
          if (!d1 || !d2) return false;
          return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
        };

        let useHomePostal = false;

        if (jobDate) {
          // future date (from next day onwards)
          const jobOnly = new Date(jobDate.getFullYear(), jobDate.getMonth(), jobDate.getDate());
          const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
          if (jobOnly.getTime() > todayOnly.getTime()) {
            useHomePostal = true;
          }
        }

        // fetch technician jobs (may be empty)
        const techJobs = await JobDao.getJobsByTecnician(technician.id);

        // if technician has no active/completed jobs today -> use home postal
        const techJobsToday = techJobs.filter(j => j && j.startDateTime && job && sameDay(new Date(j.startDateTime), new Date(job.startDateTime)));
        if (techJobsToday.length === 0) {
          useHomePostal = true;
        }

        // if job is before technician's first job of that day -> use home postal
        if (job && techJobsToday.length > 0) {
          const firstTechJob = techJobsToday.reduce((min, cur) => {
            const curDate = new Date(cur.startDateTime);
            return !min || curDate < new Date(min.startDateTime) ? cur : min;
          }, null as any);
          if (firstTechJob && job.startDateTime) {
            const jobStart = new Date(job.startDateTime);
            const firstStart = new Date(firstTechJob.startDateTime);
            if (jobStart.getTime() < firstStart.getTime()) {
              useHomePostal = true;
            }
          }
        }

        // choose postal code
        const technicianPostal =
          // prefer last job postal code if not using home
          (!useHomePostal && (await JobDao.getLastTechnicianJob(technician.id))?.postalCode) ||
          // fallback to technician homePostalCode or homeDistrict
          (technician.homePostalCode ?? technician.homeDistrict ?? null);

        const targetPostal = job.postalCode ?? toPostalCode;

        if (technicianPostal) {
          // ensure postal codes are strings trimmed to avoid unexpected formats
          const from = String(technicianPostal).trim();
          const to = String(targetPostal ?? '').trim();

          const info = await DistrictService.getDistrictProximityInfo(from, to);

          proximityScore = info.proximityScore ?? 0;
          techLocation = info.fromGroup;
        } else {
          console.log(`SmartRank: tech=${technician.id} has no technicianPostal fallback (homePostal/homeDistrict missing)`);
          proximityScore = 0;
        }
      }

      // ---- Skill matching ----
      const userSkillsRaw = technician.UserSkills ?? [];
      const matchSkills = useSkill && requiredCount > 0 ? userSkillsRaw.filter((us: any) => requiredSkills.includes(toSkillKey(us))) : [];

      const matchNumber = matchSkills.length;

      const skillsetScore = useSkill && requiredCount > 0 ? (matchNumber / requiredCount) * 100 : 0;

      // ---- Final score ----
      const finalScore = useSkill && useProximity ? skillsetScore * 0.7 + proximityScore * 0.3 : useSkill ? skillsetScore : proximityScore;

      return {
        ...technician,
        techLocation,
        proximityScore,
        matchSkills,
        matchNumber,
        skillsetScore,
        finalScore
      };
    })
  );
  // ---- Sorting based on toggle state ----
  scored.sort((a: any, b: any) => {
    // both ON → final score
    if (useSkill && useProximity) {
      if (b.finalScore !== a.finalScore) return b.finalScore - a.finalScore;
      if (b.matchNumber !== a.matchNumber) return b.matchNumber - a.matchNumber;
      return b.proximityScore - a.proximityScore;
    }

    // skill only
    if (useSkill && !useProximity) {
      if (b.matchNumber !== a.matchNumber) return b.matchNumber - a.matchNumber;
      return b.skillsetScore - a.skillsetScore;
    }

    // proximity only
    if (!useSkill && useProximity) {
      return b.proximityScore - a.proximityScore;
    }

    // 🚀 both OFF → sort by name A–Z
    // some records may use different casing for the display name property
    const nameA = String(a.displayName ?? a.displayname ?? '').toLowerCase();
    const nameB = String(b.displayName ?? b.displayname ?? '').toLowerCase();
    return nameA.localeCompare(nameB);
  });

  return scored as ActiveUserResponseModel[];
};
