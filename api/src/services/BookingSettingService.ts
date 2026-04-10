import BookingSetting, { BookingSettingCode } from '../database/models/BookingSetting';
import * as BookingSettingDao from '../database/dao/BookingSettingDao';
import Logger from '../Logger';
import * as JobDao from '../database/dao/JobDao';
import { isPublicHoliday } from '../utils';

const LOG = new Logger('BookingSettingService.ts');

export const getSettings = async (q?: string, cd?: string, tenantKey?: string): Promise<BookingSetting[]> => {
  LOG.debug('Getting booking settings');

  return await BookingSettingDao.getBookingSettings(q, cd, tenantKey);
};

export const getSpecificSettings = async (code: string, label?: string): Promise<BookingSetting> => {
  LOG.debug('Getting specific booking setting');

  return BookingSettingDao.getSettingByCodeAndLabel(code, label);
};

export const editBookingSetting = async (bookingSetting: BookingSetting[]): Promise<BookingSetting[]> => {
  LOG.debug('Editing Booking Setting');

  if (bookingSetting) {
    try {
      await BookingSettingDao.bulkEditBookingSetting(bookingSetting);
      return getSettings();
    } catch (err) {
      throw err;
    }
  }
};

export const isBookingSlotAvailable = async (startDateTime: string, tenantKey: string): Promise<boolean> => {
  LOG.debug('Checking Booking Time Slot');

  try {
    const limitSetting = await getSettings(null, BookingSettingCode.LIMIT_TIME_SLOT, tenantKey);
    const limitTimeSlot = Number(limitSetting[0].value ?? 0);

    const jobs = await JobDao.getJobByDateTime(tenantKey, startDateTime);

    return jobs.length < limitTimeSlot;
  } catch (err) {
    throw err;
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getAvailableTimeSlots = async (tenantKey: string, startDate: string): Promise<any[]> => {
  LOG.debug('Get Available Time Slots');

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const slots: any[] = [];

    const isPh = await isPublicHoliday(startDate);
    const timeSlotCode = isPh ? BookingSettingCode.TIME_SLOTS_HOLIDAY : BookingSettingCode.TIME_SLOTS;
    const bookingSettings = await getSettings(null, timeSlotCode, tenantKey);

    if (bookingSettings) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const timeSlotPromises: Promise<any>[] = [];

      bookingSettings.forEach(async setting => {
        const timeSlots = setting.code === timeSlotCode ? setting.value?.split(',') : [];

        if (timeSlots && timeSlots.length > 0) {
          timeSlots.forEach(timeSlot => {
            const startDateTime = `${startDate} ${timeSlot}`;
            const promise = isBookingSlotAvailable(startDateTime, tenantKey).then(isAvailable => ({
              time: timeSlot,
              available: isAvailable
            }));
            timeSlotPromises.push(promise);
          });
        }
      });

      const results = await Promise.all(timeSlotPromises);
      return results;
    }

    return slots;
  } catch (err) {
    throw err;
  }
};
