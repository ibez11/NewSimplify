import { Op, QueryTypes, Sequelize, WhereOptions } from 'sequelize';

import Client from '../models/Client';
import Service from '../models/Service';
import {
  getClientModel,
  getServiceModel,
  getAgentModel,
  getServiceAddressModel,
  getContactPersonModel,
  getClientDocumentModel,
  getTableName
} from '../models';
import { addDays } from 'date-fns';
import { ClientBody } from '../../typings/body/ClientBody';
import TableNames from '../enums/TableNames';
import ClientQueryParams from '../../typings/params/ClientQueryParams';
import { sequelize } from '../../config/database';

export const getPaginated = async (
  offset?: number,
  limit?: number,
  q?: string,
  agentId?: number[],
  orderBy?: string
): Promise<{ rows: Client[]; count: number }> => {
  const model = getClientModel();
  const Agent = getAgentModel();
  const ServiceAddress = getServiceAddressModel();

  // eslint-disable-next-line
  let where: any = {};
  const include = [];

  if (q) {
    where[Op.or] = {
      name: { [Op.iLike]: `%${q}%` },
      '$ServiceAddresses.address$': { [Op.iLike]: `%${q}%` }
    };
    include.push({ model: ServiceAddress, required: false });
  }

  if (agentId) {
    where.agentId = Array.isArray(agentId) ? { [Op.in]: agentId } : agentId;
  }

  include.push({ model: Agent, required: false });

  return await model.findAndCountAll<Client>({
    attributes: [
      'id',
      'name',
      'clientType',
      'billingAddress',
      'billingFloorNo',
      'billingUnitNo',
      'billingPostal',
      'idQboWithGST',
      'idQboWithoutGST',
      'updatedAt',
      'agentId',
      'description',
      'remarks'
    ],
    offset,
    limit,
    where,
    subQuery: false,
    include,
    order: [[orderBy || 'id', 'desc']]
  });
};

export const get = async (query: ClientQueryParams): Promise<Client[]> => {
  const Client = getTableName(TableNames.Client);
  const Agent = getTableName(TableNames.Agent);
  const ServiceAddress = getTableName(TableNames.ServiceAddress);
  const ContactPerson = getTableName(TableNames.ContactPerson);

  const { s, l, q, ai, ob } = query;
  const where: string[] = [];
  if (q) {
    where.push(
      `c."name" ILIKE '%${q}%'
       OR sa."address" ILIKE '%${q}%'
       OR cp."contactNumber" ILIKE '%${q}%'
       OR cp."contactEmail" ILIKE '%${q}%'
       OR cp."description" ILIKE '%${q}%'
       `
    );
  }

  if (ai) {
    where.push(`a."id" IN (${ai})`);
  }

  const result: Client[] = await sequelize.query(
    `SELECT
    c."id" AS "id",
    c."name" AS "name",
    c."clientType" AS "clientType",
    c."description" AS "description",
    c."remarks" AS "remarks",
    c."createdAt" As "createdAt",

    a."name" AS "agentName",
    (SELECT json_agg(cp.*) FROM ${ContactPerson} as cp WHERE cp."clientId" = c."id") AS "ContactPersons",
    (SELECT json_agg(sa.*) FROM ${ServiceAddress} as sa WHERE sa."clientId" = c."id") AS "ServiceAddresses"

    FROM
      ${Client} as c
      LEFT JOIN ${Agent} AS a ON c."agentId" = a."id"
      LEFT JOIN ${ServiceAddress} AS sa ON sa."clientId" = c."id"
      LEFT JOIN ${ContactPerson} AS cp ON cp."clientId" = c."id"
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      GROUP BY c."id", a."id"
      ORDER BY ${ob ? ob : `c."id"`}  desc
      OFFSET  ${s ? s : 0} ${l ? `LIMIT ${l}` : ''}
      `,
    {
      type: QueryTypes.SELECT
    }
  );

  return result;
};

export const getCount = async (query: ClientQueryParams): Promise<number> => {
  const Client = getTableName(TableNames.Client);
  const Agent = getTableName(TableNames.Agent);
  const ServiceAddress = getTableName(TableNames.ServiceAddress);
  const ContactPerson = getTableName(TableNames.ContactPerson);

  const { q, ai } = query;

  const where: string[] = [];
  if (q) {
    where.push(
      `c."name" ILIKE '%${q}%'
       OR sa."address" ILIKE '%${q}%'
       OR cp."contactNumber" ILIKE '%${q}%'
       OR cp."contactEmail" ILIKE '%${q}%'
       OR cp."description" ILIKE '%${q}%'
       `
    );
  }

  if (ai) {
    where.push(`a."id" IN (${ai})`);
  }
  const result: CountQueryReturn = await sequelize.query(
    `SELECT COUNT(DISTINCT c."id")
    FROM
      ${Client} as c
      LEFT JOIN ${Agent} AS a ON c."agentId" = a."id"
      ${
        where.length
          ? `LEFT JOIN ${ServiceAddress} AS sa ON sa."clientId" = c."id"
        LEFT JOIN ${ContactPerson} AS cp ON cp."clientId" = c."id"
        WHERE ${where.join(' AND ')}`
          : ''
      }
      `,
    {
      type: QueryTypes.SELECT
    }
  );
  return result[0] ? +result[0].count : 0;
};

export const getById = async (id: number): Promise<Client> => {
  const model = getClientModel();
  const Agent = getAgentModel();
  const ServiceAddress = getServiceAddressModel();
  const ContactPerson = getContactPersonModel();
  const ClientDocument = getClientDocumentModel();

  return model.findByPk<Client>(id, {
    include: [
      { model: Agent, required: false },
      { model: ServiceAddress, required: false },
      {
        model: ContactPerson,
        required: false,
        as: 'ContactPersons',
        order: [[Sequelize.literal('CASE WHEN `ContactPersons`.`isMain` THEN 0 ELSE 1 END'), 'ASC']]
      },
      { model: ClientDocument, required: false, as: 'ClientDocuments' }
    ],
    order: [[ServiceAddress, 'id', 'ASC']]
  });
};

export const createClient = async (req: ClientBody): Promise<Client> => {
  const model = getClientModel();

  const {
    name,
    clientType,
    billingAddress,
    billingFloorNo,
    billingUnitNo,
    billingPostal,
    remarks,
    emailReminder,
    whatsAppReminder,
    emailJobReport,
    agentId,
    priceReportVisibility
  } = req;

  return model.create<Client>({
    name,
    clientType,
    billingAddress,
    billingFloorNo,
    billingUnitNo,
    billingPostal,
    remarks,
    emailReminder,
    whatsAppReminder,
    emailJobReport,
    agentId: agentId === 0 ? null : agentId,
    priceReportVisibility
  });
};

export const countByClientName = async (name: string, currentId?: number): Promise<number> => {
  const model = getClientModel();

  const where: WhereOptions = { name: { [Op.iLike]: name } };

  if (currentId) {
    where.id = { [Op.ne]: currentId };
  }

  return model.count({ where });
};

export const countActiveServiceByClient = async (clientId: number): Promise<number> => {
  const model = getServiceModel();
  const currentDate = new Date();

  return model.count({ where: { clientId, serviceStatus: 'CONFIRMED', termEnd: { [Op.gte]: currentDate } } });
};

export const countExpiringServiceByClient = async (clientId: number): Promise<number> => {
  const model = getServiceModel();
  const currentDate = new Date();
  const lastDate = addDays(currentDate, 30);

  return model.count({
    where: {
      clientId,
      termEnd: { [Op.and]: { [Op.gte]: currentDate, [Op.lte]: lastDate } },
      serviceStatus: 'CONFIRMED',
      serviceType: { [Op.notLike]: 'ADDITIONAL' }
    }
  });
};

export const countExpiredServiceByClient = async (clientId: number): Promise<number> => {
  const model = getServiceModel();
  const currentDate = new Date();

  return model.count({
    where: { clientId, termEnd: { [Op.lt]: currentDate }, serviceStatus: 'CONFIRMED', serviceType: { [Op.notLike]: 'ADDITIONAL' } }
  });
};

export const sumServiceAmountByClient = async (clientId: number): Promise<Service[]> => {
  const model = getServiceModel();

  return model.findAll<Service>({
    attributes: [[Sequelize.fn('SUM', Sequelize.col('Service.totalAmount')), 'totalAmount']],
    where: { clientId, serviceStatus: 'CONFIRMED' },
    group: ['clientId'],
    raw: true
  });
};

export const updateEmailReminder = async (value: string, isActive: boolean): Promise<void> => {
  const model = getClientModel();

  const where: WhereOptions = {
    id: { [Op.notIn]: [-1] }
  };

  await model.update({ [`${value}`]: isActive }, { where });
};

export const getClientByName = async (name: string): Promise<Client> => {
  const model = getClientModel();
  const ServiceAddress = getServiceAddressModel();

  return model.findOne<Client>({
    where: { name: { [Op.iLike]: `%${name}%` } },
    include: [{ model: ServiceAddress, required: false }],
    order: [[ServiceAddress, 'id', 'ASC']]
  });
};

export const getClientByContactPersonNumber = async (contactNumber: string): Promise<Client | null> => {
  const model = getClientModel();
  const ContactPerson = getContactPersonModel();
  const ServiceAddress = getServiceAddressModel();

  const raw = contactNumber ? contactNumber.trim() : '';

  if (!raw) return null;

  // normalize: remove spaces
  const normalized = raw.replace(/\s+/g, '');
  const normalizedWithoutPlus = normalized.startsWith('+') ? normalized.slice(1) : normalized;

  // search by concatenated countryCode + contactNumber (supports with/without leading +)
  const concatField = Sequelize.fn('concat', Sequelize.col('countryCode'), Sequelize.col('contactNumber'));

  return model.findOne<Client>({
    include: [
      {
        model: ContactPerson,
        required: true,
        as: 'ContactPersons',
        where: {
          [Op.or]: [
            Sequelize.where(concatField, { [Op.iLike]: `%${normalized}%` }),
            Sequelize.where(concatField, { [Op.iLike]: `%${normalizedWithoutPlus}%` })
          ]
        }
      },
      { model: ServiceAddress, required: false }
    ]
  });
};

export const deleteClient = async (id: number): Promise<void> => {
  const model = getClientModel();

  await model.destroy({ where: { id } });
};
