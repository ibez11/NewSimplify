import Logger from '../Logger';
import Setting from '../database/models/Setting';
import SettingNotFoundError from '../errors/SettingNotFoundError';
import * as SettingDao from '../database/dao/SettingDao';
import * as TenantDao from '../database/dao/TenantDao';
import * as ClientDao from '../database/dao/ClientDao';
import { ucWords } from '../utils';
import { getTenantKey } from '../database/models';
import { SettingCode } from '../database/models/Setting';

const LOG = new Logger('SettingService.ts');

/**
 * Search Service Template with query and optional pagination
 *
 * @param q query for searching
 * @param cd query for get by code
 *
 * @returns the data for page
 */
export const getSettings = async (q?: string, cd?: string): Promise<Setting[]> => {
  LOG.debug('Getting settings');

  let settings = await SettingDao.getSettings(q, cd);

  if (cd && settings.length < 1) {
    await SettingDao.createSetting(cd, ucWords(cd), '', false);
    settings = await SettingDao.getSettings(q, cd);
  }

  return settings;
};
/**
 * Search Service Template with query and optional pagination
 *
 * @param q query for searching
 * @param cd query for get by code
 *
 * @returns the data for page
 */
export const getSpecificSettings = async (code: string, label?: string): Promise<Setting> => {
  LOG.debug('Getting specific settings');

  return SettingDao.getSettingByCodeAndLabel(code, label);
};

/**
 * To Edit a setting in the system, based on user choose and inputed new data
 *
 * @param id of setting
 * @param value of the setting
 * @param label of the setting
 *
 * @returns void
 */
export const createSetting = async (code: string, label: string, value: string, isActive: boolean): Promise<Setting> => {
  LOG.debug('Editing Setting');

  try {
    let setting = await SettingDao.getSettingByCodeAndLabel(code, label);

    if (!setting) {
      setting = await SettingDao.createSetting(code, label, value, isActive);
    } else {
      await setting.update({ value, isActive });

      if (label === 'CompanyName') {
        const tenantKey = getTenantKey();
        const tenantName = await TenantDao.getByTenantKey(tenantKey.toUpperCase());
        tenantName.update({ name: value });
      }
    }

    return setting;
  } catch (err) {
    throw err;
  }
};

/**
 * To Edit a setting in the system, based on user choose and inputed new data
 *
 * @param id of setting
 * @param value of the setting
 * @param isActive of the setting
 *
 * @returns void
 */
export const editSetting = async (id: number, value: string, isActive: boolean): Promise<Setting> => {
  LOG.debug('Editing Setting');

  const setting = await SettingDao.getSettingById(id);
  const tenantKey = getTenantKey();
  const tenant = await TenantDao.getByTenantKey(tenantKey.toUpperCase());

  if (!setting) {
    throw new SettingNotFoundError(id);
  }

  try {
    if (setting.code === SettingCode.EMAILNOTIFICATION) {
      await ClientDao.updateEmailReminder('emailReminder', isActive);
      tenant.update({ emailService: isActive });
    }

    if (setting.code === SettingCode.WHATSAPPNOTIFICATION) {
      await ClientDao.updateEmailReminder('whatsAppReminder', isActive);
      tenant.update({ whatsappService: isActive });
    }

    return setting.update({ value, isActive });
  } catch (err) {
    throw err;
  }
};
