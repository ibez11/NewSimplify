import Logger from '../Logger';
import JobNote from '../database/models/JobNote';
import JobNoteMedia from '../database/models/JobNoteMedia';
import * as JobDao from '../database/dao/JobDao';
import * as JobNoteDao from '../database/dao/JobNoteDao';
import * as JobNoteMediaDao from '../database/dao/JobNoteMediaDao';
import * as EquipmentDao from '../database/dao/EquipmentDao';
import * as JobNoteEquipmentDao from '../database/dao/JobNoteEquipmentDao';
import JobNoteNotFoundError from '../errors/JobNoteNotFoundError';
import { Transaction } from 'sequelize';
import { JobNoteBody } from '../typings/body/JobNoteBody';
import JobNoteQueryParams from '../typings/params/JobNoteQueryParams';
import * as AwsService from '../services/AwsService';
import * as EquipmentService from '../services/EquipmentService';

const LOG = new Logger('JobNoteService');

export const getJobNoteById = (jobNoteId: number): Promise<JobNote> => {
  LOG.debug('Get job note by id');

  return JobNoteDao.getById(jobNoteId);
};

// delete soon
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
export const getJobNoteByJobId = (jobId: number, type?: string, offset?: any, limit?: any): Promise<{ rows: JobNote[]; count: number }> => {
  LOG.debug('Get job note by job id');

  return JobNoteDao.getJobNoteByJobId(jobId, type, offset, limit);
};

export const getJobNotesByJobId = async (jobId: number, query?: JobNoteQueryParams): Promise<{ rows: JobNote[]; count: number }> => {
  LOG.debug('Get job note by job id');

  const { rows, count } = await JobNoteDao.getPaginated(jobId, query);

  await Promise.all(
    rows.map(async row => {
      if (row.JobNoteMedia) {
        await Promise.all(
          row.JobNoteMedia.sort((a, b) => a.id - b.id).map(async media => {
            if (media.fileName) {
              const preSignedUrl = await AwsService.s3BucketGetSignedUrl(media.fileName, 'jobs');
              media.imageUrl = preSignedUrl;
            }
          })
        );
      }
    })
  );

  return { rows, count };
};

export const getPreviousJobNoteByJobId = async (
  jobId: number,
  jobNoteType?: string,
  offset?: number,
  limit?: number
): Promise<{ rows: JobNote[]; count: number }> => {
  LOG.debug('Get previous job note by job id');
  const { row } = await JobDao.getJobDetailById(jobId);
  const currentJob = row;
  const serviceId = currentJob.serviceId;

  return await JobNoteDao.getPreviousJobNoteByJobId(jobId, serviceId, jobNoteType, offset, limit);
};

export const getPreviousJobNoteByClientId = async (
  jobId: number,
  jobNoteType?: string,
  offset?: number,
  limit?: number
): Promise<{ rows: JobNote[]; count: number }> => {
  LOG.debug('Get previous job note by client id');
  const { row } = await JobDao.getJobDetailById(jobId);
  const currentJob = row;
  const clientId = currentJob.clientId;

  return await JobNoteDao.getPreviousJobNoteByClientId(jobId, clientId, jobNoteType, offset, limit);
};

export const getPreviousJobNotesByClientId = async (jobId: number, query?: JobNoteQueryParams): Promise<JobNote[]> => {
  LOG.debug('Get previous job note by client id');
  const { row } = await JobDao.getJobDetailById(jobId);
  const currentJob = row;
  const clientId = currentJob.clientId;

  return await JobNoteDao.getPreviousJobNotesByClientId(jobId, clientId, query);
};

export const getCountPreviousJobNotesByClientId = async (jobId: number, query?: JobNoteQueryParams): Promise<number> => {
  LOG.debug('Get previous job note by client id');
  const { row } = await JobDao.getJobDetailById(jobId);
  const currentJob = row;
  const clientId = currentJob.clientId;

  return await JobNoteDao.getCountPreviousJobNotesByClientId(jobId, clientId, query);
};

/**
 * Create a job note in the system
 *
 * @param notes of the job note
 * @param image of the job note
 * @param jobId of the job note
 *
 * @returns job note Detail
 * new flow for combine job note, delete soon
 */
export const createJobNote = async (query: JobNoteBody): Promise<JobNote> => {
  LOG.debug('Creating job note');

  try {
    const newJobNote = await JobNoteDao.createJobNote(query);

    // delete soon
    if (query.jobNoteType === 'EQUIPMENT') {
      const equipment = await EquipmentDao.getEquipmentDetailById(query.equipmentId);

      equipment.update({
        dateWorkDone: new Date(),
        updatedBy: query.createdBy
      });

      await JobNoteEquipmentDao.create([{ jobNoteId: newJobNote.id, equipmentId: query.equipmentId }]);
    }

    if (query.equipmentIds && query.equipmentIds.length > 0) {
      query.equipmentIds.map(async val => {
        const equipment = await EquipmentDao.getEquipmentDetailById(val);
        equipment.update({
          dateWorkDone: new Date(),
          updatedBy: query.createdBy
        });
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const jobNoteEquipment: any[] = [];
      Promise.all(
        query.equipmentIds.map(value => {
          return jobNoteEquipment.push({ jobNoteId: newJobNote.id, equipmentId: value });
        })
      );

      await JobNoteEquipmentDao.create(jobNoteEquipment);
    }

    if (query.JobNoteMedia) {
      await JobNoteMediaDao.bulkCreateJobNoteMedia(
        query.JobNoteMedia.map(media => {
          return {
            jobNoteId: newJobNote.id,
            fileName: media.fileName,
            fileType: media.fileType
          };
        })
      );
      // await Promise.all(JobNoteMedia.map(media => JobNoteMediaDao.createJobNoteMedia(newJobNote.id, media.fileName, media.fileType)));
    }

    // delete soon
    const jobNoteCreated = await JobNoteDao.getById(newJobNote.id);
    const noteType = query.equipmentIds && query.equipmentIds.length > 0 ? 'EQUIPMENT' : 'GENERAL';
    jobNoteCreated.update({
      jobNoteType: query.jobNoteType ? query.jobNoteType : noteType
    });

    return jobNoteCreated;
  } catch (err) {
    throw err;
  }
};

/**
 * edit a job note in the system
 *
 * @param notes of the job note
 * @param image of the job note
 * @param isHide of the job note
 * @param jobId of the job note
 *
 * @returns job note Detail
 */
export const editJobNote = async (id: number, query: JobNoteBody): Promise<JobNote> => {
  LOG.debug('Editing job note');

  const jobNote = await JobNoteDao.getById(id);

  if (!jobNote) {
    throw new JobNoteNotFoundError(id);
  }
  try {
    await JobNoteMediaDao.deleteJobNoteMediaByJobNoteId(id);
    const { notes, isHide, equipmentId, JobNoteMedia, equipmentIds } = query;
    const Equipment = await EquipmentDao.getEquipmentDetailById(equipmentId);
    await jobNote.update({ notes, isHide, equipmentId, Equipment });

    JobNoteEquipmentDao.deleteDataByJobNoteId(id);
    // delete soon
    if (equipmentId) {
      await JobNoteEquipmentDao.create([{ jobNoteId: id, equipmentId: query.equipmentId }]);
    }

    if (JobNoteMedia && JobNoteMedia.length > 0) {
      JobNoteMedia.map(item => {
        delete item.id;

        item.jobNoteId = jobNote.id;
      });

      await JobNoteMediaDao.bulkCreateJobNoteMedia(
        JobNoteMedia.map(media => {
          return {
            jobNoteId: id,
            fileName: media.fileName,
            fileType: media.fileType
          };
        })
      );
    }

    if (equipmentIds && equipmentIds.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const jobNoteEquipment: any[] = [];
      Promise.all(
        query.equipmentIds.map(value => {
          return jobNoteEquipment.push({ jobNoteId: id, equipmentId: value });
        })
      );

      await JobNoteEquipmentDao.create(jobNoteEquipment);
    }

    // delete soon
    const jobNoteEdited = await JobNoteDao.getById(id);
    const noteType = query.equipmentIds && query.equipmentIds.length > 0 ? 'EQUIPMENT' : 'GENERAL';
    jobNoteEdited.update({
      jobNoteType: query.jobNoteType ? query.jobNoteType : noteType
    });

    return jobNoteEdited;
  } catch (err) {
    throw err;
  }
};

export const updateVisibilityJobNote = async (id: number, isHide: boolean): Promise<void> => {
  LOG.debug('Editing job note');

  const jobNote = await JobNoteDao.getById(id);

  if (!jobNote) {
    throw new JobNoteNotFoundError(id);
  }

  try {
    await jobNote.update({ isHide });
  } catch (error) {
    throw error;
  }
};

export const deleteJobNote = async (id: number, transaction: Transaction): Promise<void> => {
  const Equipments = await EquipmentService.getEquipmentByJobNoteId(id);
  if (Equipments) {
    JobNoteEquipmentDao.deleteDataByJobNoteId(id);
  }
  await JobNoteDao.deleteJobById(id, transaction);
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
export const getJobNoteByEquipmentId = async (equipmentId: number, offset?: any, limit?: any): Promise<JobNote[]> => {
  LOG.debug('Get job note by equipment id');

  return JobNoteDao.getJobNoteByEquipmentId(equipmentId, offset, limit);
};

export const getCountNotesByQuery = async (jobId?: number, query?: JobNoteQueryParams): Promise<number> => {
  LOG.debug('Get count of job note');

  return await JobNoteDao.getCountJobNotes(jobId, query);
};
