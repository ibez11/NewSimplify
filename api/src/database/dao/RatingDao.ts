import { QueryTypes, Op, Transaction } from 'sequelize';
import { sequelize } from '../../config/database';
import TableNames from '../enums/TableNames';

import { getTableName, getRatingModel, getJobModel, getServiceModel, getClientModel } from '../models';
import Rating from '../models/Rating';
import { ReportLineResponseModel } from '../../typings/ResponseFormats';

export const getTechnicianRating = async (startDate: string, endDate: string, technician?: number): Promise<ReportLineResponseModel[]> => {
  const Rating = getTableName(TableNames.Rating);
  const Job = getTableName(TableNames.Job);
  const UserProfileJob = getTableName(TableNames.UserProfileJob);
  let optionalCondition = '';

  if (technician) {
    optionalCondition = `
      LEFT JOIN ${UserProfileJob} upj ON upj."jobId" = j.id
      WHERE upj."userProfileId" = ${technician} AND
    `;
  }

  const dateCondition = `r."createdAt" >= '${startDate} 00:00:00' AND r."createdAt" <= '${endDate} 23:59:59'`;

  const result: ReportLineResponseModel[] = await sequelize.query(
    `SELECT AVG(r."rate") AS "y", DATE_TRUNC('month', r."createdAt")::date AS "x"
    FROM ${Rating} AS r
    INNER JOIN ${Job} j ON r."jobId" = j."id"
    ${optionalCondition ? optionalCondition : 'WHERE'}
    ${dateCondition}
    GROUP BY DATE_TRUNC('month', r."createdAt")::date
    ORDER BY x;`,
    {
      type: QueryTypes.SELECT
    }
  );

  return result;
};

export const getFeedbackReport = async (startDate: string, endDate: string): Promise<{ rows: Rating[]; count: number }> => {
  const model = getRatingModel();
  const Job = getJobModel();
  const Service = getServiceModel();
  const Client = getClientModel();

  // eslint-disable-next-line
  let where: any = {};

  if (startDate && endDate) {
    where[Op.and] = {
      ...where,
      createdAt: {
        [Op.gte]: `${startDate} 00:00:00`,
        [Op.lte]: `${endDate} 23:59:59`
      }
    };
  }

  return model.findAndCountAll<Rating>({
    where,
    include: [
      {
        model: Job,
        required: true,
        attributes: ['id', 'serviceId'],
        as: 'Job',
        include: [
          {
            model: Service,
            required: true,
            attributes: ['clientId'],
            include: [
              {
                model: Client,
                required: true,
                attributes: ['name']
              }
            ]
          }
        ]
      }
    ],
    order: [['id', 'DESC']]
  });
};

export const getCompanyRating = async (startDate: string, endDate: string): Promise<ReportLineResponseModel[]> => {
  const Rating = getTableName(TableNames.Rating);

  const dateCondition = `WHERE r."createdAt" >= '${startDate} 00:00:00' AND r."createdAt" <= '${endDate} 23:59:59'`;

  const result: ReportLineResponseModel[] = await sequelize.query(
    `SELECT AVG(r."rate") AS "y", DATE_TRUNC('month', "createdAt")::date AS "x"
    FROM ${Rating} AS r
    ${dateCondition}
    GROUP BY DATE_TRUNC('month', "createdAt")::date
    ORDER BY x;`,
    {
      type: QueryTypes.SELECT
    }
  );

  return result;
};

export const createFeedback = async (feedback: string, rate: number, jobId: number, transaction: Transaction): Promise<Rating> => {
  const model = getRatingModel();

  return model.create<Rating>({ feedback, rate, jobId }, { transaction });
};
