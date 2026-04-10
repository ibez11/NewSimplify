import { getEntityModel } from '../models';
import Entity from '../models/Entity';
import { Transaction } from 'sequelize';

export const getAllEntities = async (): Promise<{ rows: Entity[]; count: number }> => {
  const model = getEntityModel();

  return model.findAndCountAll<Entity>({
    order: [['name', 'ASC']]
  });
};

// eslint-disable-next-line
export const deleteEntityById = async (id: number, transaction: Transaction): Promise<any> => {
  const model = getEntityModel();

  await model.destroy({ where: { id }, transaction });
};

export const create = async (
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
  const model = getEntityModel();

  return model.create<Entity>({
    name,
    address,
    logo,
    countryCode: countryCode || '+65',
    contactNumber,
    email,
    needGST,
    qrImage,
    registerNumberGST,
    invoiceFooter,
    uenNumber
  });
};

export const getById = async (id: number): Promise<Entity> => {
  const model = getEntityModel();

  return model.findByPk<Entity>(id);
};

export const getLastEntity = async (): Promise<Entity> => {
  const model = getEntityModel();

  const entities = await model.findAll<Entity>({ limit: 1, order: [['createdAt', 'DESC']] });
  return entities[0];
};
