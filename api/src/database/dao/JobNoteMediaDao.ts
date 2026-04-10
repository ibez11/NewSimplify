import { Transaction } from 'sequelize';
import { getJobNoteMediaModel } from '../models';
import JobNoteMedia from '../models/JobNoteMedia';
import { Op } from 'sequelize';

export const getById = async (id: number): Promise<JobNoteMedia> => {
  const model = getJobNoteMediaModel();

  return model.findByPk<JobNoteMedia>(id);
};

export const getJobNoteMediaByJobNoteId = async (jobNoteId: number): Promise<{ rows: JobNoteMedia[]; count: number }> => {
  const model = getJobNoteMediaModel();

  return model.findAndCountAll<JobNoteMedia>({
    where: { jobNoteId, fileName: { [Op.and]: [{ [Op.not]: null }, { [Op.not]: '' }] } },
    order: [['id', 'asc']]
  });
};

export const createJobNoteMedia = async (jobNoteId: number, fileName: string, fileType: string): Promise<JobNoteMedia> => {
  const model = getJobNoteMediaModel();

  return model.create<JobNoteMedia>({ jobNoteId, fileName, fileType });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const bulkCreateJobNoteMedia = async (value: any[], transaction?: Transaction): Promise<any> => {
  const model = getJobNoteMediaModel();

  return model.bulkCreate(value, { validate: false, transaction });
};

// eslint-disable-next-line
export const deleteJobNoteMediaById = async (id: number, transaction: Transaction): Promise<any> => {
  const model = getJobNoteMediaModel();

  return model.destroy({ where: { id }, transaction });
};

// eslint-disable-next-line
export const deleteJobNoteMediaByJobNoteId = async (jobNoteId: number, transaction?: Transaction): Promise<any> => {
  const model = getJobNoteMediaModel();

  return model.destroy({ where: { jobNoteId }, transaction });
};
