import InvoiceHistory from '../database/models/InvoiceHistory';
import * as InvoiceHistoryDao from '../database/dao/InvoiceHistoryDao';
import * as UserProfileDao from '../database/dao/UserProfileDao';

export const createInvoiceHistory = async (userId: number, invoiceId: number, label: string, description: string): Promise<InvoiceHistory> => {
  const userProfile = await UserProfileDao.getUserFullDetails(userId);

  return await InvoiceHistoryDao.createInvoiceHistory(invoiceId, label, description, userProfile.displayName);
};

export const getHistoryByInvoiceId = async (invoiceId: number): Promise<InvoiceHistory[]> => {
  const invoiceHistory = await InvoiceHistoryDao.getHistoryByInvoiceId(invoiceId);

  return invoiceHistory;
};
