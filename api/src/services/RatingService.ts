import Logger from '../Logger';
import Rating from '../database/models/Rating';
import * as RatingDao from '../database/dao/RatingDao';
import { ReportLineResponseModel } from '../typings/ResponseFormats';
import { getMonth, format } from 'date-fns';
import { sequelize } from '../config/database';

// import { Transaction } from 'sequelize';

const LOG = new Logger('RatingService');

/**
 * Get company rating with periode
 *
 * @param startDate
 * @param endDate
 * @param technician
 *
 * @returns the data technician rating
 */
export const getTechnicianRating = async (startDate: string, endDate: string, technician?: number): Promise<ReportLineResponseModel[]> => {
  LOG.debug('Get Technician Rating');

  const technicianRating: ReportLineResponseModel[] = [];
  const years: string[] = [];

  const rating = await RatingDao.getTechnicianRating(startDate, endDate, technician);

  await Promise.all(
    rating.map(rating => {
      const date = String(rating.x).split('-');
      rating.y = Number(rating.y);
      rating.x = date[1];
      rating.type = date[0];

      const findYear = years.find(year => year === date[0]);
      if (!findYear) {
        years.push(date[0]);
      }

      return rating;
    })
  );

  const lastMonth = getMonth(new Date(endDate));
  years.map(year => {
    for (let i = 1; i <= lastMonth + 1; i++) {
      const findData = rating.find(rating => Number(rating.x) === i && rating.type === year);

      if (!findData) {
        const month = format(new Date(Number(year), i, 0), 'MMM');
        technicianRating.push({
          y: 0,
          x: month,
          type: year
        });
      } else {
        const month = format(new Date(Number(year), Number(findData.x), 0), 'MMM');
        technicianRating.push({
          y: findData.y,
          x: month,
          type: findData.type
        });
      }
    }
  });

  return technicianRating;
};

/**
 * Get feedback costumer with periode
 *
 * @param startDate
 * @param endDate
 *
 * @returns the data feedbacks for current filter
 */
export const getFeedbackCustomer = async (startDate: string, endDate: string): Promise<{ rows: Rating[]; count: number }> => {
  LOG.debug('Get Feedback Customers');

  const { rows, count } = await RatingDao.getFeedbackReport(startDate, endDate);

  return { rows, count };
};

/**
 * Get company rating with periode
 *
 * @param startDate
 * @param endDate
 *
 * @returns the data company rating
 */
export const getCompanyRating = async (startDate: string, endDate: string): Promise<ReportLineResponseModel[]> => {
  LOG.debug('Get Company Rating');

  const companyRating: ReportLineResponseModel[] = [];
  const years: string[] = [];

  const rating = await RatingDao.getCompanyRating(startDate, endDate);

  await Promise.all(
    rating.map(rating => {
      const date = String(rating.x).split('-');
      rating.y = Number(rating.y);
      rating.x = date[1];
      rating.type = date[0];

      const findYear = years.find(year => year === date[0]);
      if (!findYear) {
        years.push(date[0]);
      }

      return rating;
    })
  );

  const lastMonth = getMonth(new Date(endDate));
  years.map(year => {
    for (let i = 1; i <= lastMonth + 1; i++) {
      const findData = rating.find(rating => Number(rating.x) === i && rating.type === year);

      if (!findData) {
        const month = format(new Date(Number(year), i, 0), 'MMM');
        companyRating.push({
          y: 0,
          x: month,
          type: year
        });
      } else {
        const month = format(new Date(Number(year), Number(findData.x), 0), 'MMM');
        companyRating.push({
          y: findData.y,
          x: month,
          type: findData.type
        });
      }
    }
  });

  return companyRating;
};

/**
 * Create new feedback in the system
 *
 * @param feedback
 * @param rate
 * @param jobId
 *
 * @returns RatingModel
 */
export const createFeedback = async (feedback: string, rate: number, jobId: number): Promise<Rating> => {
  LOG.debug('Creating Feedback');

  const transaction = await sequelize.transaction();

  try {
    const feedbacks = await RatingDao.createFeedback(feedback, rate, jobId, transaction);

    await transaction.commit();

    return feedbacks;
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};
