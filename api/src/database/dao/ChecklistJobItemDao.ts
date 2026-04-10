import { Transaction } from 'sequelize';
import { getChecklistJobItemModel } from '../models';
import ChecklistJobItem from '../models/ChecklistJobItem';

export const createChecklistJobItem = async (
  checklistJobId: number,
  name: string,
  status: boolean,
  remarks?: string,
  transaction?: Transaction
): Promise<ChecklistJobItem> => {
  const model = getChecklistJobItemModel();

  return model.create<ChecklistJobItem>(
    {
      checklistJobId,
      name,
      status,
      remarks
    },
    { transaction }
  );
};

// eslint-disable-next-line
export const bulkCreateChecklistJobItem = async (value: ChecklistJobItem[], transaction?: Transaction): Promise<any> => {
  const model = getChecklistJobItemModel();

  return model.bulkCreate(value, { validate: false, transaction });
};

// eslint-disable-next-line
export const bulkCreateChecklistJobItemWithoutTransaction = async (value: ChecklistJobItem[]): Promise<any> => {
  const model = getChecklistJobItemModel();

  return model.bulkCreate(value, { validate: false });
};

export const deleteChecklistJobItemById = async (id: number): Promise<void> => {
  const model = getChecklistJobItemModel();

  await model.destroy({ where: { id } });
};

export const deleteChecklistJobItemByChecklistJobId = async (checklistJobId: number, transaction?: Transaction): Promise<void> => {
  const model = getChecklistJobItemModel();

  await model.destroy({ where: { checklistJobId }, transaction });
};

export const getChecklistJobItemByid = async (id: number): Promise<ChecklistJobItem> => {
  const model = getChecklistJobItemModel();

  return model.findByPk<ChecklistJobItem>(id);
};
