import Logger from '../Logger';
import JobDocument from '../database/models/JobDocument';
import * as JobDocumentDao from '../database/dao/JobDocumentDao';
import JobDocumentNotFoundError from '../errors/JobDocumentNotFoundError';
import { Transaction } from 'sequelize';

const LOG = new Logger('JobDocumentService');

export const getJobDocumentById = (jobDocumentId: number): Promise<JobDocument> => {
  LOG.debug('Get job document by id');

  return JobDocumentDao.getById(jobDocumentId);
};

export const getJobDocumentByJobId = (jobId: number): Promise<{ rows: JobDocument[]; count: number }> => {
  LOG.debug('Get job document by job id');

  return JobDocumentDao.getJobDocumentByJobId(jobId);
};

/**
 * Create a job document in the system
 *
 * @param documents of the job document
 * @param document of the job document
 * @param jobId of the job document
 *
 * @returns job document Detail
 */
export const createJobDocument = (documents: string, document: string, jobId: number): Promise<JobDocument> => {
  LOG.debug('Creating job document');

  try {
    return JobDocumentDao.createJobDocument(documents, document, jobId);
  } catch (err) {
    throw err;
  }
};

/**
 * edit a job document in the system
 *
 * @param documents of the job document
 * @param document of the job document
 * @param isHide of the job document
 * @param jobId of the job document
 *
 * @returns job document Detail
 */
export const editJobDocument = async (id: number, documents: string, document: string, isHide: boolean): Promise<JobDocument> => {
  LOG.debug('Editing job document');

  const jobDocument = await JobDocumentDao.getById(id);

  if (!jobDocument) {
    throw new JobDocumentNotFoundError(id);
  }

  try {
    return await jobDocument.update({ documents, document, isHide });
  } catch (err) {
    throw err;
  }
};

export const deleteJobDocument = async (id: number, transaction: Transaction): Promise<void> => {
  await JobDocumentDao.deleteJobById(id, transaction);
};
