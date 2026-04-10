import { Transaction } from 'sequelize';
import { getJobExpensesItemModel } from '../models';
import JobExpensesItem from '../models/JobExpensesItem';

export const createJobExpensesItem = async (
  jobExpensesId: number,
  itemName: string,
  remarks?: string,
  price?: number,
  transaction?: Transaction
): Promise<JobExpensesItem> => {
  const model = getJobExpensesItemModel();

  return model.create<JobExpensesItem>(
    {
      jobExpensesId,
      itemName,
      remarks,
      price
    },
    { transaction }
  );
};

// eslint-disable-next-line
export const bulkCreateJobExpensesItem = async (value: JobExpensesItem[], transaction?: Transaction): Promise<any> => {
  const model = getJobExpensesItemModel();

  return model.bulkCreate(value, { validate: false, transaction });
};

// eslint-disable-next-line
export const bulkCreateJobExpensesItemWithoutTransaction = async (value: JobExpensesItem[]): Promise<any> => {
  const model = getJobExpensesItemModel();

  return model.bulkCreate(value, { validate: false });
};

export const deleteJobExpensesItemById = async (id: number, transaction?: Transaction): Promise<void> => {
  const model = getJobExpensesItemModel();

  await model.destroy({ where: { id }, transaction });
};

export const deleteJobExpensesItemByJobExpensesId = async (jobExpensesId: number, transaction?: Transaction): Promise<void> => {
  const model = getJobExpensesItemModel();

  await model.destroy({ where: { jobExpensesId }, transaction });
};

export const getJobExpensesItemByid = async (id: number): Promise<JobExpensesItem> => {
  const model = getJobExpensesItemModel();

  return model.findByPk<JobExpensesItem>(id);
};

export const getJobExpensesItemByJobExpensesId = async (id: number): Promise<JobExpensesItem[]> => {
  const model = getJobExpensesItemModel();

  return model.findAll<JobExpensesItem>({ where: { jobExpensesId: id } });
};
