import Logger from '../Logger';

import { format, startOfMonth, endOfMonth, getDate } from 'date-fns';

import { ReportLineResponseModel, ReportCountResponseModel, ReportValueJobResponseModel } from '../typings/ResponseFormats';
import * as ReportDao from '../database/dao/ReportDao';

const LOG = new Logger('ReportService.ts');

/**
 * Get job report with periode and optional filter
 *
 * @param startDate
 * @param endDate
 * @param technician
 * @param vehicle
 * @param jobStatus
 * @param isCompare
 *
 * @returns the data reports for current filter
 */
export const getJobsReports = async (
  startDate: string,
  endDate: string,
  technician?: number,
  vehicle?: number,
  jobStatus?: string,
  isCompare?: number
): Promise<ReportLineResponseModel[]> => {
  LOG.debug('Get Job Report Data');

  let jobs: ReportLineResponseModel[] = [];

  if (isCompare > 0) {
    const firstStart = startOfMonth(new Date(startDate));
    const firstEnd = endOfMonth(new Date(startDate));
    const secondStart = startOfMonth(new Date(endDate));
    const secondEnd = endOfMonth(new Date(endDate));

    const firstData = await ReportDao.getJobsReports(
      format(firstStart, 'yyyy-MM-dd'),
      format(firstEnd, 'yyyy-MM-dd'),
      technician,
      vehicle,
      jobStatus
    );
    const secondData = await ReportDao.getJobsReports(
      format(secondStart, 'yyyy-MM-dd'),
      format(secondEnd, 'yyyy-MM-dd'),
      technician,
      vehicle,
      jobStatus
    );
    jobs = firstData.concat(secondData);
  } else {
    jobs = await ReportDao.getJobsReports(startDate, endDate, technician, vehicle, jobStatus);
  }

  const months: string[] = [];

  await Promise.all(
    jobs.map(job => {
      const date = String(job.x).split('-');
      job.y = Number(job.y);
      job.x = date[2];
      job.type = date[1];

      const findMonth = months.find(month => month === date[1]);
      if (!findMonth) {
        months.push(date[1]);
      }

      return job;
    })
  );

  const lastDate = endOfMonth(new Date(endDate));
  months.map(month => {
    for (let i = 1; i <= getDate(lastDate); i++) {
      const findDate = jobs.find(job => Number(job.x) === i && job.type === month);

      if (!findDate) {
        let date = String(i);
        date = date.length < 2 ? `0${date}` : date;
        jobs.push({
          y: 0,
          x: date,
          type: month
        });
      }
    }
  });

  return jobs.sort((cur, next) => Number(cur.x) - Number(next.x));
};

/**
 * Get value job report with periode and optional filter
 *
 * @param startDate
 * @param endDate
 * @param technician
 * @param vehicle
 * @param jobStatus
 * @param isCompare
 *
 * @returns the data reports for current filter
 */
export const getValueJobsReports = async (
  startDate: string,
  endDate: string,
  technician?: number,
  vehicle?: number,
  jobStatus?: string,
  isCompare?: number
): Promise<ReportLineResponseModel[]> => {
  LOG.debug('Get Value Job Report Data');

  let jobs: ReportValueJobResponseModel[] = [];
  let additionalJobs: ReportValueJobResponseModel[] = [];

  if (isCompare > 0) {
    const firstStart = startOfMonth(new Date(startDate));
    const firstEnd = endOfMonth(new Date(startDate));
    const secondStart = startOfMonth(new Date(endDate));
    const secondEnd = endOfMonth(new Date(endDate));

    const firstJobData = await ReportDao.getValueJobsReports(
      format(firstStart, 'yyyy-MM-dd'),
      format(firstEnd, 'yyyy-MM-dd'),
      technician,
      vehicle,
      jobStatus
    );
    const secondJobData = await ReportDao.getValueJobsReports(
      format(secondStart, 'yyyy-MM-dd'),
      format(secondEnd, 'yyyy-MM-dd'),
      technician,
      vehicle,
      jobStatus
    );

    const firstAdditionalData = await ReportDao.getValueAdditionalReports(
      format(firstStart, 'yyyy-MM-dd'),
      format(firstEnd, 'yyyy-MM-dd'),
      technician,
      vehicle,
      jobStatus
    );
    const secondAdditionalJobData = await ReportDao.getValueAdditionalReports(
      format(secondStart, 'yyyy-MM-dd'),
      format(secondEnd, 'yyyy-MM-dd'),
      technician,
      vehicle,
      jobStatus
    );

    jobs = firstJobData.concat(secondJobData);
    additionalJobs = firstAdditionalData.concat(secondAdditionalJobData);
  } else {
    jobs = await ReportDao.getValueJobsReports(startDate, endDate, technician, vehicle, jobStatus);
    additionalJobs = await ReportDao.getValueAdditionalReports(startDate, endDate, technician, vehicle, jobStatus);
  }

  const months: string[] = [];

  await Promise.all(
    jobs.map(job => {
      const date = String(job.x).split('-');
      let additionalValueJob = 0;

      if (additionalJobs) {
        const getAdditionalValue = additionalJobs.find(value => value.x == job.x);
        additionalValueJob = getAdditionalValue ? Number(getAdditionalValue.additionalAmount) : 0;
      }

      const sumAmount = Number(job.totalAmount) + additionalValueJob;
      job.y = sumAmount;
      job.x = date[2];
      job.type = date[1];

      const findMonth = months.find(month => month === date[1]);
      if (!findMonth) {
        months.push(date[1]);
      }

      return job;
    })
  );

  const lastDate = endOfMonth(new Date(endDate));
  months.map(month => {
    for (let i = 1; i <= getDate(lastDate); i++) {
      const findDate = jobs.find(job => Number(job.x) === i && job.type === month);

      if (!findDate) {
        let date = String(i);
        date = date.length < 2 ? `0${date}` : date;
        jobs.push({
          y: 0,
          x: date,
          type: month
        });
      }
    }
  });

  return jobs.sort((cur, next) => Number(cur.x) - Number(next.x));
};

/**
 * Get revenue report with periode and optional filter
 *
 * @param startDate
 * @param endDate
 * @param isCompare
 *
 * @returns the data reports for current filter
 */
export const getRevenueReports = async (startDate: string, endDate: string, isCompare: number): Promise<ReportLineResponseModel[]> => {
  LOG.debug('Get Revenue Report Data');

  let revenue: ReportLineResponseModel[] = [];
  if (isCompare > 0) {
    const firstStart = startOfMonth(new Date(startDate));
    const firstEnd = endOfMonth(new Date(startDate));
    const secondStart = startOfMonth(new Date(endDate));
    const secondEnd = endOfMonth(new Date(endDate));

    const firstData = await ReportDao.getRevenueReports(format(firstStart, 'yyyy-MM-dd'), format(firstEnd, 'yyyy-MM-dd'));
    const secondData = await ReportDao.getRevenueReports(format(secondStart, 'yyyy-MM-dd'), format(secondEnd, 'yyyy-MM-dd'));

    revenue = firstData.concat(secondData);
  } else {
    revenue = await ReportDao.getRevenueReports(startDate, endDate);
  }

  const months: string[] = [];

  await Promise.all(
    revenue.map(data => {
      data.y = Number(data.y);

      const findMonth = months.find(month => month === data.type);
      if (!findMonth) {
        months.push(data.type);
      }

      return data;
    })
  );

  const lastDate = endOfMonth(new Date(endDate));
  months.map(month => {
    for (let i = 1; i <= getDate(lastDate); i++) {
      const findDate = revenue.find(data => Number(data.x) === i && data.type === month);

      if (!findDate) {
        let date = String(i);
        date = date.length < 2 ? `0${date}` : date;
        revenue.push({
          y: 0,
          x: date,
          type: month
        });
      }
    }
  });

  return revenue.sort((cur, next) => Number(cur.x) - Number(next.x));
};

/**
 * Get revenue report with periode and optional filter
 *
 * @param selectedDate
 *
 * @returns the data reports for current filter
 */
export const getOverviewReports = async (selectedDate: string): Promise<ReportLineResponseModel[]> => {
  LOG.debug('Get Overview Report Data');

  const overview = await ReportDao.getOverviewReports(selectedDate);

  await Promise.all(
    overview.map(data => {
      const date = String(data.x).split('-');
      data.y = Number(data.y);
      data.x = date[2];
      return data;
    })
  );

  return overview;
};

/**
 * Get popular contract type report with periode and optional filter
 *
 * @param startDate
 * @param endDate
 *
 * @returns the data reports for current filter
 */
export const getPopularContractsReports = async (startDate: string, endDate: string): Promise<ReportCountResponseModel[]> => {
  LOG.debug('Get Popular Contracts Report Data');

  const contracts = await ReportDao.getPopularContractsReports(startDate, endDate);

  const total = contracts.reduce((sum: number, current: ReportCountResponseModel) => sum + Number(current.value), 0);

  await Promise.all(
    contracts.map((contract: ReportCountResponseModel) => {
      const percent = (contract.value / total) * 100;
      contract.percent = Number(percent.toFixed(2));
      contract.value = Number(contract.value);
      return contract;
    })
  );

  return contracts;
};

/**
 * Get popular service items report with periode and optional filter
 *
 * @param startDate
 * @param endDate
 *
 * @returns the data reports for current filter
 */
export const getPopularServiceItemsReports = async (startDate: string, endDate: string): Promise<ReportCountResponseModel[]> => {
  LOG.debug('Get Popular Service Items Report Data');

  const items = await ReportDao.getPopularServiceItemsReports(startDate, endDate);

  const total = items.reduce((sum: number, current: ReportCountResponseModel) => sum + Number(current.value), 0);

  await Promise.all(
    items.map(item => {
      const percent = (item.value / total) * 100;
      item.percent = Number(percent.toFixed(2));
      item.value = Number(item.value);
      return item;
    })
  );

  return items;
};
