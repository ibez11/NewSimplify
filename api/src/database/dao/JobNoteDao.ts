import { Op, Transaction, IncludeOptions, QueryTypes } from 'sequelize';
import { getJobModel, getJobNoteModel, getUserProfileModel, getEquipmentModel, getServiceModel, getJobNoteMediaModel, getTableName } from '../models';
import JobNote from '../models/JobNote';
import { JobStatus } from '../models/Job';
import { JobNoteBody } from '../../typings/body/JobNoteBody';
import JobNoteQueryParams from '../../typings/params/JobNoteQueryParams';
import { sequelize } from '../../config/database';
import TableNames from '../enums/TableNames';

export const getPaginated = async (jobId: number, query: JobNoteQueryParams): Promise<{ rows: JobNote[]; count: number }> => {
  const [count, rows] = await Promise.all([getCountJobNotes(jobId, query), getJobNotesByJobId(jobId, query)]);

  return { count, rows };
};

export const getById = async (id: number): Promise<JobNote> => {
  const model = getJobNoteModel();
  const UserProfile = getUserProfileModel();
  const Equipment = getEquipmentModel();
  const JobNoteMedia = getJobNoteMediaModel();

  return model.findByPk<JobNote>(id, {
    include: [
      { model: UserProfile, required: false, attributes: ['displayName'] },
      // { model: Equipment, required: false },
      { model: JobNoteMedia, required: false, where: { fileName: { [Op.and]: [{ [Op.not]: null }, { [Op.not]: '' }] } } }
    ]
  });
};

// delete soon
export const getJobNoteByJobId = async (
  jobId: number,
  jobNoteType?: string,
  offset?: number,
  limit?: number
): Promise<{ rows: JobNote[]; count: number }> => {
  const model = getJobNoteModel();
  const JobNoteMedia = getJobNoteMediaModel();
  const UserProfile = getUserProfileModel();
  const Equipment = getEquipmentModel();

  const where = jobNoteType !== undefined ? { jobId, jobNoteType } : { jobId };

  return model.findAndCountAll<JobNote>({
    where: where,
    order: [['id', 'asc']],
    include: [
      { model: JobNoteMedia, required: false, where: { fileName: { [Op.and]: [{ [Op.not]: null }, { [Op.not]: '' }] } } },
      { model: UserProfile, required: false, attributes: ['displayName'] }
      // { model: Equipment, required: false }
    ],
    offset,
    limit
  });
};

export const getJobNotesByJobId = async (jobId?: number, query?: JobNoteQueryParams): Promise<JobNote[]> => {
  const { s, l, equipmentIds } = query;

  const JobNote = getTableName(TableNames.JobNote);
  const Equipment = getTableName(TableNames.Equipment);
  const JobNoteEquipment = getTableName(TableNames.JobNoteEquipment);
  const JobNoteMedia = getTableName(TableNames.JobNoteMedia);
  const UserProfile = getTableName(TableNames.UserProfile);

  const where: string[] = [];
  if (jobId || jobId == 0) {
    where.push(`jn."jobId" = ${jobId}`);
  }
  if (equipmentIds && equipmentIds.length > 0) {
    where.push(`EXISTS (
       SELECT 1
       FROM ${JobNoteEquipment} as jne
       INNER JOIN ${Equipment} as e ON e."id" = jne."equipmentId"
       WHERE jne."jobNoteId" = jn."id"
       AND e."id" IN (${equipmentIds})
     )`);
  }

  const result: JobNote[] = await sequelize.query(
    `SELECT
    jn."id",
    jn."notes",
    jn."isHide",
    jn."jobId",
    jn."createdAt",
    jn."updatedAt",
    up."displayName",
    (SELECT json_agg(
      json_build_object(
          'id', e."id",
          'brand', e."brand",
          'model', e."model",
          'serialNumber', e."serialNumber",
          'location', e."location",
          'dateWorkDone', e."dateWorkDone",
          'remarks', e."remarks",
          'serviceAddressId', e."serviceAddressId",
          'updatedBy', e."updatedBy",
          'isActive', e."isActive",
          'createdAt', to_char(e."createdAt", 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
          'updatedAt', to_char(e."updatedAt", 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
          'isMain', e."isMain",
          'mainId', e."mainId"
      )
    ) FROM ${Equipment} as e INNER JOIN ${JobNoteEquipment} as jne ON e."id"=jne."equipmentId" WHERE jne."jobNoteId"=jn."id") AS "Equipments",
    (SELECT json_agg(jm.*) FROM ${JobNoteMedia} as jm WHERE jm."jobNoteId"=jn."id" AND jm."fileName" IS NOT NULL) AS "JobNoteMedia"

    FROM
      ${JobNote} as jn
      INNER JOIN ${UserProfile} as up ON up."id"=jn."createdBy"
      ${where.length > 0 ? ` WHERE ${where.join(' AND ')}` : ''}
      GROUP BY jn."id", up."id"
      ORDER BY jn."id" desc
      OFFSET ${s ? s : 0} ${l ? `LIMIT ${l}` : ''}
    
    `,
    {
      type: QueryTypes.SELECT
    }
  );

  return result;
};

export const getCountJobNotes = async (jobId?: number, query?: JobNoteQueryParams): Promise<number> => {
  const s = query?.s;
  const l = query?.l;
  const equipmentIds = query?.equipmentIds;

  const JobNote = getTableName(TableNames.JobNote);
  const Equipment = getTableName(TableNames.Equipment);
  const JobNoteEquipment = getTableName(TableNames.JobNoteEquipment);

  const where: string[] = [];
  if (jobId) {
    where.push(`jn."jobId" = ${jobId}`);
  }
  if (equipmentIds && equipmentIds.length > 0) {
    where.push(`EXISTS (
      SELECT 1
      FROM ${JobNoteEquipment} as jne
      INNER JOIN ${Equipment} as e ON e."id" = jne."equipmentId"
      WHERE jne."jobNoteId" = jn."id"
      AND e."id" IN (${equipmentIds})
    )`);
  }

  const countQuery: CountQueryReturn = await sequelize.query(
    `
    SELECT COUNT(DISTINCT jn."id") AS "count"
    FROM ${JobNote} as jn
    ${where.length > 0 ? ` WHERE ${where.join(' AND ')}` : ''}
    OFFSET ${s ? s : 0} ${l ? `LIMIT ${l}` : ''}
  `,
    {
      type: QueryTypes.SELECT
    }
  );

  return countQuery[0] ? +countQuery[0].count : 0;
};

export const getPreviousJobNoteByJobId = async (
  currentJobId: number,
  serviceId: number,
  jobNoteType?: string,
  offset?: number,
  limit?: number
): Promise<{ rows: JobNote[]; count: number }> => {
  const model = getJobNoteModel();
  const Job = getJobModel();
  const UserProfile = getUserProfileModel();
  const JobNoteMedia = getJobNoteMediaModel();

  const include: IncludeOptions[] = [
    {
      model: Job,
      required: true,
      attributes: []
    },
    { model: UserProfile, required: false, attributes: ['displayName'] },
    { model: JobNoteMedia, required: false, where: { fileName: { [Op.and]: [{ [Op.not]: null }, { [Op.not]: '' }] } } }
  ];

  const where = {
    [Op.and]: {
      '$Job.jobStatus$': JobStatus.COMPLETED,
      '$Job.serviceId$': serviceId,
      jobNoteType: { [Op.iLike]: `%${jobNoteType ? jobNoteType : ''}%` }
    },
    [Op.not]: { jobId: currentJobId }
  };

  return model.findAndCountAll<JobNote>({ where, include, order: [['id', 'asc']], offset, limit });
};

export const getPreviousJobNoteByClientId = async (
  currentJobId: number,
  clientId: number,
  jobNoteType?: string,
  offset?: number,
  limit?: number
): Promise<{ rows: JobNote[]; count: number }> => {
  const model = getJobNoteModel();
  const Job = getJobModel();
  const UserProfile = getUserProfileModel();
  const Service = getServiceModel();
  const JobNoteMedia = getJobNoteMediaModel();

  const include: IncludeOptions[] = [
    {
      model: Job,
      required: true,
      attributes: [],
      include: [{ model: Service, required: true }]
    },
    { model: UserProfile, required: false, attributes: ['displayName'] },
    { model: JobNoteMedia, required: false, where: { fileName: { [Op.and]: [{ [Op.not]: null }, { [Op.not]: '' }] } } }
  ];

  const where = {
    [Op.and]: {
      '$Job.jobStatus$': JobStatus.COMPLETED,
      '$Job.Service.clientId$': clientId,
      jobNoteType: { [Op.iLike]: `%${jobNoteType ? jobNoteType : ''}%` }
    },
    [Op.not]: { jobId: currentJobId }
  };

  return model.findAndCountAll<JobNote>({ where, include, order: [['id', 'asc']], offset, limit });
};

export const getPreviousJobNotesByClientId = async (currentJobId: number, clientId: number, query?: JobNoteQueryParams): Promise<JobNote[]> => {
  const { s, l, equipmentIds } = query;

  const Job = getTableName(TableNames.Job);
  const Service = getTableName(TableNames.Service);
  const JobNote = getTableName(TableNames.JobNote);
  const Equipment = getTableName(TableNames.Equipment);
  const JobNoteEquipment = getTableName(TableNames.JobNoteEquipment);
  const JobNoteMedia = getTableName(TableNames.JobNoteMedia);
  const UserProfile = getTableName(TableNames.UserProfile);

  const where: string[] = [];
  where.push(`jn."jobId" != ${currentJobId} AND j."jobStatus" = '${JobStatus.COMPLETED}' AND s."clientId" = ${clientId}`);
  if (equipmentIds && equipmentIds.length > 0) {
    where.push(`EXISTS (
       SELECT 1
       FROM ${JobNoteEquipment} as jne
       INNER JOIN ${Equipment} as e ON e."id" = jne."equipmentId"
       WHERE jne."jobNoteId" = jn."id"
       AND e."id" IN (${equipmentIds})
     )`);
  }

  const result: JobNote[] = await sequelize.query(
    `SELECT
    jn."id",
    jn."notes",
    jn."isHide",
    jn."jobId",
    jn."createdAt",
    jn."updatedAt",
    up."displayName",
    (SELECT json_agg(
      json_build_object(
          'id', e."id",
          'brand', e."brand",
          'model', e."model",
          'serialNumber', e."serialNumber",
          'location', e."location",
          'dateWorkDone', e."dateWorkDone",
          'remarks', e."remarks",
          'serviceAddressId', e."serviceAddressId",
          'updatedBy', e."updatedBy",
          'isActive', e."isActive",
          'createdAt', to_char(e."createdAt", 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
          'updatedAt', to_char(e."updatedAt", 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
          'isMain', e."isMain",
          'mainId', e."mainId"
      )
    ) FROM ${Equipment} as e INNER JOIN ${JobNoteEquipment} as jne ON e."id"=jne."equipmentId" WHERE jne."jobNoteId"=jn."id") AS "Equipments",
    (SELECT json_agg(jm.*) FROM ${JobNoteMedia} as jm WHERE jm."jobNoteId"=jn."id" AND jm."fileName" IS NOT NULL) AS "JobNoteMedia"

    FROM
      ${JobNote} as jn
      INNER JOIN ${UserProfile} as up ON up."id"=jn."createdBy"
      INNER JOIN ${Job} as j ON j."id"=jn."jobId"
      INNER JOIN ${Service} as s ON s."id"=j."serviceId"
      ${where.length > 0 ? ` WHERE ${where.join(' AND ')}` : ''}
      GROUP BY jn."id", up."id"
      ORDER BY jn."id" desc
      OFFSET ${s ? s : 0} ${l ? `LIMIT ${l}` : ''}
    
    `,
    {
      type: QueryTypes.SELECT
    }
  );

  return result;
};

export const getCountPreviousJobNotesByClientId = async (currentJobId: number, clientId: number, query?: JobNoteQueryParams): Promise<number> => {
  const s = query?.s;
  const l = query?.l;
  const equipmentIds = query?.equipmentIds;

  const Job = getTableName(TableNames.Job);
  const Service = getTableName(TableNames.Service);
  const JobNote = getTableName(TableNames.JobNote);
  const Equipment = getTableName(TableNames.Equipment);
  const JobNoteEquipment = getTableName(TableNames.JobNoteEquipment);
  const UserProfile = getTableName(TableNames.UserProfile);

  const where: string[] = [];
  where.push(`jn."jobId" != ${currentJobId} AND j."jobStatus" = '${JobStatus.COMPLETED}' AND s."clientId" = ${clientId}`);
  if (equipmentIds && equipmentIds.length > 0) {
    where.push(`EXISTS (
       SELECT 1
       FROM ${JobNoteEquipment} as jne
       INNER JOIN ${Equipment} as e ON e."id" = jne."equipmentId"
       WHERE jne."jobNoteId" = jn."id"
       AND e."id" IN (${equipmentIds})
     )`);
  }

  const countQuery: CountQueryReturn = await sequelize.query(
    `SELECT COUNT(DISTINCT jn."id") AS "count"
    
    FROM
      ${JobNote} as jn
      INNER JOIN ${UserProfile} as up ON up."id"=jn."createdBy"
      INNER JOIN ${Job} as j ON j."id"=jn."jobId"
      INNER JOIN ${Service} as s ON s."id"=j."serviceId"
      ${where.length > 0 ? ` WHERE ${where.join(' AND ')}` : ''}
      OFFSET ${s ? s : 0} ${l ? `LIMIT ${l}` : ''}
    
    `,
    {
      type: QueryTypes.SELECT
    }
  );

  return countQuery[0] ? +countQuery[0].count : 0;
};

export const createJobNote = async (query: JobNoteBody): Promise<JobNote> => {
  const model = getJobNoteModel();

  const { notes, jobNoteType, jobId, equipmentId, createdBy } = query;

  return model.create<JobNote>({
    notes,
    jobNoteType,
    isHide: false,
    jobId,
    equipmentId,
    createdBy
  });
};

// eslint-disable-next-line
export const deleteJobById = async (id: number, transaction: Transaction): Promise<any> => {
  const model = getJobNoteModel();

  return model.destroy({ where: { id }, transaction });
};

export const getJobNoteByEquipmentId = async (equipmentId: number, offset?: number, limit?: number): Promise<JobNote[]> => {
  // const model = getJobNoteModel();
  // const UserProfile = getUserProfileModel();
  // const JobNoteMedia = getJobNoteMediaModel();

  // return model.findAndCountAll<JobNote>({
  //   include: [
  //     { model: UserProfile, required: false, attributes: ['displayName'] },
  //     { model: JobNoteMedia, required: false, where: { fileName: { [Op.and]: [{ [Op.not]: null }, { [Op.not]: '' }] } } }
  //   ],
  //   where: { equipmentId },
  //   order: [['id', 'desc']],
  //   offset,
  //   limit
  // });

  // const { s, l, equipmentIds } = query;

  const JobNote = getTableName(TableNames.JobNote);
  const Equipment = getTableName(TableNames.Equipment);
  const JobNoteEquipment = getTableName(TableNames.JobNoteEquipment);
  const JobNoteMedia = getTableName(TableNames.JobNoteMedia);
  const UserProfile = getTableName(TableNames.UserProfile);

  const where: string[] = [];
  if (equipmentId) {
    where.push(`EXISTS (
       SELECT 1
       FROM ${JobNoteEquipment} as jne
       INNER JOIN ${Equipment} as e ON e."id" = jne."equipmentId"
       WHERE jne."jobNoteId" = jn."id"
       AND e."id" IN (${equipmentId})
     )`);
  }

  const result: JobNote[] = await sequelize.query(
    `SELECT
    jn."id",
    jn."notes",
    jn."isHide",
    jn."jobNoteType",
    jn."jobId",
    jn."createdAt",
    jn."updatedAt",
    jn."createdBy",
    up."displayName",
    COALESCE(
        (SELECT json_agg(jm.*) 
         FROM ${JobNoteMedia} as jm 
         WHERE jm."jobNoteId" = jn."id"
         AND jm."fileName" IS NOT NULL), 
        '[]'::json
    ) AS "JobNoteMedia",
    (SELECT json_build_object('displayName', up."displayName") FROM ${UserProfile} as up WHERE up."id"=jn."createdBy") AS "UserProfile"

    FROM
      ${JobNote} as jn
      INNER JOIN ${UserProfile} as up ON up."id"=jn."createdBy"
      ${where.length > 0 ? ` WHERE ${where.join(' AND ')}` : ''}
      GROUP BY jn."id", up."id"
      ORDER BY jn."id" desc
      OFFSET ${offset ? offset : 0} ${limit ? `LIMIT ${limit}` : ''}
    
    `,
    {
      type: QueryTypes.SELECT
    }
  );

  return result;
};
