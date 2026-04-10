import { QueryTypes, Sequelize, Transaction } from 'sequelize';
import { format, addMonths } from 'date-fns';

import {
  getTableName,
  getServiceModel,
  getScheduleModel,
  getClientModel,
  getEntityModel,
  getJobModel,
  getServiceAddressModel,
  getServiceItemModel,
  getServiceSkillModel,
  getChecklistJobModel,
  getChecklistJobItemModel,
  getInvoiceModel,
  getJobLabelModel,
  getAgentModel,
  getContactPersonModel,
  getCustomFieldModel
} from '../models';
import TableNames from '../enums/TableNames';
import Service, { ServiceStatus } from '../models/Service';
import { JobStatus } from '../models/Job';

import { sequelize } from '../../config/database';
import { ServiceResponseModel, ParametersResponseModel } from '../../typings/ResponseFormats';
import ServiceNotFoundError from '../../errors/ServiceNotFoundError';
import * as ServiceItemDao from './ServiceItemDao';
import * as EquipmentDao from './EquipmentDao';
import { ServiceQueryParams } from '../../typings/params/ServiceQueryParams';
import { ServiceBody } from '../../typings/body/ServiceBody';

export const getPaginated = async (query: ServiceQueryParams): Promise<{ rows: ServiceResponseModel[]; count: number }> => {
  const [count, rows] = await Promise.all([
    getCount(query),
    get(query)
    // getClients(),
    // getEntities()
  ]);

  return { count, rows };
};

export const exportCsv = async (query: ServiceQueryParams): Promise<{ rows: ServiceResponseModel[] }> => {
  const [rows] = await Promise.all([getDataCsv(query)]);

  return { rows };
};

/** Start the service search query */
export const get = async (query: ServiceQueryParams): Promise<ServiceResponseModel[]> => {
  const Job = getTableName(TableNames.Job);
  const Service = getTableName(TableNames.Service);
  const ServiceAddress = getTableName(TableNames.ServiceAddress);
  const ServiceItem = getTableName(TableNames.ServiceItem);
  const Client = getTableName(TableNames.Client);
  const Entity = getTableName(TableNames.Entity);
  const Invoice = getTableName(TableNames.Invoice);

  const { s, l, ob, ot, q, c, fb, sd, ed, ci, ei, ct, sai, fi, na, cs, rnw } = query;
  const where = generateWhereQuery(q, c, fb, sd, ed, ci, ei, ct, sai, fi, na, cs, rnw);
  const order = generateOrderQuery(ob, ot);
  const offsetAndLimit = generateOffsetAndLimit(s, l);

  const result: ServiceResponseModel[] = await sequelize.query(
    `SELECT
      s."id",
      array_agg(DISTINCT s."serviceNumber") AS "contractId",
      s."serviceTitle" AS "contractTitle",
      s."termStart" AS "startDate",
			s."termEnd" AS "endDate",
      s."createdAt" AS "createdDate",
			s."clientId" AS "clientId",
			array_agg(DISTINCT i."id") AS "invoiceId",
      array_agg(DISTINCT i."invoiceNumber") AS "invoiceNo",
      array_agg(DISTINCT i."invoiceStatus") AS "invoiceStatus",
      array_agg(DISTINCT i."collectedAmount") AS "invoiceCollectedAmount",
      s."serviceType" AS "contractType",
      s."isRenewed",
      s."renewedServiceId",
      array_agg(DISTINCT c."name") AS "clientName",
      s."totalJob",
      ( SELECT COUNT ( j."id" ) FROM ${Job} AS j WHERE j."serviceId" = s."id" AND j."jobStatus" = '${JobStatus.COMPLETED}' ) AS "completed",
      ( SELECT COUNT ( j."id" ) FROM ${Job} AS j WHERE j."serviceId" = s."id" AND j."jobStatus" = '${JobStatus.CANCELLED}' ) AS "cancelledJob",
      ( SELECT COUNT ( ja."id" ) FROM ${Job} AS ja WHERE ja."additionalServiceId" = s."id" AND ja."jobStatus" = '${
      JobStatus.COMPLETED
    }' ) AS "additionalCompleted",
      ( SELECT COUNT ( ja."id" ) FROM ${Job} AS ja WHERE ja."additionalServiceId" = s."id" ) AS "additionalTotalJob",
      array_agg(DISTINCT s."entityId") AS "entityId",
      array_agg(DISTINCT e."name") AS "entity",
      s."totalAmount" AS amount,
      array_agg(DISTINCT sa."address") AS "serviceAddress",
      array_agg(DISTINCT sa."postalCode") AS "postalCode",
      array_agg(DISTINCT si."name") AS "ServiceItems",
      CASE
        WHEN s."serviceStatus" = 'CONFIRMED'  AND s."termEnd" >= '${format(new Date(), 'yyyy-MM-dd')}' THEN 'Active'
        WHEN s."serviceStatus" = 'CONFIRMED' AND s."termEnd" < '${format(new Date(), 'yyyy-MM-dd')}' THEN 'Expired'
        WHEN s."serviceStatus" = 'CONFIRMED' AND s."termEnd" >= '${format(new Date(), 'yyyy-MM-dd')}' AND s."termEnd" <= '${format(
      addMonths(new Date(), 3),
      'yyyy-MM-dd'
    )}' THEN 'Expiring'
        WHEN s."serviceStatus" = 'PENDING' THEN 'Pending'
        WHEN s."serviceStatus" = 'CANCELLED' THEN 'Cancelled'
        ELSE s."serviceStatus"
      END AS "contractStatus"
    FROM
      ${Service} AS s
      INNER JOIN ${Client} AS c ON s."clientId" = c."id"
      INNER JOIN ${Entity} AS e ON s."entityId" = e."id"      
      INNER JOIN ${ServiceAddress} AS sa ON s."serviceAddressId" = sa."id"
      INNER JOIN ${ServiceItem} AS si ON si."serviceId" = s."id"
      LEFT JOIN ${Invoice} AS i ON i."serviceId" = s."id"
    ${where}
    GROUP BY s."id", c."id", e."id"
    ${order} ${offsetAndLimit}`,
    {
      type: QueryTypes.SELECT
    }
  );

  if (result) {
    result.map(async row => {
      if (row.contractType !== 'ADDITIONAL') {
        const doneJob = Number(row.completed) + Number(row.cancelledJob);
        if (
          row.totalJob === doneJob &&
          (row.contractStatus === 'Active' || (row.contractStatus !== 'Completed' && row.contractStatus !== 'Cancelled'))
        ) {
          row.contractStatus = 'Completed';
        }
      } else {
        if (
          row.additionalTotalJob === row.additionalCompleted &&
          (row.contractStatus === 'Active' || (row.contractStatus !== 'Completed' && row.contractStatus !== 'Cancelled'))
        ) {
          row.contractStatus = 'Completed';
        }
      }
    });
  }

  return result;
};

export const getDataCsv = async (query: ServiceQueryParams): Promise<ServiceResponseModel[]> => {
  const Service = getTableName(TableNames.Service);
  const Client = getTableName(TableNames.Client);
  const Entity = getTableName(TableNames.Entity);
  const Invoice = getTableName(TableNames.Invoice);
  const CustomField = getTableName(TableNames.CustomField);

  const { s, l, ob, ot, q, c, fb, sd, ed, ci, ei, ct, sai, fi, na, cs, rnw } = query;
  const where = generateWhereQuery(q, c, fb, sd, ed, ci, ei, ct, sai, fi, na, cs, rnw);
  const order = generateOrderQuery(ob, ot);
  const offsetAndLimit = generateOffsetAndLimit(s, l);

  const result: ServiceResponseModel[] = await sequelize.query(
    `SELECT
      s."id",
      array_agg(DISTINCT s."serviceNumber") AS "contractId",
      array_agg(DISTINCT s."serviceTitle") AS "contractTitle",
      array_agg(DISTINCT s."termStart") AS "startDate",
			array_agg(DISTINCT s."termEnd") AS "endDate",
      array_agg(DISTINCT s."createdAt") AS "createdDate",
			array_agg(DISTINCT s."clientId") AS "clientId",
      array_agg(DISTINCT i."invoiceNumber") AS "invoiceNo",
      array_agg(DISTINCT i."invoiceStatus") AS "invoiceStatus",
      array_agg(DISTINCT s."serviceStatus") AS "contractStatus",
      array_agg(DISTINCT s."serviceType") AS "contractType",
      s."isRenewed",
      s."renewedServiceId",
      array_agg(DISTINCT c."name") AS "clientName",
      array_agg(DISTINCT e."name") AS "entity",
      s."totalJob",
      s."totalAmount" AS amount,
      (SELECT json_agg(cf.*) FROM ${CustomField} as cf WHERE cf."serviceId" = s."id") AS "CustomFields"
    FROM
      ${Service} AS s
      INNER JOIN ${Client} AS c ON s."clientId" = c."id"
      INNER JOIN ${Entity} AS e ON s."entityId" = e."id"
      LEFT JOIN ${Invoice} AS i ON i."serviceId" = s."id"
    ${where}
    GROUP BY s."id", c."id", e."id" 
    ${order} ${offsetAndLimit}`,
    {
      type: QueryTypes.SELECT
    }
  );

  return result;
};

export const getCount = async (query: ServiceQueryParams): Promise<number> => {
  const Service = getTableName(TableNames.Service);
  const Client = getTableName(TableNames.Client);
  const Invoice = getTableName(TableNames.Invoice);
  const Entity = getTableName(TableNames.Entity);
  const ServiceAddress = getTableName(TableNames.ServiceAddress);
  const ServiceItem = getTableName(TableNames.ServiceItem);

  const { q, c, fb, sd, ed, ci, ei, ct, sai, fi, na, cs, rnw } = query;
  const where = generateWhereQuery(q, c, fb, sd, ed, ci, ei, ct, sai, fi, na, cs, rnw);

  const result: CountQueryReturn = await sequelize.query(
    `SELECT COUNT(DISTINCT s."id")
    FROM ${Service} s
    INNER JOIN ${Client} c ON s."clientId" = c.id
    INNER JOIN ${Entity} e ON s."entityId" = e.id      
    INNER JOIN ${ServiceAddress} AS sa ON s."serviceAddressId" = sa."id"
    INNER JOIN ${ServiceItem} AS si ON si."serviceId" = s."id"
    LEFT JOIN ${Invoice} AS i ON i."serviceId" = s."id"
        ${where}`,
    {
      type: QueryTypes.SELECT
    }
  );

  return +result[0].count;
};

const generateWhereQuery = (
  query?: string,
  contractFlag?: string,
  filterBy?: string,
  startDate?: string,
  endDate?: string,
  clientId?: number,
  entityId?: number,
  contractType?: string | [],
  serviceAddressId?: number,
  filterInvoice?: number,
  isNotAdditional?: boolean,
  contractStatus?: string,
  isRenewed?: boolean
): string => {
  const conditions: string[] = [];

  if (
    !query &&
    !contractFlag &&
    !filterBy &&
    !clientId &&
    !entityId &&
    !contractType &&
    !filterInvoice &&
    !isNotAdditional &&
    !contractStatus &&
    !isRenewed
  ) {
    return '';
  }

  if (query) {
    conditions.push(
      `(s."serviceNumber" ILIKE '%${query}%' 
        OR s."serviceTitle" ILIKE '%${query}%' 
        OR c."name" ILIKE '%${query}%' 
        OR e."name" ILIKE '%${query}%'
        OR to_char(s."termStart",'dd/MM/yyyy')::text ILIKE '%${query}%' 
        OR to_char(s."termEnd",'dd/MM/yyyy')::text ILIKE '%${query}%')`
    );
  }

  if (contractFlag) {
    if (contractFlag === '1' || contractFlag === '2' || contractFlag === '3') {
      conditions.push(` s."serviceStatus" != 'CANCELLED' AND s."serviceStatus" != 'PENDING'`);
    } else if (contractFlag === '4') {
      conditions.push(`s."isJobCompleted" = true`);
    } else if (contractFlag === '5') {
      conditions.push(`s."serviceStatus" = 'CANCELLED'`);
    } else if (contractFlag === '6') {
      conditions.push(`s."serviceStatus" = 'PENDING'`);
    }
  }

  if (filterBy) {
    if (filterBy === 'active') {
      conditions.push(`s."termEnd" >= '${format(new Date(), 'yyyy-MM-dd')}'`);
    } else if (filterBy === 'expiring') {
      const newEndDate = addMonths(new Date(), 3);
      conditions.push(`s."termEnd" >= '${format(new Date(), 'yyyy-MM-dd')}' AND s."termEnd" <= '${format(newEndDate, 'yyyy-MM-dd')}'`);
    } else if (filterBy === 'expired') {
      conditions.push(`s."termEnd" < '${format(new Date(), 'yyyy-MM-dd')}'`);
    } else if (filterBy === 'custom') {
      conditions.push(
        `s."termEnd" >= '${format(new Date(startDate), 'yyyy-MM-dd')}' AND s."termEnd" <= '${format(new Date(endDate), 'yyyy-MM-dd')}'`
      );
    } else if (filterBy === 'termStart' || filterBy === 'termEnd') {
      conditions.push(
        `s."${filterBy}" >= '${format(new Date(startDate), 'yyyy-MM-dd')}' AND s."${filterBy}" <= '${format(new Date(endDate), 'yyyy-MM-dd')}'`
      );
    }
  }

  if (clientId) {
    conditions.push(`s."clientId" IN (${clientId})`);
  }

  if (entityId) {
    conditions.push(`s."entityId" IN (${entityId})`);
  }

  if (contractType) {
    if (Array.isArray(contractType)) {
      conditions.push(`s."serviceType" IN ('${contractType.join(`','`)}')`);
    } else {
      conditions.push(`s."serviceType" ILIKE '${contractType}'`);
    }
  }

  if (serviceAddressId) {
    conditions.push(`s."serviceAddressId" IN (${serviceAddressId})`);
  }

  if (filterInvoice) {
    if (Number(filterInvoice) === 1) {
      conditions.push(`i."id" IS NOT NULL`);
    } else {
      conditions.push(`i."id" IS NULL`);
    }
  }

  if (isNotAdditional) {
    conditions.push(`s."serviceType" NOT LIKE 'ADDITIONAL'`);
  }

  if (isRenewed) {
    conditions.push(`s."isRenewed" = '${isRenewed}'`);
  }

  if (contractStatus) {
    conditions.push(`s."serviceStatus" = '${contractStatus}'`);
  }

  return `WHERE ${conditions.join(' AND ')}`;
};

const generateOrderQuery = (by?: string, type?: string) => {
  let orderBy = by || 's."id"';
  const orderType = type || 'DESC';

  if (by === 'date') {
    orderBy = 's."termStart"';
  }

  return `ORDER BY ${orderBy} ${orderType}`;
};

const generateOffsetAndLimit = (offset?: number, limit?: number): string => {
  if (offset === undefined) {
    return '';
  }

  let offsetAndLimit = `OFFSET ${offset}`;

  if (limit !== undefined) {
    offsetAndLimit += ` LIMIT ${limit}`;
  }

  return offsetAndLimit;
};

export const getClients = async (): Promise<ParametersResponseModel[]> => {
  const Service = getTableName(TableNames.Service);
  const Client = getTableName(TableNames.Client);

  const result: ParametersResponseModel[] = await sequelize.query(
    `SELECT DISTINCT
        s."clientId" AS id,
        c."name" AS name
      FROM
        ${Service} s
        INNER JOIN ${Client} c ON s."clientId" = c."id"`,
    {
      type: QueryTypes.SELECT
    }
  );
  return result;
};

export const getEntities = async (): Promise<ParametersResponseModel[]> => {
  const Service = getTableName(TableNames.Service);
  const Entity = getTableName(TableNames.Entity);

  const result: ParametersResponseModel[] = await sequelize.query(
    `SELECT DISTINCT
        s."clientId" AS id,
        e."name" AS name 
      FROM
        ${Service} s
        INNER JOIN ${Entity} e ON s."clientId" = e."id"`,
    {
      type: QueryTypes.SELECT
    }
  );
  return result;
};
/** End of service search query */

/** Start the get service by id query */
export const getServiceById = async (id: number): Promise<Service> => {
  const model = getServiceModel();
  const Invoice = getInvoiceModel();

  return await model.findByPk<Service>(id, {
    include: [
      {
        model: Invoice,
        as: 'Invoice',
        required: false,
        attributes: ['id', 'invoiceNumber', 'termStart', 'termEnd', 'collectedAmount', 'chargeAmount', 'paymentMethod', 'invoiceStatus']
      }
    ]
  });
};
/** End of get service by id query */

export const getServiceDetailByIdForJob = async (id: number): Promise<Service> => {
  const model = getServiceModel();

  const service = await model.findByPk<Service>(id);

  return service;
};

export const getServiceDetailById = async (id: number): Promise<Service> => {
  const model = getServiceModel();
  const ServiceAddress = getServiceAddressModel();
  const Schedule = getScheduleModel();
  const ServiceItem = getServiceItemModel();
  const ServiceSkill = getServiceSkillModel();
  const Job = getJobModel();
  const Client = getClientModel();
  const Entity = getEntityModel();
  const ChecklistJob = getChecklistJobModel();
  const ChecklistJobItem = getChecklistJobItemModel();
  const Invoice = getInvoiceModel();
  const JobLabel = getJobLabelModel();
  const Agent = getAgentModel();
  const ContactPerson = getContactPersonModel();
  const CustomField = getCustomFieldModel();

  const service = await model.findByPk<Service>(id, {
    include: [
      {
        model: Client,
        required: false,
        attributes: [
          'id',
          'name',
          'clientType',
          'billingAddress',
          'billingFloorNo',
          'billingUnitNo',
          'billingPostal',
          'needGST',
          'remarks',
          'idQboWithGST',
          'idQboWithoutGST'
        ],
        include: [
          {
            model: ServiceAddress,
            required: false,
            attributes: ['id', 'address', 'floorNo', 'unitNo', 'country', 'postalCode']
          },
          {
            model: Agent,
            required: false,
            attributes: ['name']
          },
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
        attributes: ['id', 'name', 'address', 'countryCode', 'contactNumber', 'logo', 'email', 'needGST', 'registerNumberGST', 'uenNumber']
      },
      {
        model: Invoice,
        as: 'Invoice',
        required: false,
        attributes: ['id', 'invoiceNumber', 'termStart', 'termEnd', 'collectedAmount', 'chargeAmount', 'paymentMethod', 'invoiceStatus', 'createdBy']
      },
      { model: ServiceSkill, required: false, attributes: ['id', 'skill'] },
      {
        model: ServiceAddress,
        required: false,
        attributes: ['id', 'address', 'floorNo', 'unitNo', 'country', 'postalCode']
      },
      {
        model: Schedule,
        required: false,
        attributes: [
          'id',
          'startDateTime',
          'endDateTime',
          'repeatType',
          'repeatEvery',
          'repeatOnDate',
          'repeatOnDay',
          'repeatOnWeek',
          'repeatOnMonth',
          'repeatEndType',
          'repeatEndAfter',
          'repeatEndOnDate'
        ],
        include: [
          {
            model: ServiceItem,
            required: false,
            order: [['id', 'asc']]
            // include: [{ model: Equipment, required: false }]
          }
        ]
      },
      {
        model: Job,
        required: false,
        as: 'Jobs',
        order: [['id', 'asc']],
        attributes: [
          'id',
          'jobStatus',
          [Sequelize.fn('to_char', Sequelize.col('Jobs.startDateTime'), 'YYYY-MM-DD HH24:MI'), 'startDateTime'],
          [Sequelize.fn('to_char', Sequelize.col('Jobs.endDateTime'), 'YYYY-MM-DD HH24:MI'), 'endDateTime'],
          'additionalServiceId'
        ],
        include: [
          {
            model: ChecklistJob,
            required: false,
            as: 'ChecklistJob',
            order: [['id', 'asc']],
            attributes: ['id', 'name', 'description'],
            include: [
              {
                model: ChecklistJobItem,
                as: 'ChecklistItems',
                order: [['id', 'asc']],
                required: false,
                attributes: ['id', 'name', 'status', 'remarks']
              }
            ]
          },
          {
            model: JobLabel,
            required: false,
            as: 'JobLabels',
            order: [['id', 'asc']],
            attributes: ['id', 'name', 'description', 'color']
          }
        ]
      },
      {
        model: CustomField,
        required: false,
        attributes: ['id', 'label', 'value']
      }
    ],
    order: [[Job, 'startDateTime', 'ASC']]
  });

  if (service) {
    const termEnd = service.termEnd.toString();

    if (service.serviceStatus === 'CONFIRMED' && termEnd >= format(new Date(), 'yyyy-MM-dd')) {
      service.serviceStatus = ServiceStatus.ACTIVE;
    }
    if (
      service.serviceStatus === 'CONFIRMED' &&
      termEnd >= format(new Date(), 'yyyy-MM-dd') &&
      termEnd <= format(addMonths(new Date(), 3), 'yyyy-MM-dd')
    ) {
      service.serviceStatus = ServiceStatus.EXPIRING;
    }
    if (service.serviceStatus === 'CONFIRMED' && termEnd < format(new Date(), 'yyyy-MM-dd')) {
      service.serviceStatus = ServiceStatus.EXPIRED;
    } else if (service.serviceStatus === 'PENDING') {
      service.serviceStatus = ServiceStatus.PENDING;
    } else if (service.serviceStatus === 'CANCELLED') {
      service.serviceStatus = ServiceStatus.CANCELLED;
    }

    let i = 0;
    let currentScheduleId = 0;
    const jobs = service.getDataValue('Jobs');
    await Promise.all(
      jobs.map(async job => {
        const items = await ServiceItemDao.getServiceItemByJobId(job.id);

        await Promise.all(
          items.map(async item => {
            const equipments = await EquipmentDao.getEquipmentByServiceItemId(item.id);
            currentScheduleId = item.scheduleId;
            item.Equipments = equipments;
            item.scheduleIndex = i;

            if (currentScheduleId !== item.scheduleId) {
              currentScheduleId = item.scheduleId;
              i++;
            }
          })
        );

        const jobAmount = items.reduce((acc, val) => acc + Number(val.totalPrice), 0);
        job.setDataValue('jobAmount', jobAmount.toString());

        job.setDataValue(
          'serviceItemsJob',
          items.sort((a, b) => a.id - b.id)
        );
      })
    );

    service.setDataValue('Jobs', jobs);
  }

  return service;
};

/** Start the get service full detail by id query */
export const getServiceFullDetailsById = async (id: number): Promise<ServiceResponseModel> => {
  const Job = getTableName(TableNames.Job);
  const Service = getTableName(TableNames.Service);
  const ServiceItem = getTableName(TableNames.ServiceItem);
  const Client = getTableName(TableNames.Client);
  const Entity = getTableName(TableNames.Entity);
  const Invoice = getTableName(TableNames.Invoice);

  const result: ServiceResponseModel[] = await sequelize.query(
    `SELECT
    s."id",
    array_agg(DISTINCT s."serviceNumber") AS "contractId",
    array_agg(DISTINCT s."serviceTitle") AS "contractTitle",
    array_agg(DISTINCT s."termStart") AS "startDate",
		array_agg(DISTINCT s."termEnd") AS "endDate",
    array_agg(DISTINCT s."createdAt") AS "createdDate",
		array_agg(DISTINCT s."clientId") AS "clientId",
    array_agg(DISTINCT i."invoiceNumber") AS "invoiceNo",
    array_agg(DISTINCT c."name") AS "clientName",
    array_agg(DISTINCT s."entityId") AS "entityId",
    array_agg(DISTINCT e."name") AS "entity",
    COUNT ( DISTINCT ( CASE WHEN j."jobStatus" = 'COMPLETED' THEN 1 END ) ) AS completed,
    SUM ( si."totalPrice" ) AS amount, 
    s."totalJob"
  FROM
    ${Service} AS s
    LEFT JOIN ${Job} AS j ON j."serviceId" = s."id"
    INNER JOIN ${Client} AS c ON s."clientId" = c."id"
    INNER JOIN ${Entity} AS e ON s."entityId" = e."id"
    LEFT JOIN ${Invoice} AS i ON i."serviceId" = s."id"
    INNER JOIN ${ServiceItem} AS si ON si."serviceId" = s."id"
  WHERE
    s."id" = $id
  GROUP BY
    s."id", c."id", e."id"`,
    {
      type: QueryTypes.SELECT,
      bind: {
        id
      }
    }
  );

  if (!result.length) {
    throw new ServiceNotFoundError(id);
  }

  return result[0];
};
/** End of get service full detail by id query */

/** Start the delete query */
// eslint-disable-next-line
export const deleteServiceById = async (id: number): Promise<any> => {
  const model = getServiceModel();

  await model.destroy({ where: { id } });
};
/** End of the delete query */

/** Start to create query */
export const createService = async (req: ServiceBody, transaction?: Transaction): Promise<Service> => {
  const model = getServiceModel();

  const {
    serviceType,
    serviceNumber,
    serviceTitle,
    description,
    serviceStatus,
    needGST,
    termStart,
    termEnd,
    invoiceNumber,
    contractAmount,
    discountType,
    discountAmount,
    gstAmount,
    totalAmount,
    remarks,
    termCondition,
    clientId,
    serviceAddressId,
    entityId,
    totalJob,
    gstTax,
    salesPerson,
    issueDate,
    expiryDate
  } = req;

  return model.create<Service>(
    {
      serviceType,
      serviceNumber,
      serviceTitle,
      description,
      serviceStatus,
      needGST,
      termStart,
      termEnd,
      invoiceNumber,
      originalAmount: contractAmount,
      discountType,
      discountAmount,
      gstAmount,
      totalAmount,
      remarks,
      termCondition,
      clientId,
      serviceAddressId,
      entityId,
      totalJob,
      gstTax,
      salesPerson,
      issueDate,
      expiryDate
    },
    { transaction }
  );
};
/** End to create query */

export const getLastId = async (): Promise<Service> => {
  const model = getServiceModel();

  return await model.findOne<Service>({ attributes: [[Sequelize.fn('MAX', Sequelize.col('id')), 'id']] });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getServiceDetailByServiceNumber = async (tenant: string, serviceNumber: number): Promise<any> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return await sequelize.query(
    `SELECT
      s."id",
      s."serviceNumber" as "serviceNumber",

      sa."address" AS "serviceAddress",
      c."name" AS "clientName",
      cp."contactPerson" AS "contactPerson",
      cp."countryCode" AS "countryCode",
      cp."contactNumber" AS "contactNumber",
      e."contactNumber" AS "entityContactNumber",
      (SELECT json_agg(
        json_build_object(
          'id', j."id",
          'jobStatus', j."jobStatus",
          'startDateTime', TO_CHAR(j."startDateTime", 'YYYY-MM-DD HH24:MI'),
          'endDateTime', TO_CHAR(j."endDateTime", 'YYYY-MM-DD HH24:MI'),
          'jobSequence', j."jobSequence",
          'durationMinutes', j."durationMinutes"
        )
      )FROM (
          SELECT 
            j."id",
            j."jobStatus",
            j."startDateTime",
            j."endDateTime",
            ROW_NUMBER() OVER (ORDER BY j."startDateTime") AS "jobSequence",
            EXTRACT(EPOCH FROM (j."endDateTime" - j."startDateTime")) / 60 AS "durationMinutes"
          FROM "${tenant}"."Job" AS j
          WHERE j."serviceId" = s."id"
        ) AS j
      ) AS "Jobs"
    FROM "${tenant}"."Service" AS s
    INNER JOIN "${tenant}"."ServiceAddress" AS sa ON s."serviceAddressId" = sa."id"
    INNER JOIN "${tenant}"."Client" AS c ON s."clientId" = c."id"
    INNER JOIN "${tenant}"."ContactPerson" AS cp ON c."id" = cp."clientId" AND cp."isMain" = true
    INNER JOIN "${tenant}"."Entity" AS e ON s."entityId" = e."id"  
    WHERE s."id" = ${serviceNumber}`,
    {
      type: QueryTypes.SELECT,
      bind: {
        serviceNumber
      }
    }
  );
};

export const getServicesByServiceAddressId = async (serviceAddressId: number): Promise<Service[]> => {
  const model = getServiceModel();

  return model.findAll<Service>({ where: { serviceAddressId } });
};
