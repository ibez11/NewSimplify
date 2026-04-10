import { sequelize } from '../../config/database';
import { getTableName } from '../models';
import TableNames from '../enums/TableNames';
import { QueryTypes } from 'sequelize';
import { ServiceContactResponseModel } from '../../typings/ResponseFormats';

// eslint-disable-next-line
export const create = (values: any[]) => {
  const ServiceContactPerson = getTableName(TableNames.ServiceContactPerson);

  return sequelize.query(
    `INSERT INTO ${ServiceContactPerson} ("serviceId", "contactPersonId") VALUES ${values
      .map(value => `(${value.serviceId}, ${value.contactPersonId})`)
      .join(', ')}`,
    {
      type: QueryTypes.INSERT,
      replacements: values
    }
  );
};

// eslint-disable-next-line
export const getByserviceId = async (serviceId: number): Promise<ServiceContactResponseModel[]> => {
  const ServiceContactPerson = getTableName(TableNames.ServiceContactPerson);

  const result: ServiceContactResponseModel[] = await sequelize.query(`SELECT * FROM ${ServiceContactPerson} WHERE "serviceId" = ${serviceId}`, {
    type: QueryTypes.SELECT
  });

  return result;
};

// eslint-disable-next-line
export const deleteData = async (serviceId: number): Promise<any> => {
  const ServiceContactPerson = getTableName(TableNames.ServiceContactPerson);
  return sequelize.query(`DELETE FROM  ${ServiceContactPerson} WHERE "serviceId" = ${serviceId}`);
};
