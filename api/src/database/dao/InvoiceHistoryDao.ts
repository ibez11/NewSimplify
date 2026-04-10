import { Op, WhereOptions } from 'sequelize';
import InvoiceHistory from '../models/InvoiceHistory';
import { getInvoiceHistoryModel } from '../models';

export const getPaginated = async (offset: number, limit: number, query?: string): Promise<{ rows: InvoiceHistory[]; count: number }> => {
  const model = getInvoiceHistoryModel();
  let where: WhereOptions = {};

  if (query) {
    where = {
      [Op.or]: {
        label: { [Op.iLike]: `%${query}%` },
        description: { [Op.iLike]: `%${query}%` }
      }
    };
  }

  return model.findAndCountAll<InvoiceHistory>({
    where,
    order: [['createdAt', 'DESC']],
    limit,
    offset
  });
};

export const createInvoiceHistory = async (invoiceId: number, label: string, description: string, updatedBy: string): Promise<InvoiceHistory> => {
  const model = getInvoiceHistoryModel();

  return await model.create<InvoiceHistory>({ invoiceId, label, description, updatedBy });
};

export const getHistoryByInvoiceId = async (invoiceId: number): Promise<InvoiceHistory[]> => {
  const model = getInvoiceHistoryModel();

  return model.findAll<InvoiceHistory>({ where: { invoiceId }, order: [['createdAt', 'DESC']] });
};
