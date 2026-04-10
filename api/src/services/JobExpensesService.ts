import Logger from '../Logger';
import JobExpenses from '../database/models/JobExpenses';
import JobExpensesItem from '../database/models/JobExpensesItem';
import * as JobDao from '../database/dao/JobDao';
import * as JobExpensesDao from '../database/dao/JobExpensesDao';
import * as JobExpensesItemDao from '../database/dao/JobExpensesItemDao';

import JobExpensesNotFoundError from '../errors/JobExpensesNotFoundError';
import { Transaction } from 'sequelize';

const LOG = new Logger('JobExpensesService');

export const getJobExpensesById = (id: number): Promise<JobExpenses> => {
  LOG.debug('Get job expenses by id');

  return JobExpensesDao.getJobExpensesById(id);
};

export const getJobExpensesByJobId = (jobId: number): Promise<JobExpenses[]> => {
  LOG.debug('Get job expenses by job id');

  return JobExpensesDao.getJobExpensesByJobId(jobId);
};

export const getJobExpensesByServiceId = (serviceId: number): Promise<JobExpenses[]> => {
  LOG.debug('Get job expenses by service id');

  return JobExpensesDao.getJobExpensesByServiceId(serviceId);
};

/**
 * Create a job expenses in the system
 *
 * @param header of the job expenses
 * @param remarks of the job expenses
 * @param jobId of the job expenses
 * @param serviceId of the job expenses
 * @param expensesItems of the job expenses
 *
 * @returns job expenses Detail
 */
export const createJobExpenses = async (jobId: number, header: string, remarks?: string, expensesItems?: JobExpensesItem[]): Promise<JobExpenses> => {
  LOG.debug('Creating job expenses');

  try {
    const totalExpenses = expensesItems.map(item => item.price).reduce((acc, curr) => acc + curr, 0);
    const job = await JobDao.getJobDetailById(jobId);
    const jobExpenses = await JobExpensesDao.createJobExpenses(jobId, job.row.serviceId, header, remarks, totalExpenses);

    expensesItems.map(item => {
      delete item.id;

      item.jobExpensesId = jobExpenses.id;
    });

    await JobExpensesItemDao.bulkCreateJobExpensesItem(expensesItems);

    return JobExpensesDao.getJobExpensesById(jobExpenses.id);
  } catch (err) {
    throw err;
  }
};

/**
 * edit a job expenses in the system
 *
 * @param header of the job expenses
 * @param remarks of the job expenses
 * @param jobId of the job expenses
 * @param serviceId of the job expenses
 * @param expensesItems of the job expenses
 *
 * @returns job expenses Detail
 */
export const editJobExpenses = async (id: number, header: string, remarks: string, expensesItems: JobExpensesItem[]): Promise<JobExpenses> => {
  LOG.debug('Editing job expenses');

  const jobExpenses = await JobExpensesDao.getJobExpensesById(id);

  if (!jobExpenses) {
    throw new JobExpensesNotFoundError(id);
  }

  try {
    await JobExpensesItemDao.deleteJobExpensesItemByJobExpensesId(id);

    if (expensesItems && expensesItems.length > 0) {
      expensesItems.map(item => {
        delete item.id;

        item.jobExpensesId = jobExpenses.id;
      });

      await JobExpensesItemDao.bulkCreateJobExpensesItem(expensesItems);
    }
    const totalExpenses = expensesItems.map(item => item.price).reduce((acc, curr) => acc + curr, 0);
    await jobExpenses.update({ header, remarks, totalExpenses });
    return JobExpensesDao.getJobExpensesById(jobExpenses.id);
  } catch (err) {
    throw err;
  }
};

export const deleteJobExpenses = async (id: number, transaction: Transaction): Promise<void> => {
  await JobExpensesItemDao.deleteJobExpensesItemByJobExpensesId(id, transaction);

  await JobExpensesDao.deleteJobExpenses(id, transaction);
};
