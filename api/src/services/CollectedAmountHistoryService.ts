import CollectedAmountHistory from '../database/models/CollectedAmountHistory';
import * as CollectedAmountHistoryDao from '../database/dao/CollectedAmountHistoryDao';

export const createCollectedAmountHistory = async (
  serviceId: number,
  collectedBy: string,
  collectedAmount: number,
  paymentMethod?: string,
  invoiceId?: number,
  jobId?: number,
  isDeleted?: boolean
): Promise<CollectedAmountHistory> => {
  return await CollectedAmountHistoryDao.createCollectedAmountHistory(
    serviceId,
    collectedBy,
    collectedAmount,
    paymentMethod,
    invoiceId,
    jobId,
    isDeleted
  );
};

export const getHistoryByServiceId = async (serviceId: number): Promise<CollectedAmountHistory[]> => {
  const invoiceHistory = await CollectedAmountHistoryDao.getHistoryByServiceId(serviceId);

  return invoiceHistory;
};

export const getHistoryByJobId = async (jobId: number): Promise<CollectedAmountHistory[]> => {
  const invoiceHistory = await CollectedAmountHistoryDao.getHistoryByJobId(jobId);

  return invoiceHistory;
};
