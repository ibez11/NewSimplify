import Logger from '../Logger';
import ChecklistJob from '../database/models/ChecklistJob';
import ChecklistJobItem from '../database/models/ChecklistJobItem';
import * as ChecklistJobDao from '../database/dao/ChecklistJobDao';
import * as ChecklistJobItemDao from '../database/dao/ChecklistJobItemDao';

import ChecklistJobNotFoundError from '../errors/ChecklistJobNotFoundError';
import { Transaction } from 'sequelize';

const LOG = new Logger('ChecklistJobService');

export const getChecklistJobById = (checklistJobIdId: number): Promise<ChecklistJob> => {
  LOG.debug('Get checklist job by id');

  return ChecklistJobDao.getChecklistJobById(checklistJobIdId);
};

export const getChecklistJobByJobId = (jobId: number): Promise<ChecklistJob[]> => {
  LOG.debug('Get checklist job by job id');

  return ChecklistJobDao.getChecklistJobByJobId(jobId);
};

/**
 * Create a checklist job in the system
 *
 * @param notes of the checklist job
 * @param image of the checklist job
 * @param jobId of the checklist job
 *
 * @returns checklist job Detail
 */
export const createChecklistJob = async (
  jobId: number,
  name: string,
  description?: string,
  remarks?: string,
  checklistItems?: ChecklistJobItem[]
): Promise<ChecklistJob> => {
  LOG.debug('Creating checklist job');

  try {
    const checklistJob = await ChecklistJobDao.createChecklistJob(jobId, name, description, remarks);

    checklistItems.map(item => {
      delete item.id;

      item.checklistJobId = checklistJob.id;
      // item.status = false;
    });

    await ChecklistJobItemDao.bulkCreateChecklistJobItem(checklistItems);

    return ChecklistJobDao.getChecklistJobById(checklistJob.id);
  } catch (err) {
    throw err;
  }
};

/**
 * edit a checklist job in the system
 *
 * @param notes of the checklist job
 * @param image of the checklist job
 * @param isHide of the checklist job
 * @param jobId of the checklist job
 *
 * @returns checklist job Detail
 */
export const editChecklistJob = async (
  id: number,
  name: string,
  description: string,
  remarks: string,
  checklistItems: ChecklistJobItem[]
): Promise<ChecklistJob> => {
  LOG.debug('Editing checklist job');

  const checklistJob = await ChecklistJobDao.getChecklistJobById(id);

  if (!checklistJob) {
    throw new ChecklistJobNotFoundError(id);
  }

  try {
    await ChecklistJobItemDao.deleteChecklistJobItemByChecklistJobId(id);

    if (checklistItems && checklistItems.length > 0) {
      checklistItems.map(item => {
        delete item.id;

        item.checklistJobId = checklistJob.id;
      });

      await ChecklistJobItemDao.bulkCreateChecklistJobItem(checklistItems);
    }

    await checklistJob.update({ name, description, remarks });
    return ChecklistJobDao.getChecklistJobById(checklistJob.id);
  } catch (err) {
    throw err;
  }
};

export const deleteChecklistJob = async (id: number, transaction: Transaction): Promise<void> => {
  await ChecklistJobItemDao.deleteChecklistJobItemByChecklistJobId(id, transaction);

  await ChecklistJobDao.deleteChecklistJob(id, transaction);
};
