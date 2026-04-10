import { QueryTypes, Sequelize, Transaction } from 'sequelize';
import { getServiceItemModel, getTableName } from '../models';
import ServiceItem from '../models/ServiceItem';
import TableNames from '../enums/TableNames';
import { sequelize } from '../../config/database';
import { ServiceItemResponseModel } from '../../typings/ResponseFormats';

/** Start the delete query */
// eslint-disable-next-line
export const deleteServiceItemByServiceId = async (serviceId: number): Promise<any> => {
  const model = getServiceItemModel();

  await model.destroy({ where: { serviceId } });
};
/** End of the delete query */

export const getServiceItemByJobId = async (jobId: number): Promise<ServiceItemResponseModel[]> => {
  const ServiceItem = getTableName(TableNames.ServiceItem);
  const ServiceItemJob = getTableName(TableNames.ServiceItemJob);

  const result: ServiceItemResponseModel[] = await sequelize.query(
    `SELECT si.*
     FROM ${ServiceItem} AS si 
     INNER JOIN ${ServiceItemJob} AS sij ON sij."serviceItemId" = si."id" 
     WHERE sij."jobId" = ${jobId} ORDER BY si."id" ASC`,
    {
      type: QueryTypes.SELECT
    }
  );

  return result;
};

export const getServiceItemByServiceId = async (serviceId: number): Promise<ServiceItemResponseModel[]> => {
  const ServiceItem = getTableName(TableNames.ServiceItem);

  const result: ServiceItemResponseModel[] = await sequelize.query(
    `SELECT si.* FROM ${ServiceItem} AS si WHERE si."serviceId" = ${serviceId} ORDER BY si."id" ASC`,
    {
      type: QueryTypes.SELECT
    }
  );

  return result;
};

export const getServiceItemByScheduleId = async (scheduleId: number): Promise<ServiceItem[]> => {
  const ServiceItem = getTableName(TableNames.ServiceItem);

  const result: ServiceItem[] = await sequelize.query(
    `SELECT si.* FROM ${ServiceItem} AS si WHERE si."scheduleId" = ${scheduleId} ORDER BY si."id" ASC`,
    {
      type: QueryTypes.SELECT
    }
  );

  return result;
};

export const getServiceItemById = async (id: number): Promise<ServiceItem> => {
  const model = getServiceItemModel();

  return model.findByPk<ServiceItem>(id);
};

export const getDetailServiceItemById = async (serviceItemId: number): Promise<ServiceItemResponseModel[]> => {
  const ServiceItem = getTableName(TableNames.ServiceItem);
  const Service = getTableName(TableNames.Service);
  const Invoice = getTableName(TableNames.Invoice);

  const result: ServiceItemResponseModel[] = await sequelize.query(
    `SELECT 
      si.*, s."serviceType", i."invoiceNumber", 
      (SELECT json_agg(si.*) 
       FROM ${ServiceItem} as si 
       WHERE si."serviceId"=s."id" 
      ) AS "ServiceItems"
     FROM ${ServiceItem} AS si 
     INNER JOIN ${Service} AS s ON s."id" = si."serviceId" 
     LEFT JOIN ${Invoice} AS i ON i."serviceId" = s."id" 
     WHERE si."id" = ${serviceItemId}`,
    {
      type: QueryTypes.SELECT
    }
  );

  return result;
};

// eslint-disable-next-line
export const createServiceItem = async (value: ServiceItem, transaction?: Transaction): Promise<any> => {
  const model = getServiceItemModel();

  return model.create(value, { validate: false, transaction });
};

// eslint-disable-next-line
export const createNewServiceItem = async (value: ServiceItemResponseModel, transaction?: Transaction): Promise<any> => {
  const model = getServiceItemModel();

  return model.create(value, { validate: false, transaction });
};

// eslint-disable-next-line
export const createServiceItemWithoutTransaction = async (value: ServiceItem): Promise<any> => {
  const model = getServiceItemModel();

  return model.create(value, { validate: false });
};

// eslint-disable-next-line
export const bulkCreateServiceItem = async (value: ServiceItemResponseModel[]): Promise<any> => {
  const model = getServiceItemModel();

  return model.bulkCreate(value, { validate: false });
};

// eslint-disable-next-line
export const bulkNewCreateServiceItem = async (value: Promise<ServiceItemResponseModel>[]): Promise<any> => {
  const model = getServiceItemModel();

  return model.bulkCreate(value, { validate: false });
};

/** Start the delete query */
// eslint-disable-next-line
export const deleteServiceItemById = async (id: number): Promise<any> => {
  const model = getServiceItemModel();

  await model.destroy({ where: { id } });
};
/** End of the delete query */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const deleteServiceItemByJobId = async (jobId: number): Promise<any> => {
  const ServiceItem = getTableName(TableNames.ServiceItem);
  const ServiceItemJob = getTableName(TableNames.ServiceItemJob);

  return await sequelize.query(
    `DELETE FROM ${ServiceItem} as si
    WHERE si."id" IN (SELECT sij."serviceItemId" FROM ${ServiceItemJob} as sij WHERE sij."jobId" = ${jobId})`,
    { type: QueryTypes.DELETE }
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sumServiceItemByServiceId = async (serviceId: number): Promise<any> => {
  const model = getServiceItemModel();

  return model.findOne({
    attributes: [[Sequelize.fn('SUM', Sequelize.col('ServiceItem.totalPrice')), 'originalAmount']],
    where: { serviceId },
    raw: true
  });
};
