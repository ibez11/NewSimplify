import Logger from '../Logger';
import SkillTemplate from '../database/models/SkillTemplate';
import * as SkillTemplateDao from '../database/dao/SkillTemplateDao';
import SkillTemplateNotFoundError from '../errors/SkillTemplateNotFoundError';
import { SkillTemplateResponseModel } from '../typings/ResponseFormats';

const LOG = new Logger('SkillTemplateService');

/**
 * Search Skill Template with query and optional pagination
 *
 * @param s offset for pagination search
 * @param l limit for pagination search
 * @param q query for searching
 *
 * @returns the total counts and the data for current page
 */
export const searchSkillTemplatesWithPagination = async (
  offset: number,
  limit?: number,
  q?: string
): Promise<{ rows: SkillTemplate[]; count: number }> => {
  LOG.debug('Searching Skill Template with Pagination');

  return await SkillTemplateDao.getPaginated(offset, limit, q);
};

/**
 * Create a new Skill Template in the system, based on user input
 *
 * @param name of the new Skill Template
 * @param description of the new Skill Template
 * @param termCondition of the new Skill Template
 *
 * @returns SkillTemplatesModel
 */
export const createSkillTemplate = async (name: string, description: string): Promise<SkillTemplate> => {
  LOG.debug('Creating Skill Template');

  try {
    const SkillTemplate = await SkillTemplateDao.createSkillTemplate(name, description);

    return SkillTemplate;
  } catch (err) {
    throw err;
  }
};

export const getSkillTemplateById = async (id: number): Promise<SkillTemplateResponseModel> => {
  LOG.debug('Getting Skill Template full details from id');

  const SkillTemplate = await SkillTemplateDao.getSkillTemplateById(id);

  if (!SkillTemplate) {
    throw new SkillTemplateNotFoundError(id);
  }

  return SkillTemplate.toResponseFormat();
};

/**
 * To Edit a Skill Template in the system, based on user choose and inputed new data
 *
 * @param id of Skill Template
 * @param name of the Skill Template
 * @param description of the Skill Template
 *
 * @returns void
 */
export const editSkillTemplate = async (id: number, name: string, description: string): Promise<SkillTemplate> => {
  LOG.debug('Editing Skill Template');

  const SkillTemplate = await SkillTemplateDao.getSkillTemplateById(id);

  if (!SkillTemplate) {
    throw new SkillTemplateNotFoundError(id);
  }

  try {
    return await SkillTemplate.update({ name, description });
  } catch (err) {
    throw err;
  }
};

/**
 * To delete Skill Template (hard delete)
 *
 * @param SkillTemplateId of the Skill Template to be deleted
 *
 * @returns void
 */
export const deleteSkillTemplate = async (id: number): Promise<void> => {
  await SkillTemplateDao.deleteSkillTemplate(id);
};
