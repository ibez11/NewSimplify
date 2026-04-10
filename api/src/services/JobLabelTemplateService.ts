import Logger from '../Logger';
import JobLabelTemplate from '../database/models/JobLabelTemplate';
import * as JobLabelTemplateDao from '../database/dao/JobLabelTemplateDao';
import JobLabelTemplateNotFoundError from '../errors/JobLabelTemplateNotFoundError';
import { JobLabelTemplateResponseModel } from '../typings/ResponseFormats';

const LOG = new Logger('JobLabelTemplateService');

/**
 * Search Job Label Template with query and optional pagination
 *
 * @param offset offset for pagination search
 * @param limit limit for pagination search
 * @param q query for searching
 *
 * @returns the total counts and the data for current page
 */
export const searchJobLabelTemplatesWithPagination = async (
  offset: number,
  limit?: number,
  q?: string
): Promise<{ rows: JobLabelTemplate[]; count: number }> => {
  LOG.debug('Searching Job Label Template with Pagination');

  return await JobLabelTemplateDao.getPaginated(offset, limit, q);
};

/**
 * Create a new Job Label Template in the system, based on user input
 *
 * @param name of the new Job Label Template
 * @param description of the new Job Label Template
 * @param color of the new Job Label Template
 *
 * @returns JobLabelTemplateResponseModel
 */
export const createJobLabelTemplate = async (name: string, description: string, color: string): Promise<JobLabelTemplate> => {
  LOG.debug('Creating Job Label Template');

  try {
    const JobLabelTemplate = await JobLabelTemplateDao.createJobLabelTemplateTemplate(name, description, color);

    return JobLabelTemplate;
  } catch (err) {
    throw err;
  }
};

export const getJobLabelTemplateById = async (id: number): Promise<JobLabelTemplateResponseModel> => {
  LOG.debug('Getting Job Label Template full details from id');

  const JobLabelTemplate = await JobLabelTemplateDao.getJobLabelTemplateTemplateById(id);

  if (!JobLabelTemplate) {
    throw new JobLabelTemplateNotFoundError(id);
  }

  return JobLabelTemplate.toResponseFormat();
};

/**
 * To Edit a Job Label Template in the system, based on user choose and inputed new data
 *
 * @param id of Job Label Template
 * @param name of the Job Label Template
 * @param description of the Job Label Template
 * @param color of the Job Label Template
 *
 * @returns void
 */
export const editJobLabelTemplate = async (id: number, name: string, description: string, color: string): Promise<JobLabelTemplate> => {
  LOG.debug('Editing Job Label Template');

  const JobLabelTemplate = await JobLabelTemplateDao.getJobLabelTemplateTemplateById(id);

  if (!JobLabelTemplate) {
    throw new JobLabelTemplateNotFoundError(id);
  }

  try {
    return await JobLabelTemplate.update({ name, description, color });
  } catch (err) {
    throw err;
  }
};

/**
 * To delete Job Label Template (hard delete)
 *
 * @param id of the Job Label Template to be deleted
 *
 * @returns void
 */
export const deleteJobLabelTemplate = async (id: number): Promise<void> => {
  await JobLabelTemplateDao.deleteJobLabelTemplate(id);
};
