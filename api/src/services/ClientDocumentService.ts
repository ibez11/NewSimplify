import Logger from '../Logger';
import ClientDocument from '../database/models/ClientDocument';
import * as ClientDocumentDao from '../database/dao/ClientDocumentDao';
import ClientDocumentNotFoundError from '../errors/ClientDocumentNotFoundError';
import { Transaction } from 'sequelize';

const LOG = new Logger('ClientDocumentService');

export const getClientDocumentById = (clientDocumentId: number): Promise<ClientDocument> => {
  LOG.debug('Get client document by id');

  return ClientDocumentDao.getById(clientDocumentId);
};

export const getClientDocumentByClientId = (clientId: number): Promise<{ rows: ClientDocument[]; count: number }> => {
  LOG.debug('Get client document by client id');

  return ClientDocumentDao.getClientDocumentByClientId(clientId);
};

/**
 * Create a client document in the system
 *
 * @param notes of the client document
 * @param documentUrl of the client document
 * @param clientId of the client document
 *
 * @returns client document Detail
 */
export const createClientDocument = (notes: string, documentUrl: string, clientId: number): Promise<ClientDocument> => {
  LOG.debug('Creating client document');

  try {
    return ClientDocumentDao.createClientDocument(notes, documentUrl, clientId);
  } catch (err) {
    throw err;
  }
};

/**
 * edit a client document in the system
 *
 * @param notes of the client document
 * @param documentUrl of the client document
 * @param isHide of the client document
 *
 * @returns client document Detail
 */
export const editClientDocument = async (id: number, notes: string, documentUrl: string, isHide: boolean): Promise<ClientDocument> => {
  LOG.debug('Editing client document');

  const clientDocument = await ClientDocumentDao.getById(id);

  if (!clientDocument) {
    throw new ClientDocumentNotFoundError(id);
  }

  try {
    return await clientDocument.update({ notes, documentUrl, isHide });
  } catch (err) {
    throw err;
  }
};

export const deleteClientDocument = async (id: number, transaction: Transaction): Promise<void> => {
  await ClientDocumentDao.deleteClientById(id, transaction);
};
