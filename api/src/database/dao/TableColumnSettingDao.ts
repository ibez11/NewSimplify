import { getTableColumnSettingModel } from '../models';
import { Transaction } from 'sequelize';
import TableColumnSetting from '../models/TableColumnSetting';

export const getTableColumnSettings = async (): Promise<TableColumnSetting[]> => {
  const model = getTableColumnSettingModel();

  return model.findAll<TableColumnSetting>();
};

export const getTableColumnSettingById = async (id: number): Promise<TableColumnSetting> => {
  const model = getTableColumnSettingModel();

  return model.findByPk<TableColumnSetting>(id);
};

export const getSettingByTableName = async (tableName?: string): Promise<TableColumnSetting> => {
  const model = getTableColumnSettingModel();

  // eslint-disable-next-line
  const where: any = {};

  if (tableName) {
    where.tableName = tableName;
  }

  return model.findOne<TableColumnSetting>({ where });
};

export const createTableColumnSetting = async (tableName: string, column: string, transaction?: Transaction): Promise<TableColumnSetting> => {
  const model = getTableColumnSettingModel();

  return model.create<TableColumnSetting>(
    {
      tableName,
      column
    },
    { transaction }
  );
};
