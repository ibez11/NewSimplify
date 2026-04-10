import { Op, Transaction } from 'sequelize';
import { getChecklistJobModel, getChecklistJobItemModel } from '../models';
import ChecklistJob from '../models/ChecklistJob';

export const createChecklistJob = async (
  jobId: number,
  name: string,
  description: string,
  remarks: string,
  transaction?: Transaction
): Promise<ChecklistJob> => {
  const model = getChecklistJobModel();

  return model.create<ChecklistJob>(
    {
      jobId,
      name,
      description,
      remarks
    },
    { transaction }
  );
};

export const createChecklistJobWithoutTransaction = async (
  jobId: number,
  name: string,
  description: string,
  remarks: string
): Promise<ChecklistJob> => {
  const model = getChecklistJobModel();

  return model.create<ChecklistJob>({
    jobId,
    name,
    description,
    remarks
  });
};

export const getChecklistJobById = async (id: number): Promise<ChecklistJob> => {
  const model = getChecklistJobModel();
  const modelItems = getChecklistJobItemModel();

  const include = [{ model: modelItems, required: false, as: 'ChecklistItems', attributes: ['id', 'name', 'status', 'remarks'] }];

  return model.findOne<ChecklistJob>({ where: { id }, include, order: [['id', 'asc']] });
};

export const getChecklistJobByJobId = async (id: number): Promise<ChecklistJob[]> => {
  const model = getChecklistJobModel();
  const modelItems = getChecklistJobItemModel();

  const include = [{ model: modelItems, required: false, as: 'ChecklistItems', attributes: ['id', 'name', 'status', 'remarks'] }];

  return model.findAll<ChecklistJob>({ where: { jobId: id }, include });
};

export const deleteChecklistJob = async (id: number, transaction?: Transaction): Promise<void> => {
  const model = getChecklistJobModel();

  await model.destroy({ where: { id }, transaction });
};

export const deleteChecklistJobByJobId = async (jobId: number): Promise<void> => {
  const model = getChecklistJobModel();

  await model.destroy({ where: { jobId } });
};

export const bulkDeleteChecklistJobByJobId = async (jobId: number[]): Promise<void> => {
  const model = getChecklistJobModel();

  await model.destroy({ where: { jobId: { [Op.in]: jobId } } });
};
