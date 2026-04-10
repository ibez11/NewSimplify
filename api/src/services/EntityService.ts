import Logger from '../Logger';
import Entity from '../database/models/Entity';
import * as EntityDao from '../database/dao/EntityDao';
import EntityNotFoundError from '../errors/EntityNotFoundError';
import { Transaction } from 'sequelize';

const LOG = new Logger('EntityService.ts');

/**
 * get all entities
 * @returns the total counts and the data for current page
 */
export const getAllEntities = async (): Promise<{ rows: Entity[]; count: number }> => {
  LOG.debug('Searching All Entities');
  const { rows, count } = await EntityDao.getAllEntities();

  return { rows, count };
};

/**
 * get last entities
 * @returns the last entity
 */
export const getLastEntity = async (): Promise<Entity> => {
  LOG.debug('Searching All Entities');
  const entity = await EntityDao.getLastEntity();

  return entity;
};

/**
 * Create a new entity in the system, based on user input
 *
 * @param name of the new entity
 * @param address of the new entity
 * @param contactNumber of the entity
 * @param email of the entity
 * @param registerNumberGST of the entity
 *
 * @returns Entity
 */
export const createEntity = async (
  name: string,
  address: string,
  logo: string,
  countryCode: string,
  contactNumber: string,
  email: string,
  needGST: boolean,
  qrImage: string,
  registerNumberGST: string,
  invoiceFooter: string,
  uenNumber: string
): Promise<Entity> => {
  LOG.debug('Creating Entity');

  try {
    const entity = await EntityDao.create(
      name,
      address,
      logo,
      countryCode,
      contactNumber,
      email,
      needGST,
      qrImage,
      registerNumberGST,
      invoiceFooter,
      uenNumber
    );

    return entity;
  } catch (err) {
    throw err;
  }
};

/**
 * Edit new entity in the system, based on user input
 *
 * @param id of the entity
 * @param name of the entity
 * @param address of the entity
 * @param contactNumber of the entity
 * @param email of the entity
 *
 * @returns Entity
 */
export const editEntity = async (
  id: number,
  name: string,
  address: string,
  logo: string,
  countryCode: string,
  contactNumber: string,
  email: string,
  needGST: boolean,
  qrImage: string,
  registerNumberGST: string,
  invoiceFooter: string,
  uenNumber: string
): Promise<Entity> => {
  LOG.debug('Editing Entity');

  const entity = await EntityDao.getById(id);

  if (!entity) {
    throw new EntityNotFoundError(id);
  }
  try {
    return await entity.update({
      name,
      address,
      logo: logo ? logo : null,
      countryCode: countryCode || '+65',
      contactNumber,
      email,
      needGST,
      qrImage,
      registerNumberGST,
      invoiceFooter,
      uenNumber
    });
  } catch (err) {
    throw err;
  }
};

/**
 * To delete entity (hard delete)
 *
 * @param entityId of the entity to be deleted
 *
 * @returns void
 */
// eslint-disable-next-line
export const deleteEntity = async (id: number, transaction: Transaction): Promise<any> => {
  await EntityDao.deleteEntityById(id, transaction);
};

export const getEntitybyId = async (id: number): Promise<Entity> => {
  return await EntityDao.getById(id);
};
