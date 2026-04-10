import { DistrictBody } from '../typings/body/DistrictBody';
import { PaginationQueryParams } from '../typings/params/PaginationQueryParams';
import Logger from '../Logger';
import * as DistrictDao from '../database/dao/DistrictDao';

const LOG = new Logger('DistrictService');

export const searchDistrictWithPagination = async (query: PaginationQueryParams): Promise<{ rows: DistrictBody[]; count: number }> => {
  LOG.debug('Searching District area with Pagination');

  return await DistrictDao.getPaginated(query);
};

export const getDistrictProximityScore = async (fromPostalCode: string, toPostalCode: string): Promise<number | null> => {
  LOG.debug('Getting District Proximity Score');

  return await DistrictDao.getDistrictProximityScore(fromPostalCode, toPostalCode);
};

export const getDistrictProximityInfo = async (fromPostalCode: string, toPostalCode: string): Promise<DistrictDao.DistrictProximityInfo> => {
  LOG.debug('Getting District Proximity Info');
  return await DistrictDao.getDistrictProximityInfo(fromPostalCode, toPostalCode);
};

export const getDistrictGroupByPostalCode = async (postalCode: string): Promise<string | null> => {
  LOG.debug('Getting District Group by Postal Code');

  return await DistrictDao.getDistrictGroupByPostalCode(postalCode);
};
