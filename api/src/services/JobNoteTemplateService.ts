import Logger from '../Logger';
import JobNoteTemplate from '../database/models/JobNoteTemplate';
import * as JobNoteTemplateDao from '../database/dao/JobNoteTemplateDao';
import JobNoteTemplateNotFoundError from '../errors/JobNoteTemplateNotFoundError';
import { JobNoteTemplateResponseModel } from '../typings/ResponseFormats';

const LOG = new Logger('JobNoteTemplateService');

/**
 * Search Job Note Template with query and optional pagination
 *
 * @param s offset for pagination search
 * @param l limit for pagination search
 * @param q query for searching
 *
 * @returns the total counts and the data for current page
 */
export const searchJobNoteTemplatesWithPagination = async (
  offset: number,
  limit?: number,
  q?: string
): Promise<{ rows: JobNoteTemplate[]; count: number }> => {
  LOG.debug('Searching Job Note Template with Pagination');

  return await JobNoteTemplateDao.getPaginated(offset, limit, q);
};

/**
 * Create a new Job Note Template in the system, based on user input
 *
 * @param notes of the new Job Note Template
 *
 * @returns JobNoteTemplateResponseModel
 */
export const createJobNoteTemplate = async (notes: string): Promise<JobNoteTemplate> => {
  LOG.debug('Creating Job Note Template');

  try {
    const JobNoteTemplate = await JobNoteTemplateDao.createJobNoteTemplateTemplate(notes);

    return JobNoteTemplate;
  } catch (err) {
    throw err;
  }
};

export const getJobNoteTemplateById = async (id: number): Promise<JobNoteTemplateResponseModel> => {
  LOG.debug('Getting Job Note Template full details from id');

  const JobNoteTemplate = await JobNoteTemplateDao.getJobNoteTemplateTemplateById(id);

  if (!JobNoteTemplate) {
    throw new JobNoteTemplateNotFoundError(id);
  }

  return JobNoteTemplate.toResponseFormat();
};

/**
 * To Edit a Job Note Template in the system, based on user choose and inputed new data
 *
 * @param id of Job Note Template
 * @param notes of the Job Note Template
 *
 * @returns void
 */
export const editJobNoteTemplate = async (id: number, notes: string): Promise<JobNoteTemplate> => {
  LOG.debug('Editing Job Note Template');

  const JobNoteTemplate = await JobNoteTemplateDao.getJobNoteTemplateTemplateById(id);

  if (!JobNoteTemplate) {
    throw new JobNoteTemplateNotFoundError(id);
  }

  try {
    return await JobNoteTemplate.update({ notes });
  } catch (err) {
    throw err;
  }
};

/**
 * To delete Job Note Template (hard delete)
 *
 * @param JobNoteTemplateId of the Job Note Template to be deleted
 *
 * @returns void
 */
export const deleteJobNoteTemplate = async (id: number): Promise<void> => {
  await JobNoteTemplateDao.deleteJobNoteTemplate(id);
};
