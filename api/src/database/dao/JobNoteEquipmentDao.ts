import { sequelize } from '../../config/database';
import { getTableName } from '../models';
import TableNames from '../enums/TableNames';
import { QueryTypes, Transaction } from 'sequelize';

// eslint-disable-next-line
export const create = (values: any[], transaction?: Transaction) => {
  const JobNoteEquipment = getTableName(TableNames.JobNoteEquipment);

  return sequelize.query(
    `INSERT INTO ${JobNoteEquipment} ("jobNoteId", "equipmentId") VALUES ${values
      .map(value => `(${value.jobNoteId}, ${value.equipmentId})`)
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
  const JobNoteEquipment = getTableName(TableNames.JobNoteEquipment);

  return sequelize.query(
    `INSERT INTO ${JobNoteEquipment} ("jobNoteId", "equipmentId") VALUES ${values
      .map(value => `(${value.jobNoteId}, ${value.equipmentId})`)
      .join(', ')}`,
    {
      type: QueryTypes.INSERT,
      replacements: values
    }
  );
};

// eslint-disable-next-line
export const deleteDataByJobNoteId = async (jobNoteId: number): Promise<any> => {
  const JobNoteEquipment = getTableName(TableNames.JobNoteEquipment);
  return sequelize.query(`DELETE FROM  ${JobNoteEquipment} WHERE "jobNoteId" = ${jobNoteId}`);
};

// eslint-disable-next-line
export const deleteDataByEquipmentId = async (equipmentId: number): Promise<any> => {
  const JobNoteEquipment = getTableName(TableNames.JobNoteEquipment);
  return sequelize.query(`DELETE FROM  ${JobNoteEquipment} WHERE "equipmentId" = ${equipmentId}`);
};
