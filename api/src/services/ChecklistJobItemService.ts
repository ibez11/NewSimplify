import Logger from '../Logger';
import ChecklistJobItem from '../database/models/ChecklistJobItem';
import * as ChecklistJobItemDao from '../database/dao/ChecklistJobItemDao';

import ChecklistJobItemNotFoundError from '../errors/ChecklistJobItemNotFoundError';

const LOG = new Logger('ChecklistJobItemService');

export const getChecklistJobItemById = (checklistJobIdId: number): Promise<ChecklistJobItem> => {
  LOG.debug('Get checklist job item by id');

  return ChecklistJobItemDao.getChecklistJobItemByid(checklistJobIdId);
};

/**
 * Create a checklist job item in the system
 *
 * @param checklistJobId of the checklist job item
 * @param name of the checklist job item
 * @param status of the checklist job item
 * @param remarks of the checklist job item
 *
 * @returns checklist job item Detail
 */
export const createChecklistJobItem = async (checklistJobId: number, name: string, status?: boolean, remarks?: string): Promise<ChecklistJobItem> => {
  LOG.debug('Creating checklist job item');

  try {
    const checklistJobItem = await ChecklistJobItemDao.createChecklistJobItem(checklistJobId, name, status, remarks);

    return ChecklistJobItemDao.getChecklistJobItemByid(checklistJobItem.id);
  } catch (err) {
    throw err;
  }
};

/**
 * edit a checklist job item in the system
 *
 * @param name of the checklist job item
 * @param remarks of the checklist job item
 *
 * @returns checklist job item Detail
 */
export const editChecklistJobItem = async (id: number, name: string, remarks: string): Promise<ChecklistJobItem> => {
  LOG.debug('Editing checklist job item');

  const checklistJobItem = await ChecklistJobItemDao.getChecklistJobItemByid(id);

  if (!checklistJobItem) {
    throw new ChecklistJobItemNotFoundError(id);
  }

  try {
    await checklistJobItem.update({ name, remarks });
    return ChecklistJobItemDao.getChecklistJobItemByid(id);
  } catch (err) {
    throw err;
  }
};

export const deleteChecklistJobItemById = async (id: number): Promise<void> => {
  await ChecklistJobItemDao.deleteChecklistJobItemById(id);
};
