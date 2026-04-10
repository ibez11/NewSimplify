import Schedule from '../models/Schedule';
import { getScheduleModel, getServiceItemModel } from '../models';
import { ScheduleResponseModel } from '../../typings/ResponseFormats';
import { Transaction } from 'sequelize';

export const createSchedule = async (
  serviceId: number,
  startDateTime: Date,
  endDateTime: Date,
  repeatType: string,
  repeatEvery: number,
  repeatOnDate: number,
  repeatOnDay: string,
  repeatOnWeek: number,
  repeatOnMonth: number,
  repeatEndType: string,
  repeatEndAfter: number,
  repeatEndOnDate?: Date,
  transaction?: Transaction
): Promise<Schedule> => {
  const model = getScheduleModel();
  repeatEndOnDate = repeatEndOnDate || null;

  return model.create<Schedule>(
    {
      serviceId,
      startDateTime,
      endDateTime,
      repeatType,
      repeatEvery,
      repeatOnDate,
      repeatOnDay,
      repeatOnWeek,
      repeatOnMonth,
      repeatEndType,
      repeatEndAfter,
      repeatEndOnDate
    },
    { transaction }
  );
};

export const createScheduleWithoutTransaction = async (
  serviceId: number,
  startDateTime: Date,
  endDateTime: Date,
  repeatType: string,
  repeatEvery: number,
  repeatOnDate: number,
  repeatOnDay: string,
  repeatOnWeek: number,
  repeatOnMonth: number,
  repeatEndType: string,
  repeatEndAfter: number,
  repeatEndOnDate?: Date
): Promise<Schedule> => {
  const model = getScheduleModel();
  repeatEndOnDate = repeatEndOnDate || null;

  return model.create<Schedule>({
    serviceId,
    startDateTime,
    endDateTime,
    repeatType,
    repeatEvery,
    repeatOnDate,
    repeatOnDay,
    repeatOnWeek,
    repeatOnMonth,
    repeatEndType,
    repeatEndAfter,
    repeatEndOnDate
  });
};

// eslint-disable-next-line
export const bulkCreateSchedule = async (value: ScheduleResponseModel[]): Promise<any> => {
  const model = getScheduleModel();

  return model.bulkCreate(value, { validate: false });
};

export const getScheduleById = async (id: number): Promise<Schedule> => {
  const model = getScheduleModel();

  return model.findByPk<Schedule>(id);
};

export const getScheduleByServiceId = async (serviceId: number): Promise<Schedule[]> => {
  const model = getScheduleModel();

  return model.findAll<Schedule>({ where: { serviceId } });
};

// eslint-disable-next-line
export const deleteScheduleByServiceId = async (serviceId: number): Promise<any> => {
  const model = getScheduleModel();

  await model.destroy({ where: { serviceId } });
};
