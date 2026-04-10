import { sequelize } from '../../config/database';
import { getTableName } from '../models';
import TableNames from '../enums/TableNames';
import { QueryTypes } from 'sequelize';

// eslint-disable-next-line
export const create = (values: any[]) => {
  const VehicleJob = getTableName(TableNames.VehicleJob);

  return sequelize.query(
    `INSERT INTO ${VehicleJob} ("vehicleId", "jobId") VALUES ${values.map(value => `(${value.vehicleId}, ${value.jobId})`).join(', ')}`,
    {
      type: QueryTypes.INSERT,
      replacements: values
    }
  );
};

// eslint-disable-next-line
export const deleteData = async (jobId: number): Promise<any> => {
  const VehicleJob = getTableName(TableNames.VehicleJob);
  return sequelize.query(`DELETE FROM ${VehicleJob} WHERE "jobId" = ${jobId}`);
};
