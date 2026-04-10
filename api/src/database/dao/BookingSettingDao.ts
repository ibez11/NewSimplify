import { Op, QueryTypes, WhereOptions } from 'sequelize';
import { getBookingSettingModel, getTableName } from '../models';
import BookingSetting from '../models/BookingSetting';
import { Transaction } from 'sequelize';
import TableNames from '../enums/TableNames';
import { sequelize } from '../../config/database';

export const getBookingSettings = async (query?: string, code?: string, tenantKey?: string): Promise<BookingSetting[]> => {
  const model = tenantKey ? (BookingSetting.schema(tenantKey) as typeof BookingSetting) : getBookingSettingModel();

  // eslint-disable-next-line
  const where: any = {};

  if (query) {
    where[Op.or] = {
      label: {
        [Op.iLike]: `%${query}%`
      },
      code: {
        [Op.iLike]: `%${query}%`
      },
      value: {
        [Op.iLike]: `%${query}%`
      }
    };
  }

  if (code) {
    where[Op.or] = { code };
  }

  return model.findAll<BookingSetting>({ where, order: [['id', 'ASC']] });
};

export const getBookingSettingById = async (id: number): Promise<BookingSetting> => {
  const model = getBookingSettingModel();

  return model.findByPk<BookingSetting>(id);
};

export const getSettingByCodeAndLabel = async (code: string, label?: string): Promise<BookingSetting> => {
  const model = getBookingSettingModel();

  const where: WhereOptions = { code };

  if (label) {
    where.label = label;
  }

  return model.findOne<BookingSetting>({ where });
};

export const createBookingSetting = async (
  code: string,
  label: string,
  value: string,
  isActive: boolean,
  transaction?: Transaction
): Promise<BookingSetting> => {
  const model = getBookingSettingModel();

  return model.create<BookingSetting>(
    {
      code,
      label,
      value,
      isActive: isActive || true
    },
    { transaction }
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const bulkEditBookingSetting = async (bookingSettingsObj: Record<string, any>): Promise<void> => {
  const BookingSetting = getTableName(TableNames.BookingSetting);

  const entries = Object.entries(bookingSettingsObj)
    .filter(([key]) => key !== 'LogoUrl')
    .map(([label, value]) => {
      if ((label === 'TimeSlots' || label === 'TimeSlotsHoliday') && Array.isArray(value)) {
        return [label, value.join(',')];
      }
      return [label, value];
    });

  await sequelize.transaction(async (transaction: Transaction) => {
    for (const [label, value] of entries) {
      await sequelize.query(
        `UPDATE ${BookingSetting} 
         SET "value" = :value
         WHERE "label" = :label`,
        {
          replacements: { label, value },
          type: QueryTypes.UPDATE,
          transaction
        }
      );
    }
  });
};
