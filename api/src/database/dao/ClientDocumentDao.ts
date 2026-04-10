import { Transaction } from 'sequelize';
import { getClientDocumentModel } from '../models';
import ClientDocument from '../models/ClientDocument';

export const getById = async (id: number): Promise<ClientDocument> => {
  const model = getClientDocumentModel();

  return model.findByPk<ClientDocument>(id);
};

export const getClientDocumentByClientId = async (clientId: number): Promise<{ rows: ClientDocument[]; count: number }> => {
  const model = getClientDocumentModel();

  return model.findAndCountAll<ClientDocument>({ where: { clientId }, order: [['id', 'asc']] });
};

export const createClientDocument = async (notes: string, documentUrl: string, clientId: number): Promise<ClientDocument> => {
  const model = getClientDocumentModel();

  return model.create<ClientDocument>({
    notes,
    documentUrl,
    isHide: false,
    clientId
  });
};

// eslint-disable-next-line
export const deleteClientById = async (id: number, transaction: Transaction): Promise<any> => {
  const model = getClientDocumentModel();

  return model.destroy({ where: { id }, transaction });
};
