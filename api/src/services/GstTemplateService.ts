import Logger from '../Logger';
import GstTemplate from '../database/models/GstTemplate';
import * as GstTemplateDao from '../database/dao/GstTemplateDao';

const LOG = new Logger('GstTemplateService');

/**
 * Search Gst Template with query and optional pagination
 *
 * @param offset offset for pagination search
 * @param limit limit for pagination search
 * @param q query for searching
 *
 * @returns the total counts and the data for current page
 */
export const searchGstTemplatesWithPagination = async (
  offset: number,
  limit?: number,
  q?: string
): Promise<{ rows: GstTemplate[]; count: number }> => {
  LOG.debug('Searching Gst Template with Pagination');

  return await GstTemplateDao.getPaginated(offset, limit, q);
};

export const getDefaultGst = async (): Promise<GstTemplate> => {
  LOG.debug('Getting Default GST');

  return await GstTemplateDao.getDefaultGstTemplate();
};
