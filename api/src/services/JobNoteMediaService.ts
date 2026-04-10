import Logger from '../Logger';
import JobNoteMedia from '../database/models/JobNoteMedia';
import * as JobNoteMediaDao from '../database/dao/JobNoteMediaDao';
import JobNoteMediaNotFoundError from '../errors/JobNoteMediaNotFoundError';
import { Transaction } from 'sequelize';

const LOG = new Logger('JobNoteService');

export const getJobNoteMediaByJobNoteId = (jobNoteId: number): Promise<{ rows: JobNoteMedia[]; count: number }> => {
  LOG.debug('Get job note media by job note id');

  return JobNoteMediaDao.getJobNoteMediaByJobNoteId(jobNoteId);
};

/**
 * edit a job note media in the system
 *
 * @param fileName of the job note media
 *
 * @returns job note media Detail
 */
export const editJobNoteMedia = async (id: number, fileName: string, fileType: string): Promise<JobNoteMedia> => {
  LOG.debug('Editing job note media');

  const jobNoteMedia = await JobNoteMediaDao.getById(id);

  if (!jobNoteMedia) {
    throw new JobNoteMediaNotFoundError(id);
  }
  try {
    const jobNoteMediaUpdate = await jobNoteMedia.update({ fileName, fileType });
    return jobNoteMediaUpdate;
  } catch (err) {
    throw err;
  }
};

export const deleteJobNoteMedia = async (id: number, transaction: Transaction): Promise<void> => {
  await JobNoteMediaDao.deleteJobNoteMediaById(id, transaction);
};
