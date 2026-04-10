import { sequelize } from '../../config/database';
import { getTableName } from '../models';
import TableNames from '../enums/TableNames';
import { QueryTypes } from 'sequelize';
import { UserProfileJobResponseModel } from '../../typings/ResponseFormats';

// eslint-disable-next-line
export const create = (values: any[]) => {
  const UserProfileJob = getTableName(TableNames.UserProfileJob);

  return sequelize.query(
    `INSERT INTO ${UserProfileJob} ("userProfileId", "jobId") VALUES ${values.map(value => `(${value.userProfileId}, ${value.jobId})`).join(', ')}`,
    {
      type: QueryTypes.INSERT,
      replacements: values
    }
  );
};

// eslint-disable-next-line
export const getByJobId = async (jobId: number): Promise<UserProfileJobResponseModel[]> => {
  const UserProfileJob = getTableName(TableNames.UserProfileJob);

  const result: UserProfileJobResponseModel[] = await sequelize.query(`SELECT * FROM ${UserProfileJob} WHERE "jobId" = ${jobId}`, {
    type: QueryTypes.SELECT
  });

  return result;
};

// eslint-disable-next-line
export const deleteData = async (jobId: number): Promise<any> => {
  const UserProfileJob = getTableName(TableNames.UserProfileJob);
  return sequelize.query(`DELETE FROM  ${UserProfileJob} WHERE "jobId" = ${jobId}`);
};
