import { Op, QueryTypes, Transaction, WhereOptions, Sequelize } from 'sequelize';
import { format, startOfWeek, endOfWeek, endOfTomorrow, lastDayOfMonth, startOfMonth, subMonths } from 'date-fns';
import { getTableName, getJobModel } from '../models';
import {
  JobResponseModel,
  JobCsvResponseModel,
  ParametersResponseModel,
  JobGenerateResponseModel,
  JobSmartRankingResponseModel
} from '../../typings/ResponseFormats';
import TableNames from '../enums/TableNames';
import { sequelize } from '../../config/database';
import { JobStatus } from '../models/Job';
import { ServiceStatus } from '../models/Service';
import Job from '../models/Job';
import { JobQueryParams } from '../../typings/params/JobQueryParams';
import * as UserProfileDao from './UserProfileDao';
import * as SettingService from '../../services/SettingService';

/** Start the job search query */
export const getPaginated = async (query: JobQueryParams, id: number): Promise<{ rows: JobResponseModel[]; count: number }> => {
  const [count, rows] = await Promise.all([
    getCount(query),
    query.fb == '8' ? getJobsSchedule(query, id) : query.withDetails ? getJobsWithDetails(query, id) : get(query, id)
  ]);

  return { count, rows };
};

export const exportCsv = async (query: JobQueryParams): Promise<{ rows: JobCsvResponseModel[] }> => {
  const [rows] = await Promise.all([getDataCsv(query)]);

  return { rows };
};

export const getColumnFilter = async (): Promise<{ vehicles: ParametersResponseModel[]; employes: ParametersResponseModel[] }> => {
  const [vehicles, employes] = await Promise.all([getVehicles(), getEmployes()]);
  return { vehicles, employes };
};

// eslint-disable-next-line
export const jobInformation = async (startDate: string, endDate: string, jobStatus?: string, justCount?: boolean): Promise<any> => {
  const Job = getTableName(TableNames.Job);
  const Service = getTableName(TableNames.Service);
  const ServiceItem = getTableName(TableNames.ServiceItem);
  const ServiceItemJob = getTableName(TableNames.ServiceItemJob);

  const conditions: string[] = [];
  if (jobStatus) {
    conditions.push(`j."jobStatus"= '${jobStatus}' AND DATE(j."startDateTime") BETWEEN '${startDate}' AND '${endDate}'`);
  } else {
    conditions.push(`DATE(j."startDateTime") BETWEEN '${startDate}' AND '${endDate}'`);
  }

  if (justCount) {
    return sequelize.query(
      `SELECT count(j."id") as count FROM ${Job} j
      INNER JOIN ${Service} AS s ON s."id" = j."serviceId"
      WHERE s."serviceStatus" = 'CONFIRMED' AND ${conditions}`,
      {
        plain: true
      }
    );
  } else {
    return sequelize.query(
      `SELECT 
        j."id" AS "jobId",
        j."additionalServiceId" AS "additionalServiceId",
        s."serviceType" AS "serviceType",
        s."needGST" as "needGST",
        s."gstTax" as "gstTax",
        (SELECT json_agg(si.*) FROM ${ServiceItem} as si INNER JOIN ${ServiceItemJob} as sij ON si."id"=sij."serviceItemId" WHERE sij."jobId"=j."id") AS "ServiceItem"
      FROM ${Job} j
      INNER JOIN ${Service} AS s ON s."id" = j."serviceId"
      INNER JOIN ${ServiceItem} AS si ON si."serviceId" = s."id"
      WHERE s."serviceStatus" = 'CONFIRMED' AND ${conditions}
      GROUP BY j."id", s."serviceType", s."needGST", s."gstTax"`,
      {
        type: QueryTypes.SELECT
      }
    );
  }
};

export const get = async (query: JobQueryParams, id: number): Promise<JobResponseModel[]> => {
  const Job = getTableName(TableNames.Job);
  const Service = getTableName(TableNames.Service);
  const ServiceAddress = getTableName(TableNames.ServiceAddress);
  const Client = getTableName(TableNames.Client);
  const Vehicle = getTableName(TableNames.Vehicle);
  const VehicleJob = getTableName(TableNames.VehicleJob);
  const UserProfile = getTableName(TableNames.UserProfile);
  const UserProfileJob = getTableName(TableNames.UserProfileJob);
  const ServiceItemJob = getTableName(TableNames.ServiceItemJob);
  const ServiceItem = getTableName(TableNames.ServiceItem);
  const ServiceSkill = getTableName(TableNames.ServiceSkill);
  const Invoice = getTableName(TableNames.Invoice);
  const ChecklistJob = getTableName(TableNames.ChecklistJob);
  const ChecklistJobItem = getTableName(TableNames.ChecklistJobItem);
  const JobLabel = getTableName(TableNames.JobLabel);
  const JobHistory = getTableName(TableNames.JobHistory);
  const JobExpenses = getTableName(TableNames.JobExpenses);
  const JobExpensesItem = getTableName(TableNames.JobExpensesItem);
  const Entity = getTableName(TableNames.Entity);
  const ServiceContactPerson = getTableName(TableNames.ServiceContactPerson);
  const ContactPerson = getTableName(TableNames.ContactPerson);

  const { s, l, ob, ot, q, j, fb, sd, ed, st, vi, ei, ci, fj, ht, hv, si, pd, hs, iu, isSync, haveSync } = query;

  const currentUser = await UserProfileDao.getUserFullDetails(id);
  const futureJobVisibility = await SettingService.getSpecificSettings('FUTUREJOBSVISIBILITY');
  let newFb = fb;
  if (currentUser.role === 'TECHNICIAN') {
    if (!futureJobVisibility.isActive) {
      if (!j) {
        newFb = '1';
      }
    }
  }

  const where = generateWhereQuery(q, j, newFb, sd, ed, st, vi, ei, ci, fj, ht, hv, si, pd, hs, iu, isSync, haveSync);

  const order = generateOrderQuery(ob, ot);
  const offsetAndLimit = generateOffsetAndLimit(s, l);
  const result: JobResponseModel[] = await sequelize.query(
    `SELECT
    j."id",
    j."id" AS "jobId",
    j."startDateTime" AS "startDateTime",
    j."endDateTime" AS "endDateTime",
    j."jobStatus" AS "jobStatus",
    j."assignedBy" AS "assignedBy",
    j."additionalServiceId" as "additionalServiceId",
    j."collectedAmount" as "collectedAmount",
    j."additionalCollectedAmount" as "additionalCollectedAmount",
    j."remarks" as "remarks",
    j."paymentMethod" as "paymentMethod",
    j."signature" as "signature",
    j."syncId" as "syncId",
    j."createdAt" as "createdAt",
    j."updatedAt" as "updatedAt",

    s."id" AS "serviceId",
    s."serviceType" AS "serviceType",
    s."serviceTitle" AS "serviceName",
    s."totalJob",
    s."needGST" as "needGST",
    s."gstTax" as "serviceGstTax",
    s."discountAmount" as "discountAmount",
    s."totalAmount" as "totalServiceAmount",
    e."name" as "entityName",

    i."collectedAmount" as "invoiceCollectedAmount",
    i."id" as "invoiceId",
    i."invoiceNumber" as "invoiceNumber",
    i."invoiceStatus" as "invoiceStatus",
    s."clientId" AS "clientId",
    c."name" AS "clientName",
    c."remarks" AS "clientRemarks",
    c."billingAddress" AS "billingAddress",
    c."billingFloorNo" AS "billingFloorNo",
    c."billingUnitNo" AS "billingUnitNo",
    sa."id" AS "serviceAddressId",
    sa."address" AS "serviceAddress",
    sa."floorNo" AS "serviceFloorNo",
    sa."unitNo" AS "serviceUnitNo",
    sa."postalCode" AS "postalCode",
    sa."country" AS "jobCountry",
    (SELECT json_agg(cp.*)
        FROM ${ContactPerson} AS cp
        INNER JOIN ${ServiceContactPerson} AS scp ON scp."contactPersonId" = cp."id"
        WHERE scp."serviceId" = s."id"
      ) AS "ContactPersons",

    up."id" AS "UserProfileId",
    up."displayName" AS "employees",
    up."employeeId" AS "employeeId",
    up."employeeSyncId" AS "employeeSyncId",

    vhj."carplateNumber" AS "vehicles",
    vhj."vehicleId" AS "vehicleId",

    s."totalJob" AS "serviceJobCount",
    ( SELECT COUNT(j."id") FROM ${Job} AS j 
      WHERE j."serviceId" = s."id"
      AND j."jobStatus" IN ('${JobStatus.COMPLETED}','${JobStatus.CANCELLED}')
    ) AS "doneJob",
    (SELECT json_agg(si.*) FROM ${ServiceItem} as si INNER JOIN ${ServiceItemJob} as sij ON si."id"=sij."serviceItemId" WHERE sij."jobId"=j."id") AS "ServiceItem",
    (SELECT json_agg(sk.*) FROM ${ServiceSkill} as sk WHERE sk."serviceId" = s."id") AS "ServiceSkills",
    (SELECT json_agg(u.*) FROM ${UserProfile} as u INNER JOIN ${UserProfileJob} as uj ON u."id"=uj."userProfileId" WHERE uj."jobId"=j."id") AS "employee",
		(SELECT json_agg(vh.*) FROM ${Vehicle} as vh INNER JOIN ${VehicleJob} as vj ON vj."vehicleId"=vh."id" WHERE vj."jobId"=j."id") AS "vehicleJobs",
    (SELECT json_agg(checklist)
      FROM (
        SELECT cj.*, (SELECT json_agg(cji.*) FROM ${ChecklistJobItem} as cji WHERE cji."checklistJobId"=cj."id") AS "ChecklistJobItems"
        FROM ${ChecklistJob} as cj WHERE cj."jobId" = j."id"
      ) checklist
    ) AS "ChecklistJob",
    (SELECT json_agg(expenses)
      FROM (
        SELECT je.*, (SELECT json_agg(jei.*) FROM ${JobExpensesItem} as jei WHERE jei."jobExpensesId"=je."id") AS "JobExpensesItems"
        FROM ${JobExpenses} as je WHERE je."jobId" = j."id"
      ) expenses
    ) AS "JobExpenses",
    (SELECT json_agg(jl.*) FROM ${JobLabel} as jl WHERE jl."jobId"=j."id") AS "jobLabels",
    (SELECT json_agg(jh.*) FROM ${JobHistory} as jh WHERE jh."jobId"=j."id") AS "jobHistories"
  FROM
    ${Job} as j
    INNER JOIN ${Service} AS s ON j."serviceId" = s."id"
    INNER JOIN ${Entity} AS e ON s."entityId" = e."id"
    INNER JOIN ${ServiceAddress} AS sa ON s."serviceAddressId" = sa."id"
    INNER JOIN ${Client} AS c ON s."clientId" = c."id"
    LEFT JOIN ${Invoice} AS i ON i."serviceId" = s."id"
    ${ei ? 'INNER' : 'LEFT'} JOIN 
    (SELECT json_agg(u."displayName") as "displayName", json_agg(u."id") as "employeeId", json_agg(u."syncId") as "employeeSyncId", j."id" FROM ${UserProfile} as u 
      INNER JOIN ${UserProfileJob} as uj ON u."id"=uj."userProfileId" 
      INNER JOIN ${Job} j ON uj."jobId" = j."id"
      ${ei ? `WHERE u."id" IN (${ei})` : ''}
      GROUP BY j."id"
    ) AS up ON j."id"=up."id"
    ${vi ? 'INNER' : 'LEFT'} JOIN (
      SELECT json_agg(v."carplateNumber") as "carplateNumber", json_agg(v."id") as "vehicleId", j."id"
      FROM ${Vehicle} as v
      INNER JOIN ${VehicleJob} as vj ON v."id"=vj."vehicleId" 
      INNER JOIN ${Job} j ON vj."jobId" = j."id"
      ${vi ? `WHERE v."id" IN (${vi})` : ''}
      GROUP BY j."id"
    ) AS vhj ON j."id"=vhj."id"
    ${where} 
    ${order}
   ${offsetAndLimit}
  `,
    {
      type: QueryTypes.SELECT
    }
  );

  return result;
};

export const getJobsSchedule = async (query: JobQueryParams, id: number): Promise<JobResponseModel[]> => {
  const Job = getTableName(TableNames.Job);
  const Service = getTableName(TableNames.Service);
  const ServiceAddress = getTableName(TableNames.ServiceAddress);
  const Client = getTableName(TableNames.Client);
  const Vehicle = getTableName(TableNames.Vehicle);
  const VehicleJob = getTableName(TableNames.VehicleJob);
  const UserProfile = getTableName(TableNames.UserProfile);
  const UserProfileJob = getTableName(TableNames.UserProfileJob);
  const ServiceItemJob = getTableName(TableNames.ServiceItemJob);
  const ServiceItem = getTableName(TableNames.ServiceItem);
  const ServiceSkill = getTableName(TableNames.ServiceSkill);
  const Invoice = getTableName(TableNames.Invoice);
  const ChecklistJob = getTableName(TableNames.ChecklistJob);
  const ChecklistJobItem = getTableName(TableNames.ChecklistJobItem);
  const JobLabel = getTableName(TableNames.JobLabel);
  const JobHistory = getTableName(TableNames.JobHistory);
  const JobExpenses = getTableName(TableNames.JobExpenses);
  const JobExpensesItem = getTableName(TableNames.JobExpensesItem);
  const Entity = getTableName(TableNames.Entity);
  const ServiceContactPerson = getTableName(TableNames.ServiceContactPerson);
  const ContactPerson = getTableName(TableNames.ContactPerson);

  const { s, l, ob, ot, sd, ed, vi, ei, pd, iu, selectedTab } = query;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const eid: any[] = Array.isArray(ei) ? ei : [ei];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const vid: any[] = Array.isArray(vi) ? vi : [vi];

  const filterDate = escape(format(new Date(sd), 'yyyy-MM-dd'));
  const filterEndDate = escape(format(new Date(ed), 'yyyy-MM-dd'));

  const order = generateOrderQuery(ob, ot);
  const offsetAndLimit = generateOffsetAndLimit(s, l);
  const result: JobResponseModel[] = await sequelize.query(
    `SELECT
    j."id" AS "jobId",
    j."startDateTime" AS "startDateTime",
    j."endDateTime" AS "endDateTime",
    j."jobStatus" AS "jobStatus",
    j."assignedBy" AS "assignedBy",
    j."additionalServiceId" as "additionalServiceId",
    j."collectedAmount" as "collectedAmount",
    j."additionalCollectedAmount" as "additionalCollectedAmount",
    j."remarks" as "remarks",
    j."paymentMethod" as "paymentMethod",
    j."signature" as "signature",

    s."id" AS "serviceId",
    s."serviceType" AS "serviceType",
    s."serviceTitle" AS "serviceName",
    s."totalJob",
    s."needGST" as "needGST",
    s."gstTax" as "serviceGstTax",
    s."discountAmount" as "discountAmount",
    s."totalAmount" as "totalServiceAmount",
    e."name" as "entityName",

    i."collectedAmount" as "invoiceCollectedAmount",
    i."id" as "invoiceId",
    i."invoiceNumber" as "invoiceNumber",
    i."invoiceStatus" as "invoiceStatus",
    s."clientId" AS "clientId",
    c."name" AS "clientName",
    c."remarks" AS "clientRemarks",
    c."billingAddress" AS "billingAddress",
    c."billingFloorNo" AS "billingFloorNo",
    c."billingUnitNo" AS "billingUnitNo",
    sa."address" AS "serviceAddress",
    sa."floorNo" AS "serviceFloorNo",
    sa."unitNo" AS "serviceUnitNo",
    sa."postalCode" AS "postalCode",
    sa."country" AS "jobCountry",
     (SELECT json_agg(cp.*)
        FROM ${ContactPerson} AS cp
        INNER JOIN ${ServiceContactPerson} AS scp ON scp."contactPersonId" = cp."id"
        WHERE scp."serviceId" = s."id"
      ) AS "ContactPersons",

    up."id" AS "UserProfileId",
    up."displayName" AS "employees",
    up."employeeId" AS "employeeId",

    vhj."carplateNumber" AS "vehicles",
    vhj."vehicleId" AS "vehicleId",

    s."totalJob" AS "serviceJobCount",
    ( SELECT COUNT(j."id") FROM ${Job} AS j 
      WHERE j."serviceId" = s."id"
      AND j."jobStatus" IN ('${JobStatus.COMPLETED}','${JobStatus.CANCELLED}')
    ) AS "doneJob",
    (SELECT json_agg(si.*) FROM ${ServiceItem} as si INNER JOIN ${ServiceItemJob} as sij ON si."id"=sij."serviceItemId" WHERE sij."jobId"=j."id") AS "ServiceItem",
    (SELECT json_agg(sk.*) FROM ${ServiceSkill} as sk WHERE sk."serviceId" = s."id") AS "ServiceSkills",
    (SELECT json_agg(u.*) FROM ${UserProfile} as u INNER JOIN ${UserProfileJob} as uj ON u."id"=uj."userProfileId" WHERE uj."jobId"=j."id") AS "employee",
		(SELECT json_agg(vh.*) FROM ${Vehicle} as vh INNER JOIN ${VehicleJob} as vj ON vj."vehicleId"=vh."id" WHERE vj."jobId"=j."id") AS "vehicleJobs",
    (SELECT json_agg(checklist)
      FROM (
        SELECT cj.*, (SELECT json_agg(cji.*) FROM ${ChecklistJobItem} as cji WHERE cji."checklistJobId"=cj."id") AS "ChecklistJobItems"
        FROM ${ChecklistJob} as cj WHERE cj."jobId" = j."id"
      ) checklist
    ) AS "ChecklistJob",
    (SELECT json_agg(expenses)
      FROM (
        SELECT je.*, (SELECT json_agg(jei.*) FROM ${JobExpensesItem} as jei WHERE jei."jobExpensesId"=je."id") AS "JobExpensesItems"
        FROM ${JobExpenses} as je WHERE je."jobId" = j."id"
      ) expenses
    ) AS "JobExpenses",
    (SELECT json_agg(jl.*) FROM ${JobLabel} as jl WHERE jl."jobId"=j."id") AS "jobLabels",
    (SELECT json_agg(jh.*) FROM ${JobHistory} as jh WHERE jh."jobId"=j."id") AS "jobHistories"
  FROM
    ${Job} as j
    INNER JOIN ${Service} AS s ON j."serviceId" = s."id"
    INNER JOIN ${Entity} AS e ON s."entityId" = e."id"
    INNER JOIN ${ServiceAddress} AS sa ON s."serviceAddressId" = sa."id"
    INNER JOIN ${Client} AS c ON s."clientId" = c."id"
    LEFT JOIN ${Invoice} AS i ON i."serviceId" = s."id"
    LEFT JOIN
    (SELECT json_agg(u."displayName") as "displayName", json_agg(u."id") as "employeeId", j."id" FROM ${UserProfile} as u 
      INNER JOIN ${UserProfileJob} as uj ON u."id"=uj."userProfileId" 
      INNER JOIN ${Job} j ON uj."jobId" = j."id"
      GROUP BY j."id"
    ) AS up ON j."id"=up."id"
    LEFT JOIN (
      SELECT json_agg(v."carplateNumber") as "carplateNumber", json_agg(v."id") as "vehicleId", j."id"
      FROM ${Vehicle} as v
      INNER JOIN ${VehicleJob} as vj ON v."id"=vj."vehicleId" 
      INNER JOIN ${Job} j ON vj."jobId" = j."id"
      GROUP BY j."id"
    ) AS vhj ON j."id"=vhj."id"
    WHERE s."serviceStatus" = '${ServiceStatus.CONFIRMED}' AND ((DATE("startDateTime") = '${filterDate}') OR (DATE(j."startDateTime") <= '${filterEndDate}' AND DATE(j."endDateTime") >='${filterDate}'))
    ${order}
   ${offsetAndLimit}
  `,
    {
      type: QueryTypes.SELECT
    }
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const checkVal = (val: any, pd?: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isInDistrict = pd ? pd.some((code: any) => val.postalCode.substring(0, 2) == code) : null;
    const isUnassigned = val.jobStatus === JobStatus.UNASSIGNED;
    const isNotUnassigned = val.jobStatus !== JobStatus.UNASSIGNED;
    const isConfirmed = val.jobStatus === JobStatus.CONFIRMED;
    const hadVehicle = val.vehicleJobs && val.vehicleJobs.length > 0;
    const hadEmployee = val.employee && val.employee.length > 0;
    return {
      isInDistrict,
      isUnassigned,
      isNotUnassigned,
      isConfirmed,
      hadVehicle,
      hadEmployee
    };
  };

  let filteredResults = result;
  if (pd && pd[0] != undefined) {
    await Promise.all(
      result.map(() => {
        const filterByUnassignedJobs = () => {
          return filteredResults.filter(val => {
            const res = checkVal(val, pd);
            if (selectedTab == 'technicians') {
              return (res.isInDistrict && (res.isUnassigned || res.isConfirmed)) || res.hadEmployee;
            } else if (selectedTab == 'vehicles') {
              return (res.isInDistrict && (res.isUnassigned || res.isConfirmed)) || res.hadVehicle;
            } else {
              return (res.isUnassigned && res.isInDistrict) || (res.isNotUnassigned && res.isInDistrict);
            }
          });
        };

        const filterByAllJobs = () => {
          return filteredResults.filter(val => {
            const isEmployeeMatched = eid && val.employee?.some(emp => eid.includes(emp.id.toString()));
            const isVehicleMatched = val.vehicleJobs?.some(vi => vid.includes(vi.id.toString()));
            const res = checkVal(val, pd);

            if (selectedTab == 'technicians') {
              return res.isInDistrict || isEmployeeMatched;
            } else if (selectedTab == 'vehicles') {
              return res.isInDistrict && (res.isUnassigned || res.hadVehicle);
            } else {
              return (res.isInDistrict && (isEmployeeMatched || res.isUnassigned || res.isConfirmed)) || isEmployeeMatched;
            }
          });
        };

        const filterBySelectedEmployee = () => {
          return filteredResults.filter(val => {
            const isEmployeeMatched = val.employee?.some(emp => eid.includes(emp.id.toString()));
            const res = checkVal(val, pd);

            if (iu) {
              return res.isUnassigned || isEmployeeMatched || (pd && res.isInDistrict);
            } else {
              return res.isUnassigned || (pd && res.isInDistrict);
            }
          });
        };

        const filterBySelectedVehicle = () => {
          return filteredResults.filter(val => {
            const isVehicleMatched = val.vehicleJobs?.some(vi => vid.includes(vi.id.toString()));
            const res = checkVal(val, pd);

            if (iu) {
              return res.isUnassigned || isVehicleMatched || (pd && res.isInDistrict && res.isUnassigned) || res.isConfirmed;
            } else {
              return (pd && res.isInDistrict && (res.isUnassigned || res.isConfirmed)) || res.isConfirmed || isVehicleMatched;
            }
          });
        };

        if (iu) {
          filteredResults = filterByUnassignedJobs();
        } else {
          filteredResults = filterByAllJobs();
        }

        if (eid && eid[0] != undefined) {
          filteredResults = filterBySelectedEmployee();
        }
        if (vid && vid[0] != undefined) {
          filteredResults = filterBySelectedVehicle();
        }
      })
    );
  } else {
    if (selectedTab == 'technicians') {
      if (eid && eid[0] != undefined) {
        filteredResults = filteredResults.filter(val => {
          const isEmployeeMatched = eid && val.employee?.some(emp => eid.includes(emp.id.toString()));
          const res = checkVal(val);
          return isEmployeeMatched || res.isUnassigned || res.isNotUnassigned;
        });
      }
    } else if (selectedTab == 'vehicles') {
      if (vid && vid[0] != undefined) {
        filteredResults = filteredResults.filter(val => {
          const isVehicleMatched = vid && val.vehicleJobs?.some(vi => vid.includes(vi.id.toString()));
          const res = checkVal(val);
          return isVehicleMatched || res.isUnassigned || res.isConfirmed;
        });
      } else {
        filteredResults = filteredResults.filter(val => {
          const res = checkVal(val);
          return res.isUnassigned || res.isConfirmed || res.hadVehicle;
        });
      }
    }
  }

  return filteredResults;
};

export const getDataCsv = async (query: JobQueryParams): Promise<JobCsvResponseModel[]> => {
  const Job = getTableName(TableNames.Job);
  const Service = getTableName(TableNames.Service);
  const ServiceAddress = getTableName(TableNames.ServiceAddress);
  const Client = getTableName(TableNames.Client);
  const Vehicle = getTableName(TableNames.Vehicle);
  const VehicleJob = getTableName(TableNames.VehicleJob);
  const UserProfile = getTableName(TableNames.UserProfile);
  const UserProfileJob = getTableName(TableNames.UserProfileJob);
  const ServiceItemJob = getTableName(TableNames.ServiceItemJob);
  const ServiceItem = getTableName(TableNames.ServiceItem);
  const ServiceSkill = getTableName(TableNames.ServiceSkill);
  const Invoice = getTableName(TableNames.Invoice);
  const JobLabel = getTableName(TableNames.JobLabel);
  const JobHistory = getTableName(TableNames.JobHistory);
  const JobExpenses = getTableName(TableNames.JobExpenses);
  const JobExpensesItem = getTableName(TableNames.JobExpensesItem);
  const Agent = getTableName(TableNames.Agent);
  const Entity = getTableName(TableNames.Entity);
  const CustomField = getTableName(TableNames.CustomField);
  const ContactPerson = getTableName(TableNames.ContactPerson);

  const { s, l, ob, ot, q, j, fb, sd, ed, st, vi, ei, ci, fj, ht, hv, si } = query;

  const where = generateWhereQuery(q, j, fb, sd, ed, st, vi, ei, ci, fj, ht, hv, si);

  const order = generateOrderQuery(ob, ot);
  const offsetAndLimit = generateOffsetAndLimit(s, l);
  const result: JobCsvResponseModel[] = await sequelize.query(
    `SELECT
    j."id" AS "jobId",
    j."startDateTime" AS "startDateTime",
    j."endDateTime" AS "endDateTime",
    j."jobStatus" AS "jobStatus",
    j."additionalServiceId" as "additionalServiceId",
    j."collectedAmount" as "jobCollectedAmount",
    j."additionalCollectedAmount" as "additionalCollectedAmount",
    j."paymentMethod" as "paymentMethod",

    s."id" AS "serviceId",
    s."serviceType" AS "serviceType",
    s."serviceTitle" AS "serviceName",
    s."totalJob",
    s."needGST" as "needGST",
    s."gstTax" as "serviceGstTax",
    s."discountAmount" as "discountAmount",
    s."totalAmount" as "totalServiceAmount",
    s."salesPerson" as "salesPerson",

    aserv."discountAmount" as "additionalDiscountAmount",
    aserv."totalAmount" as "additionalTotalAmount",

    i."collectedAmount" as "invoiceCollectedAmount",
    i."invoiceNumber" as "invoiceNumber",
    i."invoiceStatus" as "invoiceStatus",
    c."name" AS "clientName",
    c."billingAddress" AS "billingAddress",
    sa."address" AS "serviceAddress",

    ai."invoiceNumber" as "additionalInvoiceNumber",
    ai."invoiceStatus" as "additionalInvoiceStatus",

    up."displayName" AS "employees",

    vhj."carplateNumber" AS "vehicles",

    ag."name" as "agentName",

    e."name" as "entityName",
    (SELECT cp."contactPerson" FROM ${ContactPerson} cp WHERE cp."clientId" = c."id" ORDER BY cp.id LIMIT 1) AS "contactPerson",
    (SELECT cp."countryCode" FROM ${ContactPerson} cp WHERE cp."clientId" = c."id" ORDER BY cp.id LIMIT 1) AS "contactCountryCode",
    (SELECT cp."contactNumber" FROM ${ContactPerson} cp WHERE cp."clientId" = c."id" ORDER BY cp.id LIMIT 1) AS "contactNumber",
    (SELECT cp."contactEmail" FROM ${ContactPerson} cp WHERE cp."clientId" = c."id" ORDER BY cp.id LIMIT 1) AS "contactEmail",

    s."totalJob" AS "serviceJobCount",
    ( SELECT COUNT(j."id") FROM ${Job} AS j 
      WHERE j."serviceId" = s."id"
      AND j."jobStatus" IN ('${JobStatus.COMPLETED}','${JobStatus.CANCELLED}')
    ) AS "doneJob",
    (SELECT json_agg(si.*) FROM ${ServiceItem} as si INNER JOIN ${ServiceItemJob} as sij ON si."id"=sij."serviceItemId" WHERE sij."jobId"=j."id") AS "ServiceItem",
    (SELECT json_agg(asi.*) FROM ${ServiceItem} as asi  WHERE asi."serviceId"=j."additionalServiceId") AS "AdditionalServiceItem",
    (SELECT json_agg(sk.*) FROM ${ServiceSkill} as sk WHERE sk."serviceId" = s."id") AS "ServiceSkills",
    (SELECT json_agg(u.*) FROM ${UserProfile} as u INNER JOIN ${UserProfileJob} as uj ON u."id"=uj."userProfileId" WHERE uj."jobId"=j."id") AS "employee",
		(SELECT json_agg(vh.*) FROM ${Vehicle} as vh INNER JOIN ${VehicleJob} as vj ON vj."vehicleId"=vh."id" WHERE vj."jobId"=j."id") AS "vehicleJobs",
    (SELECT json_agg(jl.*) FROM ${JobLabel} as jl WHERE jl."jobId"=j."id") AS "jobLabels",
    (SELECT json_agg(jh.*) FROM ${JobHistory} as jh WHERE jh."jobId"=j."id") AS "jobHistories",
    (SELECT json_agg(expenses)
      FROM (
        SELECT je.*, (SELECT json_agg(jei.*) FROM ${JobExpensesItem} as jei WHERE jei."jobExpensesId"=je."id") AS "JobExpensesItems"
        FROM ${JobExpenses} as je WHERE je."jobId" = j."id" ORDER BY je.id
      ) expenses
    ) AS "JobExpenses",
   (SELECT json_agg(cf.*) FROM ${CustomField} as cf WHERE cf."serviceId" = s."id") AS "CustomFields"

  FROM
    ${Job} as j
    INNER JOIN ${Service} AS s ON j."serviceId" = s."id"
    LEFT JOIN ${Service} AS aserv ON j."additionalServiceId" = aserv."id"
    INNER JOIN ${ServiceAddress} AS sa ON s."serviceAddressId" = sa."id"
    INNER JOIN ${Client} AS c ON s."clientId" = c."id"
    LEFT JOIN ${Agent} AS ag ON c."agentId" = ag."id" 
    LEFT JOIN ${Invoice} AS i ON i."serviceId" = s."id"
    LEFT JOIN ${Invoice} AS ai ON ai."serviceId" = j."additionalServiceId"
    LEFT JOIN ${Entity} AS e ON e."id" = s."entityId"
    ${ei ? 'INNER' : 'LEFT'} JOIN 
    (SELECT json_agg(u."displayName") as "displayName", json_agg(u."id") as "employeeId", j."id" FROM ${UserProfile} as u 
      INNER JOIN ${UserProfileJob} as uj ON u."id"=uj."userProfileId" 
      INNER JOIN ${Job} j ON uj."jobId" = j."id"
      ${ei ? `WHERE u."id" IN (${ei})` : ''}
      GROUP BY j."id"
    ) AS up ON j."id"=up."id"
    ${vi ? 'INNER' : 'LEFT'} JOIN (
      SELECT json_agg(v."carplateNumber") as "carplateNumber", json_agg(v."id") as "vehicleId", j."id"
      FROM ${Vehicle} as v
      INNER JOIN ${VehicleJob} as vj ON v."id"=vj."vehicleId" 
      INNER JOIN ${Job} j ON vj."jobId" = j."id"
      ${vi ? `WHERE v."id" IN (${vi})` : ''}
      GROUP BY j."id"
    ) AS vhj ON j."id"=vhj."id"
    ${where} 
    ${order}
   ${offsetAndLimit}
  `,
    {
      type: QueryTypes.SELECT
    }
  );

  return result;
};

export const getCount = async (query: JobQueryParams): Promise<number> => {
  const Job = getTableName(TableNames.Job);
  const Service = getTableName(TableNames.Service);
  const Client = getTableName(TableNames.Client);
  const UserProfile = getTableName(TableNames.UserProfile);
  const UserProfileJob = getTableName(TableNames.UserProfileJob);
  const ServiceAddress = getTableName(TableNames.ServiceAddress);
  const Invoice = getTableName(TableNames.Invoice);
  const Vehicle = getTableName(TableNames.Vehicle);
  const VehicleJob = getTableName(TableNames.VehicleJob);

  const { q, j, fb, sd, ed, st, vi, ei, ci, fj, ht, hv, si, pd, hs, iu } = query;

  const where = generateWhereQuery(q, j, fb, sd, ed, st, vi, ei, ci, fj, ht, hv, si, pd, hs, iu);

  const result: CountQueryReturn = await sequelize.query(
    `SELECT COUNT(DISTINCT j."id")
    FROM ${Job} as j
      INNER JOIN ${Service} AS s ON j."serviceId" = s."id"
      INNER JOIN ${ServiceAddress} AS sa ON s."serviceAddressId" = sa."id"
      INNER JOIN ${Client} AS c ON s."clientId" = c."id"
      LEFT JOIN ${Invoice} AS i ON i."serviceId" = s."id"
      ${ei ? 'INNER' : 'LEFT'} JOIN 
      (SELECT json_agg(u."displayName") as "displayName", json_agg(u."id") as "employeeId", j."id" FROM ${UserProfile} as u 
        INNER JOIN ${UserProfileJob} as uj ON u."id"=uj."userProfileId" 
        INNER JOIN ${Job} j ON uj."jobId" = j."id"
        ${ei ? `WHERE u."id" IN (${ei})` : ''}
        GROUP BY j."id"
      ) AS up ON j."id"=up."id"
      ${vi ? 'INNER' : 'LEFT'} JOIN (
      SELECT json_agg(v."carplateNumber") as "carplateNumber", json_agg(v."id") as "vehicleId", j."id"
      FROM ${Vehicle} as v
      INNER JOIN ${VehicleJob} as vj ON v."id"=vj."vehicleId" 
      INNER JOIN ${Job} j ON vj."jobId" = j."id"
      ${vi ? `WHERE v."id" IN (${vi})` : ''}
      GROUP BY j."id"
    ) AS vhj ON j."id"=vhj."id"
     ${where}
     `,
    {
      type: QueryTypes.SELECT
    }
  );
  return +result[0].count;
};

const generateWhereQuery = (
  query?: string,
  jobFlag?: string,
  filterBy?: string,
  startDate?: string,
  endDate?: string,
  serviceType?: string,
  vehicleId?: number,
  employeId?: number,
  clientId?: number,
  firstJob?: number,
  haveTechnician?: string,
  haveVehicle?: string,
  serviceAddressId?: number,
  postalDistrict?: string[],
  haveSignature?: number,
  isUnassignedJobs?: boolean,
  isSync?: boolean,
  haveSync?: boolean
): string => {
  const conditions: string[] = [];
  const firstDateOfMonth = startOfMonth(new Date());
  const lastDateOfMonth = lastDayOfMonth(new Date());
  const Job = getTableName(TableNames.Job);
  const VehicleJob = getTableName(TableNames.VehicleJob);
  const UserProfileJob = getTableName(TableNames.UserProfileJob);
  const Service = getTableName(TableNames.Service);

  if (
    !query &&
    !filterBy &&
    !jobFlag &&
    !vehicleId &&
    !employeId &&
    !clientId &&
    !serviceType &&
    !firstJob &&
    !postalDistrict &&
    !isSync &&
    !haveSync
  ) {
    return `WHERE s."serviceStatus" = '${ServiceStatus.CONFIRMED}'`;
  }

  if (query) {
    conditions.push(
      `(c."name" ILIKE '%${query}%'
        OR s."serviceTitle" ILIKE '%${query}%'
        OR CAST(j."id" AS TEXT) ILIKE '%${query}%'
        OR sa."address" ILIKE '%${query}%'
      )`
    );
  }

  if (serviceType) {
    if (serviceType === '0') {
      conditions.push(`s."serviceType" = 'CONTRACT'`);
    } else if (serviceType === '1') {
      conditions.push(`s."serviceType" = 'ADHOC'`);
    }
  }

  if (jobFlag) {
    if (jobFlag === '1') {
      conditions.push(`j."jobStatus" = '${JobStatus.UNASSIGNED}'`);
    } else if (jobFlag === '2') {
      conditions.push(`j."jobStatus" = '${JobStatus.ASSIGNED}'`);
    } else if (jobFlag === '3') {
      conditions.push(`j."jobStatus" = '${JobStatus.IN_PROGRESS}'`);
    } else if (jobFlag === '4') {
      conditions.push(`j."jobStatus" = '${JobStatus.COMPLETED}'`);
      if (haveSignature == 0) {
        conditions.push(`(j."signature" IS NULL OR j."signature" = '')`);
      } else if (haveSignature == 1) {
        conditions.push(`(j."signature" IS NOT NULL AND j."signature" != '')`);
      }
    } else if (jobFlag === '5') {
      // conditions.push(`j."jobStatus" = '${JobStatus.ASSIGNED}' AND j."endDateTime" < '${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}'`);
      conditions.push(
        `(j."jobStatus" = '${JobStatus.ASSIGNED}' OR j."jobStatus" = '${JobStatus.IN_PROGRESS}' OR j."jobStatus" = '${
          JobStatus.PAUSED
        }') AND j."startDateTime" < '${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}'`
      );
    } else if (jobFlag === '6') {
      conditions.push(`j."jobStatus" = '${JobStatus.COMPLETED}' OR j."jobStatus" = '${JobStatus.CANCELLED}'`);
    } else if (jobFlag === '8') {
      conditions.push(`j."jobStatus" = '${JobStatus.CANCELLED}'`);
    } else if (jobFlag === '9') {
      conditions.push(`j."jobStatus" = '${JobStatus.PAUSED}'`);
    } else if (jobFlag === '10') {
      conditions.push(`j."jobStatus" = '${JobStatus.CONFIRMED}'`);
    }
  }

  if (filterBy) {
    let filterValue = `DATE(j."startDateTime") = '${escape(format(new Date(), 'yyyy-MM-dd'))}'`;
    if (filterBy === '2') {
      filterValue = `DATE(j."startDateTime") = '${escape(format(new Date(endOfTomorrow()), 'yyyy-MM-dd'))}' `;
    } else if (filterBy === '3') {
      const firstInWeek = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
      const lastInWeek = format(endOfWeek(new Date()), 'yyyy-MM-dd');
      filterValue = `DATE(j."startDateTime") >= '${firstInWeek}' AND DATE(j."startDateTime") <= '${lastInWeek}'`;
    } else if (filterBy === '4') {
      const startDate = escape(format(new Date(firstDateOfMonth), 'yyyy-MM-dd'));
      const endDate = escape(format(new Date(lastDateOfMonth), 'yyyy-MM-dd'));
      filterValue = `DATE(j."startDateTime") >= '${startDate}' AND DATE(j."startDateTime") <='${endDate}'`;
    } else if (filterBy === '5') {
      const hasTime = (startDate?.includes(':') || endDate?.includes(':')) ?? false;
      const formatPattern = hasTime ? 'yyyy-MM-dd HH:mm' : 'yyyy-MM-dd';
      const filterStartDate = escape(format(new Date(startDate), formatPattern));
      const filterEndDate = escape(format(new Date(endDate), formatPattern));
      filterValue = hasTime
        ? `j."startDateTime" BETWEEN TIMESTAMP '${decodeURIComponent(filterStartDate)}' AND TIMESTAMP '${decodeURIComponent(filterEndDate)}'`
        : `DATE(j."startDateTime") BETWEEN '${filterStartDate}' AND '${filterEndDate}'`;
    } else if (filterBy === '6') {
      filterValue = `DATE(j."startDateTime") < '${escape(format(new Date(), 'yyyy-MM-dd'))}'`;
    } else if (filterBy === '7') {
      filterValue = `DATE(j."startDateTime") = '${escape(format(new Date(startDate), 'yyyy-MM-dd'))}'`;
    }
    //filter job for schedule page
    else if (filterBy === '8') {
      const filterDate = escape(format(new Date(startDate), 'yyyy-MM-dd'));
      const filterEndDate = escape(format(new Date(endDate), 'yyyy-MM-dd'));
      filterValue = `((DATE("startDateTime") = '${filterDate}') OR (DATE(j."startDateTime") <= '${filterEndDate}' AND DATE(j."endDateTime") >='${filterDate}'))`;
    } else if (filterBy === '9') {
      const firstDateLastMonth = startOfMonth(subMonths(new Date(), 1));
      const lastDateLastMonth = lastDayOfMonth(subMonths(new Date(), 1));
      const startDate = format(new Date(firstDateLastMonth), 'yyyy-MM-dd');
      const endDate = format(new Date(lastDateLastMonth), 'yyyy-MM-dd');
      filterValue = `DATE(j."startDateTime") BETWEEN '${startDate}' AND '${endDate}'`;
    }
    // fiter for mobile job histories
    else if (filterBy === '10') {
      const filterDate = escape(format(new Date(startDate ? startDate : firstDateOfMonth), 'yyyy-MM-dd'));
      const filterEndDate = escape(format(new Date(endDate ? endDate : firstDateOfMonth), 'yyyy-MM-dd'));
      filterValue = `((DATE("startDateTime") = '${filterDate}') OR (DATE(j."startDateTime") <= '${filterEndDate}' AND DATE(j."endDateTime") >='${filterDate}'))`;
    }

    if (jobFlag && jobFlag === '7') {
      filterValue = `(${filterValue} AND j."jobStatus" = '${JobStatus.ASSIGNED}') OR (${filterValue} AND j."jobStatus" = '${JobStatus.IN_PROGRESS}') OR (${filterValue} AND j."jobStatus" = '${JobStatus.PAUSED}')`;
    }

    conditions.push(filterValue);
  } else {
    if (jobFlag && jobFlag === '7') {
      conditions.push(
        `j."jobStatus" = '${JobStatus.ASSIGNED}' OR j."jobStatus" = '${JobStatus.IN_PROGRESS}' OR j."jobStatus" = '${JobStatus.PAUSED}'`
      );
    }
  }

  if (clientId) {
    conditions.push(`s."clientId" = (${clientId})`);
  }

  if (firstJob) {
    conditions.push(
      `j."id" IN (SELECT MIN(j."id") as "id" FROM ${Job} as j INNER JOIN ${Service} as s ON s."id" = j."serviceId" GROUP BY j."serviceId" ORDER BY "id")`
    );
  }

  if (haveVehicle) {
    conditions.push(`(SELECT count(vj.id) FROM ${VehicleJob} vj WHERE vj."jobId" = j."id") > 0`);
  }

  if (haveTechnician) {
    conditions.push(`(SELECT count(uj."userProfileId") FROM ${UserProfileJob} uj WHERE uj."jobId" = j."id") > 0`);
  }

  if (serviceAddressId) {
    conditions.push(`s."serviceAddressId" IN (${serviceAddressId})`);
  }

  if (isSync) {
    if (haveSync) {
      conditions.push(`j."isSynchronize" = ${isSync} AND j."syncId" IS NOT NULL`);
    } else {
      conditions.push(`j."isSynchronize" = ${isSync}`);
    }
  }

  if (postalDistrict && postalDistrict.length > 0) {
    const postalCodeConditions: string[] = [];
    postalDistrict.forEach(code => {
      postalCodeConditions.push(`substring(sa."postalCode" from 1 for 2) = '${code}'`);
    });
    conditions.push(`(${postalCodeConditions.join(' OR ')})`);
  }

  const serviceStatusCondition =
    jobFlag === '8'
      ? `s."serviceStatus" != '${ServiceStatus.PENDING}'`
      : `s."serviceStatus" IN ('${ServiceStatus.CONFIRMED}', '${ServiceStatus.CANCELLED}')`;

  return `WHERE ${serviceStatusCondition} ${conditions.length ? `AND ${conditions.join(' AND ')}` : ''}`;
};

const generateOrderQuery = (by?: string, type?: string) => {
  let orderBy = by || 'j."startDateTime"';
  const orderType = type || 'ASC';

  if (by === 'jobId') {
    orderBy = 'j."id"';
  }

  if (by === 'clientName') {
    orderBy = 'c."name"';
  }

  if (by === 'serviceName') {
    orderBy = 's."serviceTitle"';
  }

  if (by === 'serviceAddress') {
    orderBy = 'sa."address"';
  }

  if (by === 'startDateTime') {
    orderBy = 'j."startDateTime"';
  }

  if (by === 'endDateTime') {
    orderBy = 'j."endDateTime"';
  }

  if (by === 'vehicleNo') {
    orderBy = 'v."carplateNumber"';
  }

  if (by === 'serviceType') {
    orderBy = 's."serviceType"';
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

export const getEmployes = async (): Promise<ParametersResponseModel[]> => {
  const UserProfile = getTableName(TableNames.UserProfile);
  const UserProfileJob = getTableName(TableNames.UserProfileJob);
  const UserProfileRole = getTableName(TableNames.UserProfileRole);

  const result: ParametersResponseModel[] = await sequelize.query(
    `SELECT
    u."id" AS id,
    u."displayName" AS "name"
    FROM ${UserProfile} as u 
      INNER JOIN ${UserProfileJob} as uj ON u."id"=uj."userProfileId"
      INNER JOIN ${UserProfileRole} AS ur ON u."id" = ur."userProfileId"
    GROUP BY u."id"`,
    {
      type: QueryTypes.SELECT
    }
  );
  return result;
};

export const getVehicles = async (): Promise<ParametersResponseModel[]> => {
  const Job = getTableName(TableNames.Job);
  const Vehicle = getTableName(TableNames.Vehicle);
  const VehicleJob = getTableName(TableNames.VehicleJob);

  const result: ParametersResponseModel[] = await sequelize.query(
    `SELECT DISTINCT
        vj."vehicleId" AS id,
        v."carplateNumber" AS name
     FROM
        ${Job} AS j
        LEFT JOIN ${VehicleJob} AS vj ON vj."jobId" = j."id"
        INNER JOIN ${Vehicle} AS v ON vj."vehicleId" = v."id"
        `,
    {
      type: QueryTypes.SELECT
    }
  );

  return result;
};

export const getJobsByTecnician = async (employeId: number, jobStatus?: string, exceptJobId?: number): Promise<JobResponseModel[]> => {
  const Job = getTableName(TableNames.Job);
  const Service = getTableName(TableNames.Service);
  const UserProfile = getTableName(TableNames.UserProfile);
  const UserProfileJob = getTableName(TableNames.UserProfileJob);
  const result: JobResponseModel[] = await sequelize.query(
    `SELECT
      j."id" AS "jobId",
      j."startDateTime" AS "startDateTime",
      j."endDateTime" AS "endDateTime",
      j."jobStatus" AS "jobStatus",

      up."id" AS "UserProfileId",
      up."displayName" AS "employee",
      up."employeeId" AS "employeeId"
    FROM
      ${Job} as j
      INNER JOIN ${Service} AS s ON j."serviceId" = s."id"
      INNER JOIN (SELECT json_agg(u."displayName") as "displayName", json_agg(u."id") as "employeeId", j."id" FROM ${UserProfile} as u 
        INNER JOIN ${UserProfileJob} as uj ON u."id"=uj."userProfileId" 
        INNER JOIN ${Job} j ON uj."jobId" = j."id"
        WHERE u."id" IN (${employeId})
        GROUP BY j."id"
      ) AS up ON j."id"=up."id"
      WHERE s."serviceStatus" = 'CONFIRMED' 
       ${jobStatus ? ` AND j."jobStatus" = '${jobStatus}'` : ``}
       ${exceptJobId ? ` AND j."id" != ${exceptJobId}` : ``}
    `,
    {
      type: QueryTypes.SELECT
    }
  );

  return result;
};

export const getJobsByVehicle = async (vehicleId: number, jobStatus?: string[]): Promise<JobResponseModel[]> => {
  const Job = getTableName(TableNames.Job);
  const Service = getTableName(TableNames.Service);
  const Vehicle = getTableName(TableNames.Vehicle);
  const VehicleJob = getTableName(TableNames.VehicleJob);

  const result: JobResponseModel[] = await sequelize.query(
    `SELECT
      j."id" AS "jobId",
      j."startDateTime" AS "startDateTime",
      j."endDateTime" AS "endDateTime",
      j."jobStatus" AS "jobStatus",
      v."carplateNumber" AS "vehicleNo"
    FROM
      ${Job} as j
      INNER JOIN ${Service} AS s ON j."serviceId" = s."id"
      INNER JOIN ${VehicleJob} as vj ON vj."jobId" = j."id"
      LEFT JOIN ${Vehicle} AS v ON v."id" = vj."vehicleId"
      WHERE s."serviceStatus" = 'CONFIRMED'
      AND vj."vehicleId" IN (${vehicleId})
       AND j."jobStatus" ${jobStatus ? ` = '${jobStatus}'` : ` IN ('${JobStatus.ASSIGNED}', '${JobStatus.IN_PROGRESS}')`} 
    `,
    {
      type: QueryTypes.SELECT
    }
  );

  return result;
};

export const getValueJobsToday = async (): Promise<number> => {
  const Job = getTableName(TableNames.Job);
  const today = format(new Date(), 'yyyy-MM-dd');

  const result: CountQueryReturn = await sequelize.query(
    `SELECT count(*)
     FROM ${Job} AS j
     WHERE DATE(j."startDateTime") = '${today}'
     AND j."jobStatus" = '${JobStatus.UNASSIGNED}'
    `,
    {
      type: QueryTypes.SELECT
    }
  );

  return +result[0].count;
};

export const getValueJobsThisWeek = async (): Promise<number> => {
  const Job = getTableName(TableNames.Job);
  const startDateThisWeek = format(new Date(), 'yyyy-MM-dd');
  const endDateThisWeek = format(new Date(), 'yyyy-MM-dd');

  const result: CountQueryReturn = await sequelize.query(
    `SELECT count(*)
     FROM ${Job} AS j
     WHERE DATE(j."startDateTime") >= '${startDateThisWeek}'
     AND DATE(j."startDateTime") <= '${endDateThisWeek}'
     AND j."jobStatus" = '${JobStatus.UNASSIGNED}'
    `,
    {
      type: QueryTypes.SELECT
    }
  );

  return +result[0].count;
};

export const getLastJobByServiceId = async (serviceId: number): Promise<Job> => {
  const model = getJobModel();

  return await model.findOne<Job>({ where: { serviceId }, order: [['id', 'DESC']] });
};

export const getJobByServiceId = async (serviceId: number, jobStatus?: string): Promise<Job[]> => {
  const model = getJobModel();

  const where: WhereOptions = { serviceId };

  if (jobStatus) {
    where.jobStatus = jobStatus;
  }

  return await model.findAll<Job>({ where, order: [['id', 'ASC']] });
};

export const getJobDetailByServiceId = async (serviceId: number): Promise<JobResponseModel[]> => {
  const Job = getTableName(TableNames.Job);
  const Service = getTableName(TableNames.Service);
  const ServiceItemJob = getTableName(TableNames.ServiceItemJob);
  const ServiceItem = getTableName(TableNames.ServiceItem);

  const result: JobResponseModel[] = await sequelize.query(
    `SELECT j.*,
    (SELECT json_agg(si.*) FROM ${ServiceItem} as si INNER JOIN ${ServiceItemJob} as sij ON si."id"=sij."serviceItemId" WHERE si."serviceId"=${serviceId}) AS "ServiceItem"
    FROM ${Job} as j
    INNER JOIN ${Service} AS s ON j."serviceId" = s."id"
    WHERE j."serviceId" = ${serviceId}`,
    {
      type: QueryTypes.SELECT
    }
  );

  return result;
};

export const getUnCompletedJobByServiceId = async (serviceId: number): Promise<Job[]> => {
  const model = getJobModel();

  const where: WhereOptions = { serviceId };

  where.jobStatus = {
    [Op.or]: [JobStatus.UNASSIGNED, JobStatus.ASSIGNED]
  };

  return await model.findAll<Job>({ where });
};

export const getJobById = async (jobId: number, tenant?: string): Promise<Job> => {
  const model = tenant ? Job.schema(tenant) : getJobModel();

  return await model.findByPk<Job>(jobId);
};

export const getJobDetailByAdditionalServiceId = async (additionalServiceId: number): Promise<Job> => {
  const model = getJobModel();

  return model.findOne<Job>({ where: { additionalServiceId } });
};

export const getJobByAdditionalServiceId = async (additionalServiceId: number): Promise<Job[]> => {
  const model = getJobModel();

  return model.findAll<Job>({ where: { additionalServiceId } });
};

export const getJobDetailById = async (jobId: number): Promise<{ row: JobResponseModel }> => {
  const Job = getTableName(TableNames.Job);
  const JobNote = getTableName(TableNames.JobNote);
  const JobHistory = getTableName(TableNames.JobHistory);
  const ChecklistJob = getTableName(TableNames.ChecklistJob);
  const ChecklistJobItem = getTableName(TableNames.ChecklistJobItem);
  const Client = getTableName(TableNames.Client);
  const Service = getTableName(TableNames.Service);
  const ServiceAddress = getTableName(TableNames.ServiceAddress);
  const Vehicle = getTableName(TableNames.Vehicle);
  const Entity = getTableName(TableNames.Entity);
  const UserProfile = getTableName(TableNames.UserProfile);
  const UserProfileJob = getTableName(TableNames.UserProfileJob);
  const ServiceItemJob = getTableName(TableNames.ServiceItemJob);
  const ServiceItem = getTableName(TableNames.ServiceItem);
  const ServiceSkill = getTableName(TableNames.ServiceSkill);
  const Invoice = getTableName(TableNames.Invoice);
  const VehicleJob = getTableName(TableNames.VehicleJob);
  const JobDocument = getTableName(TableNames.JobDocument);
  const ContactPerson = getTableName(TableNames.ContactPerson);
  const Equipment = getTableName(TableNames.Equipment);
  const JobLabel = getTableName(TableNames.JobLabel);
  const JobExpenses = getTableName(TableNames.JobExpenses);
  const JobExpensesItem = getTableName(TableNames.JobExpensesItem);
  const CustomField = getTableName(TableNames.CustomField);

  const result: JobResponseModel = await sequelize.query(
    `SELECT
    j."id" AS "jobId",
    j."startDateTime" AS "startDateTime",
    j."endDateTime" AS "endDateTime",
    j."jobStatus" AS "jobStatus",
    j."assignedBy" AS "userProfileId",
    j."signature" AS "signature",
    j."remarks" AS "remarks",
    j."collectedAmount" as "collectedAmount",
    j."paymentMethod" as "paymentMethod",
    j."paymentType" as "paymentType",
    j."serviceId" as "serviceId",
    j."additionalCollectedAmount" as "additionalCollectedAmount",
    j."additionalOutstandingAmount" as "additionalOutstandingAmount",
    j."chequeNumber" as "chequeNumber",
    cl."name" AS "clientName",
    cl."remarks" AS "clientRemarks",
    cl."emailJobReport" AS "emailJobReport",
    s."id" AS "serviceId",
    s."serviceTitle" AS "serviceName",
    s."serviceType" AS "serviceType",
    s."serviceStatus" AS "serviceStatus",
    s."gstAmount" as "gstAmountService",
    s."originalAmount" as "originalAmountService",
    s."totalAmount" as "totalAmountService",
    s."discountAmount" as "discountAmount",
    s."needGST" as "needGST",
    s."gstTax" as "serviceGstTax",
    s."clientId" AS "clientId",
    s."serviceAddressId" AS "serviceAddressId",
    s."entityId" AS "entityId",
    e."name" AS "entityName",
    e."address" AS "entityAddress",
    e."countryCode" AS "entityCountryCode",
    e."contactNumber" AS "entityContactNumber",
    e."logo" AS "entityLogo",
    e."email" AS "entityEmail",
    e."qrImage" AS "entityQrImage",
    e."registerNumberGST" AS "registerNumberGST",
    e."uenNumber" AS "uenNumber",
    sa."address" AS "serviceAddress",
    sa."floorNo" AS "serviceFloorNo",
    sa."unitNo" AS "serviceUnitNo",
    sa."country" AS "country",
    sa."postalCode" AS "postalCode",
    u."displayName" AS "displayName",
    i."id" as "invoiceId",
    i."invoiceNumber" as "invoiceNumber",
    i."invoiceStatus" as "invoiceStatus",
    j."additionalServiceId" as "additionalServiceId",

    (SELECT count(j."id") FROM ${Service} sc INNER JOIN ${Job} j ON j."serviceId" = sc."id" WHERE sc."id" = s."id") AS "serviceJobCount",
    (SELECT COUNT(j."id") FROM ${Job} AS j 
      WHERE j."serviceId" = s."id"
      AND j."jobStatus" IN ('${JobStatus.COMPLETED}','${JobStatus.CANCELLED}')
    ) AS "doneJob",
    (SELECT sa."serviceTitle" FROM ${Service} as sa WHERE sa."id"=j."additionalServiceId") as "additionalServiceTitle",
    (SELECT sa."originalAmount" FROM ${Service} as sa WHERE sa."id"=j."additionalServiceId") as "additionalAmount",
    (SELECT sa."discountAmount" FROM ${Service} as sa WHERE sa."id"=j."additionalServiceId") as "additionalDiscountAmount",
    (SELECT sa."gstTax" FROM ${Service} as sa WHERE sa."id"=j."additionalServiceId") as "additionalGstTax",
    (SELECT sa."gstAmount" FROM ${Service} as sa WHERE sa."id"=j."additionalServiceId") as "additionalGstAmount",
    (SELECT sa."totalAmount" FROM ${Service} as sa WHERE sa."id"=j."additionalServiceId") as "additionalTotalAmount",
    (SELECT json_agg(si.*) FROM ${ServiceItem} as si INNER JOIN ${Service} as s ON si."serviceId"=s."id" INNER JOIN ${Job} j ON s."id"=j."additionalServiceId" WHERE j."id"=${jobId}) AS "AdditionalServiceItem",
    (SELECT json_agg(si.*) FROM ${ServiceItem} as si INNER JOIN ${ServiceItemJob} as sij ON si."id"=sij."serviceItemId" WHERE sij."jobId"=${jobId}) AS "ServiceItem",
    (SELECT json_agg(sk.*) FROM ${ServiceSkill} as sk WHERE sk."serviceId" = s."id") AS "ServiceSkills",
    (SELECT json_agg(cf.*) FROM ${CustomField} as cf WHERE cf."serviceId" = s."id") AS "CustomFields",
		(SELECT json_agg(u.*) FROM ${UserProfile} as u INNER JOIN ${UserProfileJob} as uj ON u."id"=uj."userProfileId" WHERE uj."jobId"=${jobId}) AS "employee",
		(SELECT json_agg(vh.*) FROM ${Vehicle} as vh INNER JOIN ${VehicleJob} as vj ON vj."vehicleId"=vh."id" WHERE vj."jobId" = ${jobId}) AS "vehicleJobs",
		(SELECT json_agg(jobnotes) FROM (
      SELECT jn.*, (SELECT to_json(upe.*) FROM ${UserProfile} as upe WHERE upe."id"=jn."createdBy") AS "UserProfile"
			FROM ${JobNote} AS jn WHERE jn."jobId" =${jobId}) jobnotes ) AS "jobNotes",
    (SELECT json_agg(jd.*) FROM ${JobDocument} as jd WHERE jd."jobId" =${jobId}) AS "jobDocuments",
    (SELECT json_agg(histories)
      FROM (
        SELECT jh.*, (SELECT json_agg(ujh.*) FROM ${UserProfile} as ujh WHERE ujh."id"=jh."userProfileId") AS "UserProfile"
        FROM ${JobHistory} as jh WHERE jh."jobId" = ${jobId} ORDER BY jh.id ASC
      ) histories
    ) AS "jobHistories",
    (SELECT json_agg(checklist)
      FROM (
        SELECT cj.*, (SELECT json_agg(cji.*) FROM ${ChecklistJobItem} as cji WHERE cji."checklistJobId"=cj."id") AS "ChecklistJobItems"
        FROM ${ChecklistJob} as cj WHERE cj."jobId" = ${jobId} ORDER BY cj.id
      ) checklist
    ) AS "ChecklistJob",
    (SELECT json_agg(expenses)
      FROM (
        SELECT je.*, (SELECT json_agg(jei.*) FROM ${JobExpensesItem} as jei WHERE jei."jobExpensesId"=je."id") AS "JobExpensesItems"
        FROM ${JobExpenses} as je WHERE je."jobId" = ${jobId} ORDER BY je.id
      ) expenses
    ) AS "JobExpenses",
    (SELECT json_agg(jd.*) FROM ${JobLabel} as jd WHERE jd."jobId" =${jobId}) AS "jobLabels",
    (SELECT json_agg(adc.*) FROM ${ContactPerson} AS adc INNER JOIN ${Service} AS s ON adc."clientId" = s."clientId" INNER JOIN ${Job} AS j ON s."id" = j."serviceId" WHERE j."id" =${jobId}) AS "ContactPerson"
    FROM ${Job} j
    INNER JOIN ${Service} AS s ON j."serviceId" = s."id"
    INNER JOIN ${Client} AS cl ON s."clientId" = cl."id"
    INNER JOIN ${ServiceAddress} AS sa ON s."serviceAddressId" = sa."id"
    LEFT JOIN ${Invoice} AS i ON i."serviceId" = s."id"
    LEFT JOIN ${Entity} AS e ON e."id" = s."entityId"
    LEFT JOIN ${UserProfile} AS u ON u."id" = j."assignedBy"
    WHERE j."id" = ${jobId};`,
    {
      type: QueryTypes.SELECT,
      plain: true
    }
  );
  return { row: result };
};

export const getJobsWithDetails = async (query: JobQueryParams, id: number): Promise<JobResponseModel[]> => {
  const Job = getTableName(TableNames.Job);
  const JobNote = getTableName(TableNames.JobNote);
  const JobHistory = getTableName(TableNames.JobHistory);
  const ChecklistJob = getTableName(TableNames.ChecklistJob);
  const ChecklistJobItem = getTableName(TableNames.ChecklistJobItem);
  const Client = getTableName(TableNames.Client);
  const Service = getTableName(TableNames.Service);
  const ServiceAddress = getTableName(TableNames.ServiceAddress);
  const Vehicle = getTableName(TableNames.Vehicle);
  const Entity = getTableName(TableNames.Entity);
  const UserProfile = getTableName(TableNames.UserProfile);
  const UserProfileJob = getTableName(TableNames.UserProfileJob);
  const ServiceItemJob = getTableName(TableNames.ServiceItemJob);
  const ServiceItem = getTableName(TableNames.ServiceItem);
  const ServiceSkill = getTableName(TableNames.ServiceSkill);
  const Invoice = getTableName(TableNames.Invoice);
  const VehicleJob = getTableName(TableNames.VehicleJob);
  const JobDocument = getTableName(TableNames.JobDocument);
  const ContactPerson = getTableName(TableNames.ContactPerson);
  const JobLabel = getTableName(TableNames.JobLabel);
  const JobExpenses = getTableName(TableNames.JobExpenses);
  const JobExpensesItem = getTableName(TableNames.JobExpensesItem);
  const CustomField = getTableName(TableNames.CustomField);

  const { s, l, ob, ot, q, j, fb, sd, ed, st, vi, ei, ci, fj, ht, hv, si, pd, hs, iu, isSync, haveSync } = query;

  const currentUser = await UserProfileDao.getUserFullDetails(id);
  const futureJobVisibility = await SettingService.getSpecificSettings('FUTUREJOBSVISIBILITY');
  let newFb = fb;
  if (currentUser.role === 'TECHNICIAN') {
    if (!futureJobVisibility.isActive) {
      if (!j) {
        newFb = '1';
      }
    }
  }

  const where = generateWhereQuery(q, j, newFb, sd, ed, st, vi, ei, ci, fj, ht, hv, si, pd, hs, iu, isSync, haveSync);

  const order = generateOrderQuery(ob, ot);
  const offsetAndLimit = generateOffsetAndLimit(s, l);
  const result: JobResponseModel[] = await sequelize.query(
    `SELECT
    j."id",
    j."id" AS "jobId",
    j."startDateTime" AS "startDateTime",
    j."endDateTime" AS "endDateTime",
    j."jobStatus" AS "jobStatus",
    j."assignedBy" AS "assignedBy",
    j."additionalServiceId" as "additionalServiceId",
    j."collectedAmount" as "collectedAmount",
    j."additionalCollectedAmount" as "additionalCollectedAmount",
    j."remarks" as "remarks",
    j."paymentMethod" as "paymentMethod",
    j."signature" as "signature",
    j."syncId" as "syncId",
    j."createdAt" as "createdAt",
    j."updatedAt" as "updatedAt",

    s."id" AS "serviceId",
    s."serviceType" AS "serviceType",
    s."serviceTitle" AS "serviceName",
    s."totalJob",
    s."needGST" as "needGST",
    s."gstTax" as "serviceGstTax",
    s."discountAmount" as "discountAmount",
    s."totalAmount" as "totalAmountService",

    i."collectedAmount" as "invoiceCollectedAmount",
    i."id" as "invoiceId",
    i."invoiceNumber" as "invoiceNumber",
    i."invoiceStatus" as "invoiceStatus",
    s."clientId" AS "clientId",
    c."name" AS "clientName",
    c."remarks" AS "clientRemarks",
    c."billingAddress" AS "billingAddress",
    c."billingFloorNo" AS "billingFloorNo",
    c."billingUnitNo" AS "billingUnitNo",
    sa."id" AS "serviceAddressId",
    sa."address" AS "serviceAddress",
    sa."floorNo" AS "serviceFloorNo",
    sa."unitNo" AS "serviceUnitNo",
    sa."postalCode" AS "postalCode",
    sa."country" AS "jobCountry",

    up."id" AS "UserProfileId",
    up."displayName" AS "employees",
    up."employeeId" AS "employeeId",
    up."employeeSyncId" AS "employeeSyncId",

    vhj."carplateNumber" AS "vehicles",
    vhj."vehicleId" AS "vehicleId",

    e."name" AS "entityName",
    e."qrImage" AS "entityQrImage",

    s."totalJob" AS "serviceJobCount",
    ( SELECT COUNT(j."id") FROM ${Job} AS j 
      WHERE j."serviceId" = s."id"
      AND j."jobStatus" IN ('${JobStatus.COMPLETED}','${JobStatus.CANCELLED}')
    ) AS "doneJob",
    (SELECT json_agg(si.*) FROM ${ServiceItem} as si INNER JOIN ${ServiceItemJob} as sij ON si."id"=sij."serviceItemId" WHERE sij."jobId"=j."id") AS "ServiceItem",
    (SELECT json_agg(sk.*) FROM ${ServiceSkill} as sk WHERE sk."serviceId" = s."id") AS "ServiceSkills",
    (SELECT json_agg(u.*) FROM ${UserProfile} as u INNER JOIN ${UserProfileJob} as uj ON u."id"=uj."userProfileId" WHERE uj."jobId"=j."id") AS "employee",
		(SELECT json_agg(vh.*) FROM ${Vehicle} as vh INNER JOIN ${VehicleJob} as vj ON vj."vehicleId"=vh."id" WHERE vj."jobId"=j."id") AS "vehicleJobs",
    (SELECT json_agg(checklist)
      FROM (
        SELECT cj.*, (SELECT json_agg(cji.*) FROM ${ChecklistJobItem} as cji WHERE cji."checklistJobId"=cj."id") AS "ChecklistJobItems"
        FROM ${ChecklistJob} as cj WHERE cj."jobId" = j."id"
      ) checklist
    ) AS "ChecklistJob",
    (SELECT json_agg(expenses)
      FROM (
        SELECT je.*, (SELECT json_agg(jei.*) FROM ${JobExpensesItem} as jei WHERE jei."jobExpensesId"=je."id") AS "JobExpensesItems"
        FROM ${JobExpenses} as je WHERE je."jobId" = j."id"
      ) expenses
    ) AS "JobExpenses",
    (SELECT json_agg(jl.*) FROM ${JobLabel} as jl WHERE jl."jobId"=j."id") AS "jobLabels",
    (SELECT json_agg(jh.*) FROM ${JobHistory} as jh WHERE jh."jobId"=j."id") AS "jobHistories",
    (SELECT json_agg(adc.*) FROM ${ContactPerson} AS adc WHERE adc."clientId" = s."clientId") AS "ContactPerson",
    (SELECT json_agg(jd.*) FROM ${JobDocument} as jd WHERE jd."jobId" = j."id") AS "jobDocuments"


  FROM
    ${Job} as j
    INNER JOIN ${Service} AS s ON j."serviceId" = s."id"
    INNER JOIN ${ServiceAddress} AS sa ON s."serviceAddressId" = sa."id"
    INNER JOIN ${Client} AS c ON s."clientId" = c."id"
    LEFT JOIN ${Invoice} AS i ON i."serviceId" = s."id"
    LEFT JOIN ${Entity} AS e ON e."id" = s."entityId"
    ${ei ? 'INNER' : 'LEFT'} JOIN 
    (SELECT json_agg(u."displayName") as "displayName", json_agg(u."id") as "employeeId", json_agg(u."syncId") as "employeeSyncId", j."id" FROM ${UserProfile} as u 
      INNER JOIN ${UserProfileJob} as uj ON u."id"=uj."userProfileId" 
      INNER JOIN ${Job} j ON uj."jobId" = j."id"
      ${ei ? `WHERE u."id" IN (${ei})` : ''}
      GROUP BY j."id"
    ) AS up ON j."id"=up."id"
    ${vi ? 'INNER' : 'LEFT'} JOIN (
      SELECT json_agg(v."carplateNumber") as "carplateNumber", json_agg(v."id") as "vehicleId", j."id"
      FROM ${Vehicle} as v
      INNER JOIN ${VehicleJob} as vj ON v."id"=vj."vehicleId" 
      INNER JOIN ${Job} j ON vj."jobId" = j."id"
      ${vi ? `WHERE v."id" IN (${vi})` : ''}
      GROUP BY j."id"
    ) AS vhj ON j."id"=vhj."id"
    ${where} 
    ${order}
   ${offsetAndLimit}
  `,
    {
      type: QueryTypes.SELECT
    }
  );

  return result;
};

export const createJob = async (
  startDateTime: string,
  endDateTime: string,
  jobStatus: string,
  serviceId: number,
  transaction?: Transaction
): Promise<Job> => {
  const model = getJobModel();

  return model.create<Job>(
    {
      startDateTime,
      endDateTime,
      jobStatus,
      serviceId
    },
    { transaction }
  );
};

export const createJobWithouTransaction = async (startDateTime: string, endDateTime: string, jobStatus: string, serviceId: number): Promise<Job> => {
  const model = getJobModel();

  return model.create<Job>({
    startDateTime,
    endDateTime,
    jobStatus,
    serviceId
  });
};

// eslint-disable-next-line
export const bulkCreateJob = async (value: JobGenerateResponseModel[]): Promise<any> => {
  const model = getJobModel();

  return model.bulkCreate(value, { validate: false });
};

/** Start the delete query */
// eslint-disable-next-line
export const deleteJobById = async (jobId: number[]): Promise<any> => {
  const model = getJobModel();

  await model.destroy({ where: { id: { [Op.in]: jobId } } });
};
/** End of the delete query */

// eslint-disable-next-line
export const deteleJobByServiceId = async (serviceId: number): Promise<any> => {
  const model = getJobModel();

  await model.destroy({ where: { serviceId } });
};

export const getUncompletedJob = async (serviceId: number, jobId?: number): Promise<Job[]> => {
  const model = getJobModel();

  const where: WhereOptions = { serviceId, jobStatus: { [Op.notIn]: [JobStatus.CANCELLED, JobStatus.COMPLETED] } };

  if (jobId) {
    where.id = { [Op.ne]: jobId };
  }

  return await model.findAll<Job>({ where });
};

export const getCompletedJobByServiceId = async (serviceId: number): Promise<number> => {
  const model = getJobModel();

  const where: WhereOptions = { serviceId, jobStatus: { [Op.in]: [JobStatus.CANCELLED, JobStatus.COMPLETED] } };

  return await model.count({ where });
};

export const getOverdueJob = async (serviceId?: number): Promise<Job[]> => {
  const model = getJobModel();

  const where: WhereOptions = {
    jobStatus: JobStatus.ASSIGNED,
    endDateTime: { [Op.lt]: format(new Date(), 'yyyy-MM-dd HH:mm:ss') }
  };

  if (serviceId) {
    where.serviceId = serviceId;
  }

  return await model.findAll<Job>({ where });
};

export const getTotalCollectedAmountByServiceId = async (serviceId: number): Promise<Job> => {
  const model = getJobModel();

  return model.findOne<Job>({
    attributes: [[Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.col('Job.collectedAmount')), 0), 'collectedAmount']],
    where: { serviceId },
    raw: true
  });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getJobDetailForWa = async (tenantKey: string, jobId: number): Promise<{ jobDetail: JobResponseModel }> => {
  const result: JobResponseModel = await sequelize.query(
    `SELECT
    j."id" AS "jobId",
    j."startDateTime" AS "startDateTime",
    j."endDateTime" AS "endDateTime",
    j."jobStatus" AS "jobStatus",
    s."id" AS "serviceId",
    s."serviceNumber" AS "serviceNumber",
    s."clientId" AS "clientId",
    e."name" AS "entityName",
    e."countryCode" AS "entityCountryCode",
    e."contactNumber" AS "entityContactNumber"
    FROM "${tenantKey}"."Job" j
    INNER JOIN "${tenantKey}"."Service" AS s ON j."serviceId" = s."id"
    LEFT JOIN "${tenantKey}"."Entity" AS e ON e."id" = s."entityId"
    WHERE j."id" = ${jobId};`,
    {
      type: QueryTypes.SELECT,
      plain: true
    }
  );
  return { jobDetail: result };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const updateJobStatusByWa = async (tenantKey: string, jobId: number, jobStatus: string): Promise<any> => {
  return sequelize.query(`UPDATE "${tenantKey}"."Job" SET "jobStatus" = '${jobStatus}' WHERE id = ${jobId} `);
};

export const getJobSchedule = async (jobDate: string, vehicleId?: number, employeeId?: number): Promise<JobResponseModel[]> => {
  const Job = getTableName(TableNames.Job);
  const Service = getTableName(TableNames.Service);
  const ServiceAddress = getTableName(TableNames.ServiceAddress);
  const Client = getTableName(TableNames.Client);
  const Vehicle = getTableName(TableNames.Vehicle);
  const VehicleJob = getTableName(TableNames.VehicleJob);
  const UserProfile = getTableName(TableNames.UserProfile);
  const UserProfileJob = getTableName(TableNames.UserProfileJob);
  const ServiceItemJob = getTableName(TableNames.ServiceItemJob);
  const ServiceItem = getTableName(TableNames.ServiceItem);
  const Invoice = getTableName(TableNames.Invoice);
  const CustomField = getTableName(TableNames.CustomField);

  const result: JobResponseModel[] = await sequelize.query(
    `SELECT
    j."id" AS "jobId",
    j."startDateTime" AS "startDateTime",
    j."endDateTime" AS "endDateTime",
    j."remarks" as "remarks",
    j."additionalServiceId" as "additionalServiceId",
    j."jobStatus" as "jobStatus",
    s."serviceTitle" AS "serviceName",
    c."name" AS "clientName",
    c."name" AS "clientName",
    c."remarks" AS "clientRemarks",
    sa."address" AS "serviceAddress",
    up."displayName" AS "employees",
    vhj."carplateNumber" AS "vehicles",
    i."invoiceNumber" as "invoiceNumber",
    (SELECT json_agg(cf.*) FROM ${CustomField} as cf WHERE cf."serviceId" = s."id") AS "CustomFields",
    (SELECT json_agg(si.*) FROM ${ServiceItem} as si INNER JOIN ${ServiceItemJob} as sij ON si."id"=sij."serviceItemId" WHERE sij."jobId"=j."id") AS "ServiceItem"
    FROM 
    ${Job} as j
    INNER JOIN ${Service} AS s ON j."serviceId" = s."id"
    INNER JOIN ${ServiceAddress} AS sa ON s."serviceAddressId" = sa."id"
    INNER JOIN ${Client} AS c ON s."clientId" = c."id"
    LEFT JOIN ${Invoice} AS i ON i."serviceId" = s."id"
    ${employeeId ? 'INNER' : 'LEFT'} JOIN 
    (SELECT json_agg(u."displayName") as "displayName", json_agg(u."id") as "employeeId", j."id" FROM ${UserProfile} as u 
      INNER JOIN ${UserProfileJob} as uj ON u."id"=uj."userProfileId" 
      INNER JOIN ${Job} j ON uj."jobId" = j."id"
      ${employeeId ? `WHERE u."id" IN (${employeeId})` : ''}
      GROUP BY j."id"
    ) AS up ON j."id"=up."id"
    ${vehicleId ? 'INNER' : 'LEFT'} JOIN (
      SELECT json_agg(v."carplateNumber") as "carplateNumber", json_agg(v."id") as "vehicleId", j."id"
      FROM ${Vehicle} as v
      INNER JOIN ${VehicleJob} as vj ON v."id"=vj."vehicleId" 
      INNER JOIN ${Job} j ON vj."jobId" = j."id"
      ${vehicleId ? `WHERE v."id" IN (${vehicleId})` : ''}
      GROUP BY j."id"
    ) AS vhj ON j."id"=vhj."id"
    WHERE s."serviceStatus" = 'CONFIRMED' AND DATE(j."startDateTime") >= '${jobDate}' AND DATE(j."startDateTime") <='${jobDate}'
    AND (j."jobStatus" = '${JobStatus.ASSIGNED}' OR j."jobStatus" = '${JobStatus.COMPLETED}' OR j."jobStatus" = '${
      JobStatus.PAUSED
    }' OR j."jobStatus" = '${JobStatus.CANCELLED}' OR j."jobStatus" = '${JobStatus.IN_PROGRESS}')
    ORDER BY j."startDateTime" ASC
    `,
    {
      type: QueryTypes.SELECT
    }
  );

  return result;
};

export const getTotalJobByServiceId = async (serviceId: number): Promise<number> => {
  const model = getJobModel();

  const where: WhereOptions = { serviceId, jobStatus: { [Op.notIn]: [JobStatus.CANCELLED] } };

  return model.count({ where });
};

export const getTotalCollectedAdditionalAmountByServiceId = async (serviceId: number): Promise<Job> => {
  const model = getJobModel();

  return model.findOne<Job>({
    attributes: [[Sequelize.fn('SUM', Sequelize.col('Job.additionalCollectedAmount')), 'totalAdditionalCollectedAmount']],
    where: { serviceId },
    group: ['serviceId'],
    raw: true
  });
};

export const getAdditionalCollectedAmountByAdditionalServiceId = async (additionalServiceId: number): Promise<Job> => {
  const model = getJobModel();

  return model.findOne<Job>({
    attributes: ['additionalCollectedAmount'],
    where: { additionalServiceId },
    raw: true
  });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getTotalAdditionalAmountByServiceId = async (serviceId: number): Promise<any> => {
  const Job = getTableName(TableNames.Job);
  const Service = getTableName(TableNames.Service);

  return sequelize.query(
    `SELECT SUM(s."totalAmount") AS "totalAdditionalServiceAmount"
    FROM ${Job} AS j INNER JOIN ${Service} as s ON j."additionalServiceId" = s."id"
    WHERE j."serviceId" = ${serviceId} AND j."additionalServiceId" IS NOT NULL LIMIT 1;`,
    { type: QueryTypes.SELECT, raw: false, plain: true }
  );
};

export const getAdditionalItemsByServiceId = async (serviceId: number): Promise<Job[]> => {
  const Job = getTableName(TableNames.Job);
  const Service = getTableName(TableNames.Service);

  return sequelize.query(
    `SELECT j."id", j."additionalServiceId", j."additionalCollectedAmount" 
    FROM ${Job} AS j INNER JOIN ${Service} as s ON j."serviceId" = s."id"
    WHERE j."serviceId" = ${serviceId} AND j."additionalServiceId" IS NOT NULL;`,
    { type: QueryTypes.SELECT, raw: true }
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getJobSequence = async (jobId: number, serviceId: number): Promise<any> => {
  const Job = getTableName(TableNames.Job);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any = sequelize.query(
    `SELECT "jobSequence"
    FROM (
      SELECT *, ROW_NUMBER() OVER (ORDER BY j."startDateTime") AS "jobSequence"
      FROM ${Job} As j 
      WHERE "serviceId" = ${serviceId}
    ) AS jobSequence_table 
    WHERE "id" = ${jobId};`,
    { type: QueryTypes.SELECT, raw: false, plain: true }
  );

  return result;
};

export const getLastId = async (): Promise<Job> => {
  const model = getJobModel();

  return await model.findOne<Job>({ attributes: [[Sequelize.fn('MAX', Sequelize.col('id')), 'id']] });
};

export const hasJobsInProgressByClientId = async (clientId: number): Promise<boolean> => {
  const Job = getTableName(TableNames.Job);
  const Service = getTableName(TableNames.Service);
  const Client = getTableName(TableNames.Client);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any[] = await sequelize.query(
    `SELECT j."id" FROM ${Job} as j 
    INNER JOIN ${Service} as s ON s."id" = j."serviceId"
    INNER JOIN ${Client} as c ON c."id" = s."clientId"
    WHERE j."jobStatus" = '${JobStatus.IN_PROGRESS}' AND c."id" = ${clientId};`,
    { type: QueryTypes.SELECT }
  );

  return result && result.length > 0 ? true : false;
};

export const hasJobsInProgressByServiceId = async (serviceId: number): Promise<boolean> => {
  const Job = getTableName(TableNames.Job);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any[] = await sequelize.query(
    `SELECT j."id" FROM ${Job} as j 
    WHERE j."jobStatus" = '${JobStatus.IN_PROGRESS}' AND j."serviceId" = ${serviceId};`,
    { type: QueryTypes.SELECT }
  );

  return result && result.length > 0 ? true : false;
};

export const getJobBySyncId = async (syncId: number): Promise<Job> => {
  const model = getJobModel();

  return await model.findOne<Job>({ where: { syncId } });
};

export const getJobByDateTime = async (tenantKey: string, dateTime: string): Promise<Job[]> => {
  const model = Job.schema(tenantKey);

  return await model.findAll<Job>({
    where: {
      startDateTime: dateTime,
      jobStatus: {
        [Op.in]: [JobStatus.CONFIRMED, JobStatus.ASSIGNED, JobStatus.IN_PROGRESS]
      }
    }
  });
};

export const updateStartDateTimeJob = async (tenantKey: string, jobId: number, startDateTime: string, endDateTime: string): Promise<void> => {
  const result: JobResponseModel = await sequelize.query(
    `UPDATE "${tenantKey}"."Job" SET "startDateTime" = '${startDateTime}', "endDateTime" = '${endDateTime}',
    "jobStatus" = '${JobStatus.CONFIRMED}'
    WHERE "id" = ${jobId};`,
    {
      type: QueryTypes.SELECT,
      plain: true
    }
  );
};

export const getPreviousJobsByClient = async (query: JobQueryParams): Promise<JobResponseModel[]> => {
  const Job = getTableName(TableNames.Job);
  const Service = getTableName(TableNames.Service);
  const ServiceItem = getTableName(TableNames.ServiceItem);
  const ServiceItemJob = getTableName(TableNames.ServiceItemJob);
  const UserProfile = getTableName(TableNames.UserProfile);
  const UserProfileJob = getTableName(TableNames.UserProfileJob);

  const { s, l, j: jobFlag, ci: clientId, excludeJobId } = query;
  const now = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
  const offsetAndLimit = generateOffsetAndLimit(s, l);

  let statusCondition = '';
  if (jobFlag) {
    if (jobFlag === '1') {
      statusCondition = `AND j."jobStatus" = '${JobStatus.UNASSIGNED}'`;
    } else if (jobFlag === '2') {
      statusCondition = `AND j."jobStatus" = '${JobStatus.ASSIGNED}'`;
    } else if (jobFlag === '3') {
      statusCondition = `AND j."jobStatus" = '${JobStatus.IN_PROGRESS}'`;
    } else if (jobFlag === '4') {
      statusCondition = `AND j."jobStatus" = '${JobStatus.COMPLETED}'`;
    } else if (jobFlag === '8') {
      statusCondition = `AND j."jobStatus" = '${JobStatus.CANCELLED}'`;
    } else if (jobFlag === '9') {
      statusCondition = `AND j."jobStatus" = '${JobStatus.PAUSED}'`;
    } else if (jobFlag === '10') {
      statusCondition = `AND j."jobStatus" = '${JobStatus.CONFIRMED}'`;
    }
  }

  // ensure only past jobs (exclude upcoming/future jobs)
  const pastCondition = `AND j."startDateTime" < '${now}'`;

  const result: JobResponseModel[] = await sequelize.query(
    `SELECT
      j."id" AS "jobId",
      j."jobStatus" AS "jobStatus",
      j."startDateTime" AS "startDateTime",
      j."collectedAmount" AS "collectedAmount",
      j."paymentMethod" AS "paymentMethod",
      s."totalAmount" AS "totalAmountService",
      s."serviceTitle" AS "serviceName",
      s."serviceType" AS "serviceType",
      (SELECT json_agg(si.*)
         FROM ${ServiceItem} AS si
         INNER JOIN ${ServiceItemJob} AS sij ON si."id" = sij."serviceItemId"
         WHERE sij."jobId" = j."id"
      ) AS "ServiceItem",
      (SELECT json_agg(u."displayName")
         FROM ${UserProfile} AS u
         INNER JOIN ${UserProfileJob} AS uj ON u."id" = uj."userProfileId"
         WHERE uj."jobId" = j."id"
      ) AS "employees"
    FROM ${Job} AS j
    INNER JOIN ${Service} AS s ON j."serviceId" = s."id"
    WHERE s."clientId" = ${clientId}
      AND j."id" != ${excludeJobId}
      ${statusCondition}
      ${pastCondition}
    ORDER BY j."startDateTime" DESC 
    ${offsetAndLimit};`,
    { type: QueryTypes.SELECT }
  );

  return result;
};

export const getLastTechnicianJob = async (technicianId: number): Promise<JobResponseModel> => {
  const Job = getTableName(TableNames.Job);
  const UserProfileJob = getTableName(TableNames.UserProfileJob);
  const Service = getTableName(TableNames.Service);
  const ServiceAddress = getTableName(TableNames.ServiceAddress);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any = await sequelize.query(
    `SELECT
    j."id" AS "jobId",
    j."startDateTime" AS "startDateTime",
    j."endDateTime" AS "endDateTime",
    j."jobStatus" AS "jobStatus",
    sa."postalCode" AS "postalCode"
    FROM ${Job} as j
    INNER JOIN ${UserProfileJob} as upj ON j."id" = upj."jobId"
    INNER JOIN ${Service} AS s ON j."serviceId" = s."id"
    INNER JOIN ${ServiceAddress} AS sa ON s."serviceAddressId" = sa."id"
    WHERE upj."userProfileId" = ${technicianId} AND (j."jobStatus" = '${JobStatus.COMPLETED}' OR j."jobStatus" = '${JobStatus.IN_PROGRESS}')
    ORDER BY j."startDateTime" DESC
    LIMIT 1;`,
    {
      type: QueryTypes.SELECT,
      plain: true
    }
  );
  return result;
};

export const getJobDetailByIdForSmartRank = async (jobId: number): Promise<JobSmartRankingResponseModel> => {
  const Job = getTableName(TableNames.Job);
  const Service = getTableName(TableNames.Service);
  const ServiceAddress = getTableName(TableNames.ServiceAddress);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any = await sequelize.query(
    `SELECT
    j."id" AS "jobId",
    j."startDateTime" AS "startDateTime",
    j."endDateTime" AS "endDateTime",
    j."jobStatus" AS "jobStatus",
    s."id" AS "serviceId",
    sa."address" AS "serviceAddress",
    sa."postalCode" AS "postalCode"
    FROM ${Job} as j
    INNER JOIN ${Service} AS s ON j."serviceId" = s."id"
    INNER JOIN ${ServiceAddress} AS sa ON s."serviceAddressId" = sa."id"
    WHERE j."id" = ${jobId};`,
    {
      type: QueryTypes.SELECT,
      plain: true
    }
  );
  return result;
};
