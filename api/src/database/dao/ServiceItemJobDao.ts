import { sequelize } from '../../config/database';
import { getTableName } from '../models';
import TableNames from '../enums/TableNames';
import { QueryTypes, Transaction } from 'sequelize';

// eslint-disable-next-line
export const create = async (values: any[], transaction?: Transaction): Promise<[number, number]> => {
  const ServiceItemJob = getTableName(TableNames.ServiceItemJob);

  return sequelize.query(
    `INSERT INTO ${ServiceItemJob} ("serviceItemId", "jobId") VALUES ${values.map(value => `(${value.serviceItemId}, ${value.jobId})`).join(', ')}`,
    {
      type: QueryTypes.INSERT,
      replacements: values,
      transaction
    }
  );
};

// eslint-disable-next-line
export const createWithoutTransaction = async (values: any[]): Promise<[number, number]> => {
  const ServiceItemJob = getTableName(TableNames.ServiceItemJob);

  return sequelize.query(
    `INSERT INTO ${ServiceItemJob} ("serviceItemId", "jobId") VALUES ${values.map(value => `(${value.serviceItemId}, ${value.jobId})`).join(', ')}`,
    {
      type: QueryTypes.INSERT,
      replacements: values
    }
  );
};

// eslint-disable-next-line
export const getByJobId = async (jobId: number): Promise<any> => {
  const ServiceItemJob = getTableName(TableNames.ServiceItemJob);

  return sequelize.query(`SELECT * FROM ${ServiceItemJob} WHERE "jobId" = ${jobId}`, {
    type: QueryTypes.SELECT
  });
};

// eslint-disable-next-line
export const deleteServiceItemJob = async (jobId: number): Promise<any> => {
  const ServiceItemJob = getTableName(TableNames.ServiceItemJob);
  return sequelize.query(`DELETE FROM  ${ServiceItemJob} WHERE "jobId" = ${jobId}`);
};
