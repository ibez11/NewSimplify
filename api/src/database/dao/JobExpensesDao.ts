import { Transaction } from 'sequelize';
import { getJobExpensesModel, getJobExpensesItemModel } from '../models';
import JobExpenses from '../models/JobExpenses';

export const createJobExpenses = async (
  jobId: number,
  serviceId: number,
  header: string,
  remarks: string,
  totalExpenses: number,
  transaction?: Transaction
): Promise<JobExpenses> => {
  const model = getJobExpensesModel();

  return model.create<JobExpenses>(
    {
      jobId,
      serviceId,
      header,
      remarks,
      totalExpenses
    },
    { transaction }
  );
};

export const createJobExpensesWithoutTransaction = async (
  jobId: number,
  serviceId: number,
  header: string,
  remarks: string,
  totalExpenses: number
): Promise<JobExpenses> => {
  const model = getJobExpensesModel();

  return model.create<JobExpenses>({
    jobId,
    serviceId,
    header,
    remarks,
    totalExpenses
  });
};

export const getJobExpensesById = async (id: number): Promise<JobExpenses> => {
  const model = getJobExpensesModel();
  const modelItems = getJobExpensesItemModel();

  const include = [{ model: modelItems, required: false, as: 'JobExpensesItems', attributes: ['id', 'itemName', 'price', 'remarks'] }];

  return model.findOne<JobExpenses>({ where: { id }, include, order: [['id', 'asc']] });
};

export const getJobExpensesByJobId = async (id: number): Promise<JobExpenses[]> => {
  const model = getJobExpensesModel();
  const modelItems = getJobExpensesItemModel();

  const include = [{ model: modelItems, required: false, as: 'JobExpensesItems', attributes: ['id', 'itemName', 'price', 'remarks'] }];

  return model.findAll<JobExpenses>({ where: { jobId: id }, include });
};

export const getJobExpensesByServiceId = async (id: number): Promise<JobExpenses[]> => {
  const model = getJobExpensesModel();
  const modelItems = getJobExpensesItemModel();

  const include = [{ model: modelItems, required: false, as: 'JobExpensesItems', attributes: ['id', 'itemName', 'price', 'remarks'] }];

  return model.findAll<JobExpenses>({ where: { serviceId: id }, include });
};

export const deleteJobExpenses = async (id: number, transaction?: Transaction): Promise<void> => {
  const model = getJobExpensesModel();

  await model.destroy({ where: { id }, transaction });
};

export const deleteJobExpensesByJobId = async (jobId: number): Promise<void> => {
  const model = getJobExpensesModel();

  await model.destroy({ where: { jobId } });
};

export const deleteJobExpensesByServiceId = async (serviceId: number): Promise<void> => {
  const model = getJobExpensesModel();

  await model.destroy({ where: { serviceId } });
};
