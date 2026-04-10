import { Op, WhereOptions } from 'sequelize';
import { getSettingModel } from '../models';
import { Transaction } from 'sequelize';
import Setting from '../models/Setting';

/**
 * Search Service Template with query and optional pagination
 *
 * @param query query for searching
 * @param code query for get by code
 *
 * @returns the data for page
 */
export const getSettings = async (query?: string, code?: string): Promise<Setting[]> => {
  const model = getSettingModel();

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

  return model.findAll<Setting>({ where });
};

export const getSettingById = async (id: number): Promise<Setting> => {
  const model = getSettingModel();

  return model.findByPk<Setting>(id);
};

export const getSettingByCodeAndLabel = async (code: string, label?: string): Promise<Setting> => {
  const model = getSettingModel();

  const where: WhereOptions = { code };

  if (label) {
    where.label = label;
  }

  return model.findOne<Setting>({ where });
};

export const createSetting = async (code: string, label: string, value: string, isActive: boolean, transaction?: Transaction): Promise<Setting> => {
  const model = getSettingModel();

  return model.create<Setting>(
    {
      code,
      label,
      value,
      isActive: isActive || true
    },
    { transaction }
  );
};
