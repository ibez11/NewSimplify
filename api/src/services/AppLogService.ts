import Logger from '../Logger';
import AppLog from '../database/models/AppLog';
import * as AppLogDao from '../database/dao/AppLogDao';
import * as UserProfileDao from '../database/dao/UserProfileDao';
import { PaginationQueryParams } from '../typings/params/PaginationQueryParams';

const LOG = new Logger('AppLogService.ts');

/**
 * Search app log with query and optional pagination
 *
 * @param s offset for pagination search
 * @param l limit for pagination search
 * @param q query for searching
 *
 * @returns the total counts and the data for current page
 */
export const searchAppWithPagination = async (req: PaginationQueryParams): Promise<{ rows: AppLog[]; count: number }> => {
  LOG.debug('Searching App log with Pagination');

  const { rows, count } = await AppLogDao.getPaginated(req);

  return { rows, count };
};

export const createAppLog = async (userId: number, description: string): Promise<AppLog> => {
  const userProfile = await UserProfileDao.getById(userId);

  return await AppLogDao.createAppLog(userProfile.displayName, description);
};
