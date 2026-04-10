import { Transaction } from 'sequelize';
import { getJobDocumentModel } from '../models';
import JobDocument from '../models/JobDocument';

export const getById = async (id: number): Promise<JobDocument> => {
  const model = getJobDocumentModel();

  return model.findByPk<JobDocument>(id);
};

export const getJobDocumentByJobId = async (jobId: number): Promise<{ rows: JobDocument[]; count: number }> => {
  const model = getJobDocumentModel();

  return model.findAndCountAll<JobDocument>({ where: { jobId }, order: [['id', 'asc']] });
};

export const createJobDocument = async (notes: string, documentUrl: string, jobId: number): Promise<JobDocument> => {
  const model = getJobDocumentModel();

  return model.create<JobDocument>({
    notes,
    documentUrl,
    isHide: false,
    jobId
  });
};

// eslint-disable-next-line
export const deleteJobById = async (id: number, transaction: Transaction): Promise<any> => {
  const model = getJobDocumentModel();

  return model.destroy({ where: { id }, transaction });
};
