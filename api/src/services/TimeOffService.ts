import Logger from '../Logger';
import TimeOffQueryParams from '../typings/params/TimeOffQueryParams';
import * as TimeOffDao from '../database/dao/TimeOffDao';
import * as TimeOffEmployeeDao from '../database/dao/TimeOffEmployeeDao';
import { TimeOffBody } from '../typings/body/TimeOffBody';
import TimeOffNotFoundError from '../errors/TimeOffNotFoundError';
import { Transaction } from 'sequelize';
import { format } from 'date-fns';

const LOG = new Logger('TimeOffService');

export const searchTimeOffsWithPagination = async (query?: TimeOffQueryParams): Promise<TimeOffBody[]> => {
  return await TimeOffDao.getPaginated(query);
};

export const getAll = async (query?: TimeOffQueryParams): Promise<TimeOffBody[]> => {
  return await searchTimeOffsWithPagination(query);
};

export const getTimeOffById = async (TimeOffId: number): Promise<TimeOffBody[]> => {
  LOG.debug('Getting TimeOff from TimeOffId');

  const TimeOff = await TimeOffDao.getById(TimeOffId);

  if (!TimeOff) {
    throw new TimeOffNotFoundError(TimeOffId);
  }

  return TimeOff;
};

export const createTimeOff = async (req: TimeOffBody): Promise<TimeOffBody[]> => {
  LOG.debug('Creating TimeOff');

  try {
    // req.startDateTime = req.startDateTime.toLocaleString().slice(0, 10) + ' 00:00:01';
    // req.endDateTime = req.endDateTime.toLocaleString().slice(0, 10) + ' 23:59:59';
    const TimeOff = await TimeOffDao.createTimeOff(req);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const employees: any[] = [];
    if (req.Employees && req.Employees.length > 0) {
      req.Employees.map(async val => {
        employees.push({ timeOffId: TimeOff.id, userId: val.id });
      });
      await TimeOffEmployeeDao.create(employees);
    }
    return TimeOffDao.getById(TimeOff.id);
  } catch (err) {
    throw err;
  }
};

export const editTimeOff = async (id: number, req: TimeOffBody): Promise<TimeOffBody[]> => {
  LOG.debug('Editing TimeOff');

  const TimeOff = await TimeOffDao.getById(id);

  if (!TimeOff) {
    throw new TimeOffNotFoundError(id);
  }

  try {
    await TimeOffDao.deleteTimeOffById(id);
    await TimeOffEmployeeDao.deleteData(id);
    // req.startDateTime = req.startDateTime.toLocaleString().slice(0, 10) + ' 00:00:01';
    // req.endDateTime = req.endDateTime.toLocaleString().slice(0, 10) + ' 23:59:59';
    const TimeOff = await TimeOffDao.createTimeOff(req);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const employees: any[] = [];
    if (req.Employees && req.Employees.length > 0) {
      req.Employees.map(async val => {
        employees.push({ timeOffId: TimeOff.id, userId: val.id });
      });
      await TimeOffEmployeeDao.create(employees);
    }
    return TimeOffDao.getById(TimeOff.id);
  } catch (err) {
    throw err;
  }
};

export const deleteTimeOff = async (id: number): Promise<void> => {
  await TimeOffDao.deleteTimeOffById(id);
};
