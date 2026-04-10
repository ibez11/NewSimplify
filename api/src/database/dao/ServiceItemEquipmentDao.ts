import { sequelize } from '../../config/database';
import { getTableName } from '../models';
import TableNames from '../enums/TableNames';
import { QueryTypes, Transaction } from 'sequelize';

// eslint-disable-next-line
export const create = (values: any[], transaction?: Transaction) => {
  const ServiceItemEquipment = getTableName(TableNames.ServiceItemEquipment);

  return sequelize.query(
    `INSERT INTO ${ServiceItemEquipment} ("serviceItemId", "equipmentId") VALUES ${values
      .map(value => `(${value.serviceItemId}, ${value.equipmentId})`)
      .join(', ')}`,
    {
      type: QueryTypes.INSERT,
      replacements: values,
      transaction
    }
  );
};

// eslint-disable-next-line
export const createWithoutTransaction = (values: any[]) => {
  const ServiceItemEquipment = getTableName(TableNames.ServiceItemEquipment);

  return sequelize.query(
    `INSERT INTO ${ServiceItemEquipment} ("serviceItemId", "equipmentId") VALUES ${values
      .map(value => `(${value.serviceItemId}, ${value.equipmentId})`)
      .join(', ')}`,
    {
      type: QueryTypes.INSERT,
      replacements: values
    }
  );
};

// eslint-disable-next-line
export const deleteDataByServiceItemId = async (serviceItemId: number): Promise<any> => {
  const ServiceItemEquipment = getTableName(TableNames.ServiceItemEquipment);
  return sequelize.query(`DELETE FROM  ${ServiceItemEquipment} WHERE "serviceItemId" = ${serviceItemId}`);
};

// eslint-disable-next-line
export const deleteDataByEquipmentId = async (equipmentId: number): Promise<any> => {
  const ServiceItemEquipment = getTableName(TableNames.ServiceItemEquipment);
  return sequelize.query(`DELETE FROM  ${ServiceItemEquipment} WHERE "equipmentId" = ${equipmentId}`);
};
