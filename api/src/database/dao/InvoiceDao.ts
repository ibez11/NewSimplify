import { Op, QueryTypes, Sequelize } from 'sequelize';
import { sequelize } from '../../config/database';
import TableNames from '../enums/TableNames';

import {
  getInvoiceModel,
  getServiceModel,
  getClientModel,
  getServiceItemModel,
  getServiceAddressModel,
  getJobModel,
  getEntityModel,
  getTableName,
  getContactPersonModel,
  getCustomFieldModel
} from '../models';
import Invoice, { InvoiceStatus } from '../models/Invoice';
import { InvoiceBody } from '../../typings/body/InvoiceBody';

export const getPaginated = async (
  offset?: number,
  limit?: number,
  q?: string,
  startDate?: Date,
  endDate?: Date,
  isSynchronize?: boolean,
  needGST?: boolean,
  invoiceStatus?: string | [],
  orderBy?: string
): Promise<{ rows: Invoice[]; count: number }> => {
  const model = getInvoiceModel();
  const Service = getServiceModel();
  const Client = getClientModel();
  const ServiceAddress = getServiceAddressModel();
  const ServiceItem = getServiceItemModel();

  // eslint-disable-next-line
  const include: any = [
    {
      model: Service,
      required: false,
      attributes: ['id', 'serviceTitle', 'clientId', 'needGST', 'gstTax', 'gstAmount', 'discountAmount', 'salesPerson'],
      include: [{ model: Client, required: false, attributes: ['id', 'name', 'billingAddress'] }]
    }
  ];

  // eslint-disable-next-line
  let where: any = {};

  if (q) {
    where[Op.or] = {
      ...where,
      invoiceNumber: {
        [Op.iLike]: `%${q}%`
      },
      '$Service.Client.name$': {
        [Op.iLike]: `%${q}%`
      },
      '$Service.serviceTitle$': {
        [Op.iLike]: `%${q}%`
      }
    };
  }

  if (isSynchronize) {
    where[Op.and] = {
      ...where,
      isSynchronize: isSynchronize
    };
  }

  if (needGST) {
    where[Op.and] = {
      ...where,
      '$Service.needGST$': needGST
    };
  }

  if (startDate && endDate) {
    where[Op.and] = {
      ...where,
      createdAt: {
        [Op.gte]: `${startDate} 00:00:00`,
        [Op.lte]: `${endDate} 23:59:59`
      }
    };
  }

  if (invoiceStatus) {
    if (invoiceStatus === 'FULLY PAID') {
      where[Op.and] = { ...where, invoiceStatus: InvoiceStatus.FULLY_PAID };
    } else if (invoiceStatus === 'UNPAID') {
      where[Op.and] = { ...where, invoiceStatus: InvoiceStatus.UNPAID };
    } else if (invoiceStatus === 'PARTIALLY PAID') {
      where[Op.and] = { ...where, invoiceStatus: InvoiceStatus.PARTIAL_PAID };
    } else if (invoiceStatus === 'VOID') {
      where[Op.and] = { ...where, invoiceStatus: InvoiceStatus.VOID };
    } else {
      where = { ...where, invoiceStatus: { [Op.in]: invoiceStatus } };
    }
  }

  if (orderBy === 'newInvoice') {
    where = { ...where, newInvoice: { [Op.ne]: null } };
  }

  if (orderBy === 'updateInvoice') {
    where = { ...where, updateInvoice: { [Op.ne]: null } };
  }

  return model.findAndCountAll<Invoice>({
    where,
    limit,
    include,
    offset,
    order: [[orderBy || 'id', 'DESC']],
    distinct: true,
    col: 'id'
  });
};

export const getInvoiceZapier = async (
  offset?: number,
  limit?: number,
  q?: string,
  isSynchronize?: boolean,
  needGST?: boolean,
  orderBy?: string
): Promise<InvoiceBody[]> => {
  const Invoice = getTableName(TableNames.Invoice);
  const Service = getTableName(TableNames.Service);
  const ServiceAddress = getTableName(TableNames.ServiceAddress);
  const ServiceItem = getTableName(TableNames.ServiceItem);
  const ServiceItemJob = getTableName(TableNames.ServiceItemJob);
  const Job = getTableName(TableNames.Job);
  const Client = getTableName(TableNames.Client);

  const where: string[] = [];

  if (q) {
    where.push(
      `(i."invoiceNumber" ILIKE '%${q}%'
        OR s."serviceTitle" ILIKE '%${q}%'
        OR c."name" ILIKE '%${q}%'
      )`
    );
  }

  if (isSynchronize) {
    where.push(`i."isSynchronize" = ${isSynchronize}`);
  }

  if (needGST) {
    where.push(`s."needGST" = ${needGST}`);
  }

  if (orderBy === 'newInvoice') {
    where.push(`i."newInvoice" IS NOT NULL`);
  }

  if (orderBy === 'updateInvoice') {
    where.push(`i."updateInvoice" IS NOT NULL`);
  }

  const result: InvoiceBody[] = await sequelize.query(
    `SELECT
      i."id",
      i."invoiceNumber" AS "invoiceNumber",
      i."newInvoice" AS "newInvoice",
      i."updateInvoice" AS "updateInvoice",
      c."id" AS "clientId",
      c."billingAddress" AS "bilingAddress",
      c."idQboWithGST" AS "idQboWithGST",
      c."idQboWithoutGST" AS "idQboWithoutGST",
      sa."address" AS "serviceAddress",
      s."id" AS "serviceId",
      s."needGST" AS "needGST",
      s."gstTax" AS "gstTax",
      s."gstAmount" AS "gstAmount",
      s."discountAmount" AS "discountAmount",
      s."salesPerson" AS "salesPerson",
      (
        SELECT json_agg(
          json_build_object(
            'id', si."id",
            'name', si."name",
            'description', si."description",
            'quantity', si."quantity",
            'unitPrice', si."unitPrice",
            'discountType', si."discountType",
            'discountAmt', si."discountAmt",
            'totalPrice', si."totalPrice",
            'idQboWithGST', si."idQboWithGST",
            'IdQboWithoutGST', si."IdQboWithoutGST",
            'createdAt', si."createdAt",
            'updatedAt', si."updatedAt",
            'scheduleId', si."scheduleId",
            'jobStartDateTime', j."startDateTime"
          )
        )
        FROM ${ServiceItem} AS si
        LEFT JOIN ${ServiceItemJob} AS sij ON si."id" = sij."serviceItemId"
        LEFT JOIN ${Job} AS j ON sij."jobId" = j."id"
        WHERE si."serviceId" = i."serviceId"
      ) AS "ServiceItem"
    FROM
      ${Invoice} as i
      INNER JOIN ${Service} as s ON i."serviceId" = s."id"
      INNER JOIN ${ServiceAddress} as sa ON s."serviceAddressId" = sa."id"
      INNER JOIN ${Client} AS c ON s."clientId" = c."id"
    ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
    GROUP BY 
      i."id",
      i."invoiceNumber",
      c."id",
      c."name",
      c."billingAddress",
      sa."address",
      s."id",
      s."needGST",
      s."gstTax",
      s."gstAmount",
      s."discountAmount",
      s."salesPerson"
    ORDER BY i."${orderBy || 'id'}" DESC
    OFFSET ${offset} LIMIT ${limit}
    `,
    {
      type: QueryTypes.SELECT
    }
  );

  return result;
};

export const getDataCsv = async (
  offset?: number,
  limit?: number,
  q?: string,
  startDate?: Date,
  endDate?: Date,
  isSynchronize?: boolean,
  needGST?: boolean,
  invoiceStatus?: string | [],
  orderBy?: string
): Promise<{ rows: Invoice[]; count: number }> => {
  const model = getInvoiceModel();
  const Service = getServiceModel();
  const Client = getClientModel();
  const Entity = getEntityModel();
  const CustomField = getCustomFieldModel();

  // eslint-disable-next-line
  const include: any = [
    {
      model: Service,
      required: false,
      attributes: ['id', 'serviceTitle', 'clientId', 'needGST', 'totalAmount'],
      include: [
        { model: Client, required: false, attributes: ['id', 'name'] },
        { model: Entity, required: false, attributes: ['name'] },
        { model: CustomField, required: false, as: 'CustomFields' }
      ]
    }
  ];

  // eslint-disable-next-line
  let where: any = {};

  if (q) {
    where[Op.or] = {
      ...where,
      invoiceNumber: {
        [Op.iLike]: `%${q}%`
      },
      '$Service.Client.name$': {
        [Op.iLike]: `%${q}%`
      },
      '$Service.serviceTitle$': {
        [Op.iLike]: `%${q}%`
      }
    };
  }

  if (isSynchronize) {
    where[Op.and] = {
      ...where,
      isSynchronize: isSynchronize
    };
  }

  if (needGST) {
    where[Op.and] = {
      ...where,
      '$Service.needGST$': needGST
    };
  }

  if (startDate && endDate) {
    where[Op.and] = {
      ...where,
      createdAt: {
        [Op.gte]: `${startDate} 00:00:00`,
        [Op.lte]: `${endDate} 23:59:59`
      }
    };
  }

  if (invoiceStatus) {
    if (invoiceStatus === 'FULLY PAID') {
      where[Op.and] = { ...where, invoiceStatus: InvoiceStatus.FULLY_PAID };
    } else if (invoiceStatus === 'UNPAID') {
      where[Op.and] = { ...where, invoiceStatus: InvoiceStatus.UNPAID };
    } else if (invoiceStatus === 'PARTIALLY PAID') {
      where[Op.and] = { ...where, invoiceStatus: InvoiceStatus.PARTIAL_PAID };
    } else {
      where = { ...where, invoiceStatus: { [Op.in]: invoiceStatus } };
    }
  }

  return model.findAndCountAll<Invoice>({
    where,
    limit,
    include,
    offset,
    order: [[orderBy || 'id', 'DESC']]
  });
};

export const getInvoiceById = async (id: number): Promise<Invoice> => {
  const model = getInvoiceModel();

  return model.findOne<Invoice>({ where: { id } });
};

export const getInvoiceByServiceId = async (serviceId: number): Promise<Invoice> => {
  const model = getInvoiceModel();

  return model.findOne<Invoice>({ where: { serviceId } });
};

export const create = async (
  invoiceNumber: string,
  termStart: string,
  termEnd: string,
  invoiceAmount: number,
  collectedAmount: number,
  serviceId: number,
  createdBy: string,
  invoiceDate: Date,
  attnTo?: string
): Promise<Invoice> => {
  const model = getInvoiceModel();

  const collectedAmountInvoice =
    collectedAmount > invoiceAmount
      ? invoiceAmount
      : collectedAmount < invoiceAmount && collectedAmount > 0
      ? collectedAmount
      : collectedAmount <= 0
      ? 0
      : collectedAmount;

  return model.create<Invoice>({
    invoiceNumber,
    termStart,
    termEnd,
    invoiceAmount,
    collectedAmount: Number(collectedAmountInvoice),
    invoiceStatus: collectedAmount >= invoiceAmount ? 'FULLY PAID' : collectedAmount === 0 ? 'UNPAID' : 'PARTIALLY PAID',
    serviceId,
    createdBy,
    invoiceDate,
    attnTo
  });
};

export const getFullDetail = async (id: number): Promise<Invoice> => {
  const model = getInvoiceModel();
  const Service = getServiceModel();
  const Entity = getEntityModel();
  const Client = getClientModel();
  const ServiceAddress = getServiceAddressModel();
  const ServiceItem = getServiceItemModel();
  const Job = getJobModel();
  const ContactPerson = getContactPersonModel();
  const CustomField = getCustomFieldModel();

  const invoice = await model.findByPk<Invoice>(id, {
    include: [
      {
        model: Service,
        required: true,
        include: [
          {
            model: Client,
            required: false,
            attributes: ['id', 'name', 'billingAddress', 'billingPostal', 'needGST', 'remarks'],
            include: [
              {
                model: ContactPerson,
                as: 'ContactPersons',
                required: false,
                attributes: ['id', 'contactPerson', 'contactEmail', 'contactNumber', 'countryCode', 'isMain', 'country']
              }
            ]
          },
          {
            model: Entity,
            required: false,
            attributes: [
              'id',
              'name',
              'address',
              'logo',
              'countryCode',
              'contactNumber',
              'email',
              'registerNumberGST',
              'invoiceFooter',
              'uenNumber',
              'qrImage'
            ]
          },
          { model: ServiceAddress, required: false, attributes: ['id', 'address', 'country', 'postalCode'] },
          {
            model: Job,
            required: false,
            attributes: [
              'id',
              'jobStatus',
              'startDateTime',
              'endDateTime',
              'additionalServiceId',
              'paymentMethod',
              'collectedAmount',
              'assignedBy',
              'collectedBy',
              'chequeNumber'
            ]
          },
          {
            model: ServiceItem,
            as: 'ServiceItem',
            required: false,
            attributes: ['id', 'name', 'description', 'quantity', 'unitPrice', 'totalPrice']
          },
          { model: CustomField, required: false, attributes: ['id', 'serviceId', 'label', 'value'] }
        ]
      }
    ]
  });

  return invoice;
};

export const countByInvoiceNumber = async (invoiceNumber: string): Promise<number> => {
  const model = getInvoiceModel();

  return model.count({ where: { invoiceNumber } });
};

export const countByServiceId = async (serviceId: number): Promise<number> => {
  const model = getInvoiceModel();

  return model.count({ where: { serviceId } });
};

export const getInvoiceInformation = async (
  todayDate: string,
  mondayDate: string,
  startDateLastMonth: string,
  endDateLastMonth: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> => {
  const Invoice = getTableName(TableNames.Invoice);

  return sequelize.query(
    `SELECT (SELECT COUNT(*) as "invoiceToday" FROM ${Invoice} WHERE DATE("createdAt") = '${todayDate}'),
  (SELECT SUM("invoiceAmount") as "valueInvoiceToday" FROM ${Invoice} WHERE DATE("createdAt") = '${todayDate}'),
  (SELECT COUNT(*) as "invoiceThisWeek" FROM ${Invoice} WHERE DATE("createdAt") BETWEEN '${mondayDate}' AND '${todayDate}'),
  (SELECT SUM("invoiceAmount") as "valueInvoiceThisWeek" FROM ${Invoice} WHERE DATE("createdAt") BETWEEN '${mondayDate}' AND '${todayDate}'),
  (SELECT COUNT(*) as "invoiceLastMonth" FROM ${Invoice} WHERE DATE("createdAt") BETWEEN '${startDateLastMonth}' AND '${endDateLastMonth}'),
  (SELECT SUM("invoiceAmount") as "valueInvoiceLastMonth" FROM ${Invoice} WHERE DATE("createdAt") BETWEEN '${startDateLastMonth}' AND '${endDateLastMonth}'),
  (SELECT COUNT(*) as "unpaidInvoice" FROM ${Invoice} WHERE "invoiceStatus" = 'UNPAID'),
  (SELECT SUM("invoiceAmount") as "valueUnpaidInvoice" FROM ${Invoice} WHERE "invoiceStatus" = 'UNPAID')
   FROM ${Invoice} LIMIT 1`,
    {
      type: QueryTypes.SELECT
    }
  );
};

export const deleteInvoice = async (id: number): Promise<void> => {
  const model = getInvoiceModel();

  await model.destroy({ where: { id } });
};

export const getLastId = async (): Promise<Invoice> => {
  const model = getInvoiceModel();

  return await model.findOne<Invoice>({ attributes: [[Sequelize.fn('MAX', Sequelize.col('id')), 'id']] });
};

export const hasUnpaidInvoicesByClientId = async (clientId: number): Promise<boolean> => {
  const Service = getTableName(TableNames.Service);
  const Client = getTableName(TableNames.Client);
  const Invoice = getTableName(TableNames.Invoice);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any[] = await sequelize.query(
    `SELECT i."id" FROM ${Invoice} as i
    INNER JOIN ${Service} as s ON s."id" = i."serviceId"
    INNER JOIN ${Client} as c ON c."id" = s."clientId"
    WHERE i."invoiceStatus" = '${InvoiceStatus.UNPAID}' AND c."id" = ${clientId};`,
    { type: QueryTypes.SELECT }
  );

  return result && result.length > 0 ? true : false;
};

export const hasUnpaidInvoicesByServiceId = async (serviceId: number): Promise<boolean> => {
  const Service = getTableName(TableNames.Service);
  const Client = getTableName(TableNames.Client);
  const Invoice = getTableName(TableNames.Invoice);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any[] = await sequelize.query(
    `SELECT i."id" FROM ${Invoice} as i
    WHERE i."invoiceStatus" = '${InvoiceStatus.UNPAID}' AND i."serviceId" = ${serviceId};`,
    { type: QueryTypes.SELECT }
  );

  return result && result.length > 0 ? true : false;
};
