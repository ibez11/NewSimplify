import { QueryTypes } from 'sequelize';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { sequelize } from '../../config/database';
import TableNames from '../enums/TableNames';
import { JobStatus } from '../models/Job';
import { getTableName } from '../models';
import { ReportLineResponseModel, ReportCountResponseModel, ReportValueJobResponseModel } from '../../typings/ResponseFormats';

export const getJobsReports = async (
  startDate: string,
  endDate: string,
  technician?: number,
  vehicle?: number,
  jobStatus?: string
): Promise<ReportLineResponseModel[]> => {
  const Job = getTableName(TableNames.Job);
  const UserProfileJob = getTableName(TableNames.UserProfileJob);
  const VehicleJob = getTableName(TableNames.VehicleJob);
  let optionalCondition = '';

  if (technician) {
    optionalCondition = `
      LEFT JOIN ${UserProfileJob} upj ON upj."jobId" = j.id
      WHERE upj."userProfileId" = ${technician} AND
    `;
  }

  if (vehicle) {
    optionalCondition = `
      LEFT JOIN ${VehicleJob} vhj ON vhj."jobId" = j.id
      WHERE vhj."vehicleId" = ${vehicle} AND
    `;
  }

  const dateCondition = `AND j."startDateTime" >= '${startDate} 00:00:00' AND j."startDateTime" <= '${endDate} 23:59:59'`;

  const result: ReportLineResponseModel[] = await sequelize.query(
    `SELECT COUNT(j."id") AS "y", "startDateTime"::date AS "x"
    FROM ${Job} AS j
    ${optionalCondition ? optionalCondition : 'WHERE '}
    j."jobStatus" = '${jobStatus ? jobStatus : JobStatus.COMPLETED}'
    ${dateCondition}
    GROUP BY "startDateTime"::date
    ORDER BY "startDateTime"::date;`,
    {
      type: QueryTypes.SELECT
    }
  );

  return result;
};

export const getValueJobsReports = async (
  startDate: string,
  endDate: string,
  technician?: number,
  vehicle?: number,
  jobStatus?: string
): Promise<ReportValueJobResponseModel[]> => {
  const Job = getTableName(TableNames.Job);
  const UserProfileJob = getTableName(TableNames.UserProfileJob);
  const VehicleJob = getTableName(TableNames.VehicleJob);
  const ServiceItemJob = getTableName(TableNames.ServiceItemJob);
  const ServiceItem = getTableName(TableNames.ServiceItem);

  let optionalCondition = '';

  if (technician) {
    optionalCondition = `
      LEFT JOIN ${UserProfileJob} upj ON upj."jobId" = j.id
      WHERE upj."userProfileId" = ${technician} AND
    `;
  }

  if (vehicle) {
    optionalCondition = `
      LEFT JOIN ${VehicleJob} vhj ON vhj."jobId" = j.id
      WHERE vhj."vehicleId" = ${vehicle} AND
    `;
  }

  const dateCondition = `AND j."startDateTime" >= '${startDate} 00:00:00' AND j."startDateTime" <= '${endDate} 23:59:59'`;

  const result: ReportValueJobResponseModel[] = await sequelize.query(
    `SELECT SUM(si."totalPrice") as "totalAmount", COUNT(j."id") AS "y", "startDateTime"::date AS "x"
    FROM ${Job} AS j INNER JOIN ${ServiceItemJob} sij ON sij."jobId" = j."id" INNER JOIN ${ServiceItem} si ON sij."serviceItemId" = si."id"
    ${optionalCondition ? optionalCondition : 'WHERE '}
    j."jobStatus" = '${jobStatus ? jobStatus : JobStatus.COMPLETED}'
    ${dateCondition}
    GROUP BY "startDateTime"::date
    ORDER BY "startDateTime"::date;`,
    {
      type: QueryTypes.SELECT
    }
  );

  return result;
};

export const getValueAdditionalReports = async (
  startDate: string,
  endDate: string,
  technician?: number,
  vehicle?: number,
  jobStatus?: string
): Promise<ReportValueJobResponseModel[]> => {
  const Job = getTableName(TableNames.Job);
  const UserProfileJob = getTableName(TableNames.UserProfileJob);
  const VehicleJob = getTableName(TableNames.VehicleJob);
  const ServiceItem = getTableName(TableNames.ServiceItem);
  const Service = getTableName(TableNames.Service);

  let optionalCondition = '';

  if (technician) {
    optionalCondition = `
      LEFT JOIN ${UserProfileJob} upj ON upj."jobId" = j.id
      WHERE upj."userProfileId" = ${technician} AND
    `;
  }

  if (vehicle) {
    optionalCondition = `
      LEFT JOIN ${VehicleJob} vhj ON vhj."jobId" = j.id
      WHERE vhj."vehicleId" = ${vehicle} AND
    `;
  }

  const dateCondition = `AND j."startDateTime" >= '${startDate} 00:00:00' AND j."startDateTime" <= '${endDate} 23:59:59'`;

  const result: ReportValueJobResponseModel[] = await sequelize.query(
    `SELECT SUM(si."totalPrice") as "additionalAmount", "startDateTime"::date AS "x"
    FROM ${ServiceItem} AS si INNER JOIN ${Service} s ON si."serviceId" = s."id" INNER JOIN ${Job} j ON j."additionalServiceId" = s."id"
    ${optionalCondition ? optionalCondition : 'WHERE '}
    j."jobStatus" = '${jobStatus ? jobStatus : JobStatus.COMPLETED}' AND s."serviceType" = 'ADDITIONAL'
    ${dateCondition}
    GROUP BY "startDateTime"::date
    ORDER BY "startDateTime"::date;`,
    {
      type: QueryTypes.SELECT
    }
  );

  return result;
};

export const getRevenueReports = async (startDate: string, endDate: string): Promise<ReportLineResponseModel[]> => {
  const Service = getTableName(TableNames.Service);

  const dateCondition = `WHERE s."termStart" >= '${startDate}' AND s."termStart" <= '${endDate}'`;

  const result: ReportLineResponseModel[] = await sequelize.query(
    `SELECT
      SUM(s."totalAmount") AS "y",
      to_char(s."termStart", 'DD') AS "x",
      to_char(s."termStart", 'MM') AS "type"
    FROM ${Service} s
    ${dateCondition}
    GROUP BY s."termStart"
    ORDER BY s."termStart";`,
    {
      type: QueryTypes.SELECT
    }
  );

  return result;
};

export const getPopularContractsReports = async (startDate: string, endDate: string): Promise<ReportCountResponseModel[]> => {
  const Service = getTableName(TableNames.Service);

  const result: ReportCountResponseModel[] = await sequelize.query(
    `SELECT COUNT(id) as value, s."serviceType" as type
    FROM ${Service} s
    WHERE s."termStart" >= '${startDate}'
    AND s."termStart" <= '${endDate}'
    GROUP BY s."serviceType"
    ORDER BY s."serviceType";`,
    {
      type: QueryTypes.SELECT
    }
  );

  return result;
};

export const getPopularServiceItemsReports = async (startDate: string, endDate: string): Promise<ReportCountResponseModel[]> => {
  const Service = getTableName(TableNames.Service);
  const ServiceItem = getTableName(TableNames.ServiceItem);

  const result: ReportCountResponseModel[] = await sequelize.query(
    `SELECT COUNT(si."id") as value, si."name" as type
    FROM ${ServiceItem} si
    JOIN ${Service} s on s."id" = si."serviceId"
    WHERE s."termStart" >= '${startDate}'
    AND s."termStart" <= '${endDate}'
    GROUP BY si."name"
    ORDER BY value DESC
    LIMIT 10;`,
    {
      type: QueryTypes.SELECT
    }
  );

  return result;
};

export const getOverviewReports = async (selectedDate: string): Promise<ReportLineResponseModel[]> => {
  const Job = getTableName(TableNames.Job);

  const startDate = startOfMonth(new Date(selectedDate));
  const endDate = endOfMonth(new Date(selectedDate));

  const result: ReportLineResponseModel[] = await sequelize.query(
    `SELECT 
      COUNT(j."id") AS "y",
      j."startDateTime"::date as "x",
      j."jobStatus" AS "type"
    FROM ${Job} AS j
    WHERE j."jobStatus" != '${JobStatus.IN_PROGRESS}'
    AND j."startDateTime" >= '${format(startDate, 'yyyy-MM-dd HH:mm:ss')}'
    AND j."startDateTime" <= '${format(endDate, 'yyyy-MM-dd HH:mm:ss')}'
    GROUP BY j."jobStatus", j."startDateTime"::date
    ORDER BY "startDateTime"::date;`,
    {
      type: QueryTypes.SELECT
    }
  );

  return result;
};
