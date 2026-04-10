import { Op, WhereOptions } from 'sequelize';
import CollectedAmountHistory from '../models/CollectedAmountHistory';
import { getCollectedAmountHistoryModel } from '../models';

export const getPaginated = async (offset: number, limit: number, query?: string): Promise<{ rows: CollectedAmountHistory[]; count: number }> => {
  const model = getCollectedAmountHistoryModel();
  let where: WhereOptions = {};

  if (query) {
    where = {
      [Op.or]: {
        collectedBy: { [Op.iLike]: `%${query}%` }
      }
    };
  }

  return model.findAndCountAll<CollectedAmountHistory>({
    where,
    order: [['createdAt', 'DESC']],
    limit,
    offset
  });
};

export const createCollectedAmountHistory = async (
  serviceId: number,
  collectedBy: string,
  collectedAmount: number,
  paymentMethod?: string,
  invoiceId?: number,
  jobId?: number,
  isDeleted?: boolean
): Promise<CollectedAmountHistory> => {
  const model = getCollectedAmountHistoryModel();

  return await model.create<CollectedAmountHistory>({ serviceId, collectedBy, collectedAmount, paymentMethod, invoiceId, jobId, isDeleted });
};

export const getHistoryByServiceId = async (serviceId: number): Promise<CollectedAmountHistory[]> => {
  const model = getCollectedAmountHistoryModel();

  return model.findAll<CollectedAmountHistory>({ where: { serviceId, isDeleted: false } });
};

export const getHistoryByJobId = async (jobId: number): Promise<CollectedAmountHistory[]> => {
  const model = getCollectedAmountHistoryModel();

  return model.findAll<CollectedAmountHistory>({ where: { jobId, isDeleted: false } });
};

export const softDeleteByInvoiceId = async (invoiceId: number): Promise<void> => {
  const model = getCollectedAmountHistoryModel();

  await model.update({ isDeleted: true }, { where: { invoiceId } });
};

export const softDeleteByJobId = async (jobId: number): Promise<void> => {
  const model = getCollectedAmountHistoryModel();

  await model.update({ isDeleted: true }, { where: { jobId } });
};
