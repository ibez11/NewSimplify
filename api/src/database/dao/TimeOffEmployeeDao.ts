import { sequelize } from '../../config/database';
import { getTableName } from '../models';
import TableNames from '../enums/TableNames';
import { QueryTypes } from 'sequelize';

// eslint-disable-next-line
export const create = (values: any[]) => {
  const TimeOffEmployee = getTableName(TableNames.TimeOffEmployee);

  return sequelize.query(
    `INSERT INTO ${TimeOffEmployee} ("timeOffId", "userId") VALUES ${values.map(value => `(${value.timeOffId}, ${value.userId})`).join(', ')}`,
    {
      type: QueryTypes.INSERT,
      replacements: values
    }
  );
};

// eslint-disable-next-line
export const deleteData = async (timeOffId: number): Promise<any> => {
  const TimeOffEmployee = getTableName(TableNames.TimeOffEmployee);
  return sequelize.query(`DELETE FROM  ${TimeOffEmployee} WHERE "timeOffId" = ${timeOffId}`);
};
