import { QueryTypes, Transaction } from 'sequelize';
import { EquipmentResponseModel } from '../../typings/ResponseFormats';
import TableNames from '../enums/TableNames';
import { getClientModel, getEquipmentModel, getServiceAddressModel, getTableName } from '../models';
import Equipment from '../models/Equipment';
import { format, endOfTomorrow, startOfWeek, endOfWeek, startOfMonth, lastDayOfMonth } from 'date-fns';
import { sequelize } from '../../config/database';
import { EquipmentQueryParam } from '../../typings/params/EquipmentQueryParam';

export const getPaginated = async (query?: EquipmentQueryParam): Promise<{ rows: EquipmentResponseModel[]; count: number }> => {
  const [count, rows] = await Promise.all([getCount(query), get(query)]);

  return { count, rows };
};

export const get = async (query?: EquipmentQueryParam): Promise<EquipmentResponseModel[]> => {
  const Equipment = getTableName(TableNames.Equipment);
  const ServiceAddress = getTableName(TableNames.ServiceAddress);
  const Client = getTableName(TableNames.Client);
  const UserProfile = getTableName(TableNames.UserProfile);

  const { s, l, ob, ot } = query;
  const where = generateWhereQuery(query);
  const order = generateOrderQuery(ob, ot);
  const offsetAndLimit = generateOffsetAndLimit(s, l);

  const result: EquipmentResponseModel[] = await sequelize.query(
    `SELECT e.*, sa.address, up."displayName", c."id" as "clientId", c."name" as "clientName",
    CASE WHEN COUNT(se.*) = 0 THEN NULL 
            ELSE json_agg(se.*) END as "SubEquipments"
    FROM ${Equipment} as e 
    INNER JOIN ${ServiceAddress} as sa ON e."serviceAddressId" = sa."id" 
    INNER JOIN ${Client} as c ON sa."clientId" = c."id"
    INNER JOIN ${UserProfile} as up ON e."updatedBy" = up."id"
    LEFT JOIN (
      SELECT se.*, up."displayName"
      FROM ${Equipment} as se
      INNER JOIN ${UserProfile} as up ON se."updatedBy" = up."id"
      ORDER BY se."id" DESC
  ) as se ON e."id" = se."mainId"
    ${where} GROUP BY e."id", sa."address", up."displayName", c."id", c."name" ${order} ${offsetAndLimit}
    `,
    { type: QueryTypes.SELECT }
  );

  return result;
};

export const getCount = async (query?: EquipmentQueryParam): Promise<number> => {
  const Equipment = getTableName(TableNames.Equipment);
  const ServiceAddress = getTableName(TableNames.ServiceAddress);
  const Client = getTableName(TableNames.Client);

  const where = generateWhereQuery(query);

  const result: CountQueryReturn = await sequelize.query(
    `SELECT count(*)
    FROM ${Equipment} as e 
    INNER JOIN ${ServiceAddress} as sa ON e."serviceAddressId" = sa."id" 
    INNER JOIN ${Client} as c ON sa."clientId" = c."id"
    ${where}`,
    { type: QueryTypes.SELECT }
  );

  return +result[0].count;
};

const generateWhereQuery = (query?: EquipmentQueryParam) => {
  const conditions: string[] = [];

  const { q, fb, sd, ed, ci, sai } = query;

  if (q) {
    conditions.push(
      `(CAST(e."id" AS TEXT) ILIKE '%${q}%' OR e."brand" ILIKE '%${q}%' OR e."location" ILIKE '%${q}%' OR e."model" ILIKE '%${q}%' OR e."serialNumber" ILIKE '%${q}%' OR sa."address" ILIKE '%${q}%' OR c."name" ILIKE '%${q}%')`
    );
  }

  if (sai) {
    conditions.push(`e."serviceAddressId" IN (${sai})`);
  }

  if (query.brands) {
    const brands = Array.isArray(query.brands) ? query.brands : [query.brands];
    console.log(brands);

    const brandsArray = brands.map(b => `'${b.replace(/'/g, "''")}'`).join(', ');
    conditions.push(`e."brand" IN (${brandsArray})`);
  }

  if (fb) {
    let filterValue = '';
    if (fb === '1') {
      filterValue = `e."dateWorkDone" = '${format(new Date(), 'yyyy-MM-dd')}'`;
    } else if (fb === '2') {
      filterValue = `e."dateWorkDone" = '${format(new Date(endOfTomorrow()), 'yyyy-MM-dd')}'`;
    } else if (fb === '3') {
      const firstInWeek = format(startOfWeek(new Date()), 'yyyy-MM-dd');
      const lastInWeek = format(endOfWeek(new Date()), 'yyyy-MM-dd');
      filterValue = `e."dateWorkDone" >= '${firstInWeek}' AND e."dateWorkDone" <= '${lastInWeek}'`;
    } else if (fb === '4') {
      const firstDateOfMonth = format(startOfMonth(new Date()), 'yyyy-MM-dd');
      const lastDateOfMonth = format(lastDayOfMonth(new Date()), 'yyyy-MM-dd');
      filterValue = `e."dateWorkDone" >= '${firstDateOfMonth}' AND e."dateWorkDone" <= '${lastDateOfMonth}'`;
    } else if (fb === '5') {
      const firstDate = format(new Date(sd), 'yyyy-MM-dd');
      const secondDate = format(new Date(ed), 'yyyy-MM-dd');
      filterValue = `e."dateWorkDone" >= '${firstDate}' AND e."dateWorkDone" <= '${secondDate}'`;
    }

    conditions.push(filterValue);
  }

  if (ci) {
    conditions.push(`c."id"= ${ci}`);
  }

  return `WHERE e."mainId" IS NULL${conditions.length ? ' AND ' + conditions.join(' AND ') : ''}`;
};

const generateOrderQuery = (by?: string, type?: string) => {
  let orderBy = by || 'e."id"';
  const orderType = type || 'ASC';

  if (by === 'id') {
    orderBy = 'e."id"';
  } else if (by === 'model') {
    orderBy = 'e."model"';
  } else if (by === 'brand') {
    orderBy = 'e."brand"';
  } else if (by === 'serialNumber') {
    orderBy = 'e."serialNumber"';
  } else if (by === 'location') {
    orderBy = 'e."location"';
  } else if (by === 'dateWorkDone') {
    orderBy = 'e."dateWorkDone"';
  } else if (by === 'updatedBy') {
    orderBy = 'e."updatedBy"';
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getEquipmentById = async (id: number): Promise<any> => {
  const Equipment = getTableName(TableNames.Equipment);
  const ServiceAddress = getTableName(TableNames.ServiceAddress);
  const Client = getTableName(TableNames.Client);
  const UserProfile = getTableName(TableNames.UserProfile);

  const result = await sequelize.query(
    `SELECT e.*, sa.address, up."displayName", c."name" as "clientName",
    CASE WHEN COUNT(se.*) = 0 THEN NULL 
            ELSE json_agg(se.*) END as "SubEquipments"
    FROM ${Equipment} as e 
    INNER JOIN ${ServiceAddress} as sa ON e."serviceAddressId" = sa."id" 
    INNER JOIN ${Client} as c ON sa."clientId" = c."id"
    INNER JOIN ${UserProfile} as up ON e."updatedBy" = up."id"
    LEFT JOIN (
      SELECT se.* , up."displayName"
      FROM ${Equipment} as se
      INNER JOIN ${UserProfile} as up ON se."updatedBy" = up."id"
      ORDER BY se."id" DESC
  ) as se ON e."id" = se."mainId"
    WHERE e."id" = ${id}
    GROUP BY e."id", sa."id", up."id", c."name"
    `,
    { type: QueryTypes.SELECT }
  );

  return result ? result[0] : [];
};

export const getEquipmentDetailById = async (id: number): Promise<Equipment> => {
  const model = getEquipmentModel();
  const ServiceAddress = getServiceAddressModel();
  const Client = getClientModel();
  const include = [
    { model: ServiceAddress, required: false, as: 'ServiceAddress', include: [{ model: Client, required: false, attributes: ['name'] }] }
  ];
  return model.findByPk<Equipment>(id, { include });
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
export const getEquipmentByMainId = async (mainId: number, isActive?: any): Promise<Equipment[]> => {
  const model = getEquipmentModel();
  const where = isActive !== undefined ? { mainId, isActive } : { mainId };
  return model.findAll<Equipment>({ where: where, order: [['id', 'desc']] });
};

export const createEquipment = async (body: EquipmentResponseModel, transaction: Transaction): Promise<Equipment> => {
  const models = getEquipmentModel();

  try {
    const isMain = body.mainId === undefined || body.mainId === null || body.mainId === 0 ? true : false;
    return await models.create<Equipment>(
      {
        brand: body.brand,
        model: body.model,
        serialNumber: body.serialNumber,
        location: body.location,
        dateWorkDone: body.dateWorkDone,
        remarks: body.remarks,
        serviceAddressId: body.serviceAddressId,
        updatedBy: body.updatedBy,
        isActive: true,
        isMain: isMain,
        mainId: body.mainId,
        warrantyStartDate: body.warrantyStartDate,
        warrantyEndDate: body.warrantyEndDate,
        description: body.description
      },
      { transaction }
    );
  } catch (error) {
    throw error;
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const bulkCreateSubEquipment = async (value: Equipment[], transaction?: Transaction): Promise<any> => {
  const model = getEquipmentModel();
  return model.bulkCreate(value, { validate: false, transaction });
};

export const deleteEquipment = async (id: number): Promise<void> => {
  const model = getEquipmentModel();

  await model.destroy({ where: { id } });
};

export const countByEquipment = async (id: number): Promise<Equipment> => {
  const model = getEquipmentModel();

  return model.findOne<Equipment>({ where: { id } });
};

export const getEquipmentByServiceAddressId = async (
  serviceAddressId: number,
  isActive?: boolean,
  offset?: number,
  limit?: number
): Promise<Equipment[]> => {
  const model = getEquipmentModel();

  const where = isActive !== undefined ? { serviceAddressId, isMain: true, isActive } : { serviceAddressId, isMain: true };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const options: any = { where: where, order: [['createdAt', 'desc']] };

  if (offset !== undefined && limit !== undefined) {
    options.offset = offset;
    options.limit = limit;
  }

  return await model.findAll<Equipment>(options);
};

export const countBySerialNumber = async (serialNumber: string): Promise<number> => {
  const model = getEquipmentModel();

  return model.count({ where: { serialNumber } });
};

export const getEquipmentByServiceItemId = async (serviceItemId: number): Promise<Equipment[]> => {
  const Equipment = getTableName(TableNames.Equipment);
  const serviceItemEquipment = getTableName(TableNames.ServiceItemEquipment);

  const result: Equipment[] = await sequelize.query(
    `SELECT e.* FROM ${Equipment} e
      INNER JOIN ${serviceItemEquipment} sie ON e."id" = sie."equipmentId"
      WHERE sie."serviceItemId" = ${serviceItemId} ORDER BY e.brand ASC`,
    { type: QueryTypes.SELECT }
  );

  return result;
};

export const exportCsv = async (clientId?: number): Promise<EquipmentResponseModel[]> => {
  const Equipment = getTableName(TableNames.Equipment);
  const ServiceAddress = getTableName(TableNames.ServiceAddress);
  const Client = getTableName(TableNames.Client);
  const UserProfile = getTableName(TableNames.UserProfile);

  let where = '';
  if (clientId) {
    where = `AND c."id" = ${clientId}`;
  }

  const result: EquipmentResponseModel[] = await sequelize.query(
    `SELECT e.*, sa.address, up."displayName", c."name" as "clientName"
    FROM ${Equipment} as e 
    INNER JOIN ${ServiceAddress} as sa ON e."serviceAddressId" = sa."id" 
    INNER JOIN ${Client} as c ON sa."clientId" = c."id"
    INNER JOIN ${UserProfile} as up ON e."updatedBy" = up."id"
    WHERE e."isMain" = true ${where}
    GROUP BY e."id", sa."address", up."displayName", c."name"
    ORDER BY e."id" DESC
    `,
    { type: QueryTypes.SELECT }
  );

  return result;
};

export const getEquipmentByJobNoteId = async (jobNoteId: number): Promise<Equipment[]> => {
  const Equipment = getTableName(TableNames.Equipment);
  const JobNoteEquipment = getTableName(TableNames.JobNoteEquipment);

  const result: Equipment[] = await sequelize.query(
    `SELECT e.* FROM ${Equipment} e
      INNER JOIN ${JobNoteEquipment} jne ON e."id" = jne."equipmentId"
      WHERE jne."jobNoteId" = ${jobNoteId} ORDER BY e.brand ASC`,
    { type: QueryTypes.SELECT }
  );

  return result;
};
