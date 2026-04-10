import Logger from '../Logger';
import ChecklistTemplate from '../database/models/ChecklistTemplate';
import * as ChecklistTemplateDao from '../database/dao/ChecklistTemplateDao';
import * as ChecklistItemTemplateDao from '../database/dao/ChecklistItemTemplateDao';

import ChecklistTemplateNotFoundError from '../errors/ChecklistTemplateNotFoundError';
import DuplicatedChecklistError from '../errors/DuplicatedChecklistError';
import { ChecklistTemplateResponseModel, NewChecklistItemTemplateResponseModel } from '../typings/ResponseFormats';

const LOG = new Logger('ChecklistTemplateService');

/**
 * Search Checklist Template with query and optional pagination
 *
 * @param s offset for pagination search
 * @param l limit for pagination search
 * @param q query for searching
 *
 * @returns the total counts and the data for current page
 */
export const searchChecklistTemplatesWithPagination = (
  offset: number,
  limit?: number,
  q?: string
): Promise<{ rows: ChecklistTemplate[]; count: number }> => {
  LOG.debug('Searching Checklist Templates with Pagination');

  return ChecklistTemplateDao.getPaginated(offset, limit, q);
};

/**
 * Check if a service item exists
 *
 * @param ChecklistName of the required service item
 *
 * @returns boolean
 */
export const isChecklistExistsByChecklistName = (ChecklistName: string): Promise<ChecklistTemplate> => {
  LOG.debug('Checking Checklist Exists By Checklist Name');

  return ChecklistTemplateDao.countByChecklistName(ChecklistName);
};

/**
 * Create a new service item template in the system, based on user input
 *
 * @param name of the new service item template
 * @param description of the new service item template
 * @param unitPrice of the new service item template
 *
 * @returns ChecklistTemplatesModel
 */
export const createChecklistTemplate = async (
  name: string,
  description: string,
  items: [{ name: string }]
): Promise<ChecklistTemplateResponseModel> => {
  LOG.debug('Creating Checklist Template');

  const existingChecklistName = await isChecklistExistsByChecklistName(name);

  if (existingChecklistName) {
    throw new DuplicatedChecklistError();
  }

  try {
    const checklist = await ChecklistTemplateDao.createChecklistTemplateWithoutTransaction(name, description);

    if (items) {
      const newChecklist: NewChecklistItemTemplateResponseModel[] = [];

      await Promise.all(
        items.map(async item => {
          newChecklist.push({
            checklistId: Number(checklist.id),
            name: item.name
          });
        })
      );

      await ChecklistItemTemplateDao.bulkCreateChecklistItemTemplate(newChecklist);
    }

    return await getChecklistTemplateFullDetailsById(checklist.id);
  } catch (err) {
    throw err;
  }
};

export const getChecklistTemplateFullDetailsById = async (id: number): Promise<ChecklistTemplateResponseModel> => {
  LOG.debug('Getting Checklist Template full details from id');

  const ChecklistTemplate = await ChecklistTemplateDao.getChecklistTemplateById(id);

  if (!ChecklistTemplate) {
    throw new ChecklistTemplateNotFoundError(id);
  }

  return ChecklistTemplate;
};

/**
 * To Edit a service item template in the system, based on user choose and inputed new data
 *
 * @param id of service item template
 * @param name of the service item template
 * @param description of the service item template
 * @param unitPrice of the service item template
 *
 * @returns void
 */
export const editChecklistTemplate = async (
  id: number,
  name: string,
  description: string,
  items: [{ name: string }]
): Promise<ChecklistTemplateResponseModel> => {
  LOG.debug('Editing Checklist Template');

  const checklistTemplate = await ChecklistTemplateDao.getChecklistTemplateById(id);

  if (!checklistTemplate) {
    throw new ChecklistTemplateNotFoundError(id);
  }

  const existingChecklistName: ChecklistTemplateResponseModel = await isChecklistExistsByChecklistName(name);

  if (existingChecklistName) {
    if (existingChecklistName.id != id) {
      throw new DuplicatedChecklistError();
    }
  }

  try {
    if (items) {
      await ChecklistItemTemplateDao.deleteItemByChecklistIdWithouTransaction(Number(checklistTemplate.id));

      const newChecklist: NewChecklistItemTemplateResponseModel[] = [];

      await Promise.all(
        items.map(async item => {
          newChecklist.push({
            checklistId: Number(checklistTemplate.id),
            name: item.name
          });
        })
      );

      await ChecklistItemTemplateDao.bulkCreateChecklistItemTemplate(newChecklist);
    }

    await checklistTemplate.update({ name, description });

    return await getChecklistTemplateFullDetailsById(id);
  } catch (err) {
    throw err;
  }
};

/**
 * To delete service item template (hard delete)
 *
 * @param ChecklistTemplateId of the service item template to be deleted
 *
 * @returns void
 */
export const deleteChecklistTemplate = async (id: number): Promise<void> => {
  await ChecklistTemplateDao.deleteChecklistTemplate(id);
};
