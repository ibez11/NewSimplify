import Logger from '../Logger';
import JobExpensesItem from '../database/models/JobExpensesItem';
import * as JobExpensesItemDao from '../database/dao/JobExpensesItemDao';
import * as JobExpensesDao from '../database/dao/JobExpensesDao';

import JobExpensesItemNotFoundError from '../errors/JobExpensesItemNotFoundError';
import { Transaction } from 'sequelize/types';

const LOG = new Logger('JobExpensesItemService');

export const getJobExpensesItemById = (id: number): Promise<JobExpensesItem> => {
  LOG.debug('Get checklist job item by id');

  return JobExpensesItemDao.getJobExpensesItemByid(id);
};

/**
 * Create a job expenses item in the system
 *
 * @param itemName of the job expenses item
 * @param price of the job expenses item
 * @param remarks of the job expenses item
 * @param jobExpensesId of the job expenses item
 *
 * @returns job expenses item Detail
 */
export const createJobExpensesItem = async (jobExpensesId: number, itemName: string, remarks?: string, price?: number): Promise<JobExpensesItem> => {
  LOG.debug('Creating job expenses item');

  try {
    const jobExpensesItem = await JobExpensesItemDao.createJobExpensesItem(jobExpensesId, itemName, remarks, price);
    const jobExpenses = await JobExpensesDao.getJobExpensesById(jobExpensesItem.jobExpensesId);
    const expensesItems = await JobExpensesItemDao.getJobExpensesItemByJobExpensesId(jobExpensesItem.jobExpensesId);
    const totalExpenses = expensesItems.map(item => item.price).reduce((acc, curr) => acc + curr, 0);
    await jobExpenses.update({ totalExpenses });

    return JobExpensesItemDao.getJobExpensesItemByid(jobExpensesItem.id);
  } catch (err) {
    throw err;
  }
};

/**
 * edit a job expenses item in the system
 *
 * @param itemName of the job expenses item
 * @param price of the job expenses item
 * @param remarks of the job expenses item
 *
 * @returns job expenses item Detail
 */
export const editJobExpensesItem = async (id: number, itemName: string, remarks: string, price: number): Promise<JobExpensesItem> => {
  LOG.debug('Editing job expenses item');

  const jobExpensesItem = await JobExpensesItemDao.getJobExpensesItemByid(id);
  const jobExpenses = await JobExpensesDao.getJobExpensesById(jobExpensesItem.jobExpensesId);

  if (!jobExpensesItem) {
    throw new JobExpensesItemNotFoundError(id);
  }

  try {
    await jobExpensesItem.update({ itemName, price, remarks });
    if (price) {
      const expensesItems = await JobExpensesItemDao.getJobExpensesItemByJobExpensesId(jobExpensesItem.jobExpensesId);
      const totalExpenses = expensesItems.map(item => item.price).reduce((acc, curr) => acc + curr, 0);
      await jobExpenses.update({ totalExpenses });
    }
    return JobExpensesItemDao.getJobExpensesItemByid(id);
  } catch (err) {
    throw err;
  }
};

export const deleteJobExpensesItemById = async (id: number, transaction: Transaction): Promise<void> => {
  const jobExpensesItem = await JobExpensesItemDao.getJobExpensesItemByid(id);
  const jobExpenses = await JobExpensesDao.getJobExpensesById(jobExpensesItem.jobExpensesId);

  const totalExpenses = jobExpenses.totalExpenses - jobExpensesItem.price;
  await jobExpenses.update({ totalExpenses });
  await JobExpensesItemDao.deleteJobExpensesItemById(id, transaction);
};
