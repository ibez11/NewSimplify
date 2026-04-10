import { getJobHistoryModel } from '../models';
import { JobStatus } from '../models/Job';
import JobHistory from '../models/JobHistory';

export const getById = async (id: number): Promise<JobHistory> => {
  const model = getJobHistoryModel();

  return model.findByPk<JobHistory>(id);
};

export const getJobHistoryByJobId = async (jobId: number): Promise<{ rows: JobHistory[]; count: number }> => {
  const model = getJobHistoryModel();

  return model.findAndCountAll<JobHistory>({ where: { jobId }, order: [['id', 'asc']] });
};

export const createJobHistory = async (jobId: number, userProfileId: number, jobStatus: string, location?: string): Promise<JobHistory> => {
  const model = getJobHistoryModel();

  return model.create<JobHistory>({
    jobStatus,
    location,
    userProfileId,
    jobId,
    dateTime: new Date()
  });
};

export const getLastInProgressJobIdByUserProfileId = async (userProfileId: number): Promise<JobHistory> => {
  const model = getJobHistoryModel();

  return model.findOne<JobHistory>({ where: { userProfileId, jobStatus: JobStatus.IN_PROGRESS }, order: [['id', 'desc']] });
};
