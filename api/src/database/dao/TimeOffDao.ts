import TimeOff from '../models/TimeOff';
import { QueryTypes } from 'sequelize';
import { getTableName, getTimeOffModel } from '../models';
import { Transaction } from 'sequelize';
import TimeOffQueryParams from '../../typings/params/TimeOffQueryParams';
import { TimeOffBody } from '../../typings/body/TimeOffBody';
import TableNames from '../enums/TableNames';
import { sequelize } from '../../config/database';

export const getPaginated = async (query?: TimeOffQueryParams): Promise<TimeOffBody[]> => {
  const TimeOff = getTableName(TableNames.TimeOff);
  const TimeOffEmployee = getTableName(TableNames.TimeOffEmployee);
  const UserProfile = getTableName(TableNames.UserProfile);

  const conditions: string[] = [];

  if (query) {
    if (query.sd) {
      conditions.push(
        `(DATE(t."startDateTime") = '${query.sd}') OR (DATE(t."startDateTime") <= '${query.sd}' AND DATE(t."endDateTime") >='${query.ed}')`
      );
    }
  }

  const result: TimeOffBody[] = await sequelize.query(
    `SELECT
      t."id", t."status", t."remarks", t."startDateTime", t."endDateTime", 
      (
        SELECT json_agg(json_build_object('id', u."id", 'displayName', u."displayName")) 
        FROM ${UserProfile} as u 
        INNER JOIN ${TimeOffEmployee} as te ON u."id"=te."userId" 
        WHERE te."timeOffId"=t."id"
      ) AS "Employees"
    FROM ${TimeOff} AS t
    ${conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''}
    ORDER BY t."id" desc`,
    {
      type: QueryTypes.SELECT
    }
  );

  result.map(val => {
    val.startDateTime = new Date(val.startDateTime).toLocaleString();
    val.endDateTime = new Date(val.endDateTime).toLocaleString();
  });

  return result;
};

export const getById = async (id: number): Promise<TimeOffBody[]> => {
  const TimeOff = getTableName(TableNames.TimeOff);
  const TimeOffEmployee = getTableName(TableNames.TimeOffEmployee);
  const UserProfile = getTableName(TableNames.UserProfile);
  const result: TimeOffBody[] = await sequelize.query(
    `SELECT
    t."id", t."status", t."remarks", t."startDateTime", t."endDateTime", 
    (SELECT json_agg(json_build_object('id', u."id", 'displayName', u."displayName")) FROM ${UserProfile} as u INNER JOIN ${TimeOffEmployee} as te ON u."id"=te."userId" WHERE te."timeOffId"=${id}) AS "Employees"
    FROM ${TimeOff} AS t
    WHERE t."id" = ${id}`,
    {
      type: QueryTypes.SELECT
    }
  );
  return result;
};

export const createTimeOff = async (req: TimeOffBody): Promise<TimeOff> => {
  const model = getTimeOffModel();

  const { status, remarks, startDateTime, endDateTime } = req;
  return model.create<TimeOff>({ status, remarks, startDateTime, endDateTime });
};

// eslint-disable-next-line
export const bulkCreateTimeOff = async (value: TimeOffBody[], transaction?: Transaction): Promise<any> => {
  const model = getTimeOffModel();

  return model.bulkCreate(value, { validate: false, transaction });
};

// eslint-disable-next-line
export const deleteTimeOffById = async (id: number): Promise<any> => {
  const model = getTimeOffModel();

  await model.destroy({ where: { id } });
};

// eslint-disable-next-line
export const deleteTimeOffByUserId = async (userId: number, transaction?: Transaction): Promise<any> => {
  const model = getTimeOffModel();

  await model.destroy({ where: { userId }, transaction });
};
