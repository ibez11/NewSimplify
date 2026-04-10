import Logger from '../Logger';
import TableColumnSetting from '../database/models/TableColumnSetting';
import TableColumnSettingNotFoundError from '../errors/TableColumnSettingNotFoundError';
import * as TableColumnSettingDao from '../database/dao/TableColumnSettingDao';

const LOG = new Logger('TableColumnSettingService.ts');

export const getSpecificTableColumnSettings = async (tableName: string): Promise<TableColumnSetting> => {
  LOG.debug('Getting specific table column settings');

  const setting = await TableColumnSettingDao.getSettingByTableName(tableName);

  if (!setting) {
    throw new TableColumnSettingNotFoundError(tableName);
  }

  return setting;
};

export const getTableColumnSettings = async (): Promise<TableColumnSetting[]> => {
  LOG.debug('Getting table column settings');

  const settings = await TableColumnSettingDao.getTableColumnSettings();

  return settings;
};

/**
 * To Edit a table column setting in the system, based on user choose and inputed new data
 *
 * @param id of setting
 * @param tableName of the setting
 * @param column of the setting
 *
 * @returns void
 */
export const createTableCloumnSetting = async (tableName: string, column: string): Promise<TableColumnSetting> => {
  LOG.debug('Creating Table Column Setting');

  try {
    let setting = await TableColumnSettingDao.getSettingByTableName(tableName);

    if (!setting) {
      setting = await TableColumnSettingDao.createTableColumnSetting(tableName, column);
    } else {
      await setting.update({ column });
    }

    return setting;
  } catch (err) {
    throw err;
  }
};

/**
 * To Edit a table column setting in the system, based on user choose and inputed new data
 *
 * @param id of setting
 * @param tableName of the setting
 * @param column of the setting
 *
 * @returns void
 */
export const editTableCloumnSetting = async (id: number, tableName: string, column: string): Promise<TableColumnSetting> => {
  LOG.debug('Editing Table Column Setting');

  const setting = await TableColumnSettingDao.getTableColumnSettingById(id);

  if (!setting) {
    throw new TableColumnSettingNotFoundError(id);
  }

  try {
    return setting.update({ tableName, column });
  } catch (err) {
    throw err;
  }
};
