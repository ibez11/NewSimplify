import Logger from '../Logger';
import BrandTemplate from '../database/models/BrandTemplate';
import * as BrandTemplateDao from '../database/dao/BrandTemplateDao';
import BrandTemplateNotFoundError from '../errors/BrandTemplateNotFoundError';
import { BrandTemplateResponseModel } from '../typings/ResponseFormats';

const LOG = new Logger('BrandTemplateService');

/**
 * Search Brand Template with query and optional pagination
 *
 * @param offset offset for pagination search
 * @param limit limit for pagination search
 * @param q query for searching
 *
 * @returns the total counts and the data for current page
 */
export const searchBrandTemplatesWithPagination = async (
  offset: number,
  limit?: number,
  q?: string
): Promise<{ rows: BrandTemplate[]; count: number }> => {
  LOG.debug('Searching Brand Template with Pagination');

  return await BrandTemplateDao.getPaginated(offset, limit, q);
};

/**
 * Create a new Brand Template in the system, based on user input
 *
 * @param name of the new Brand Template
 * @param description of the new Brand Template
 *
 * @returns BrandTemplateResponseModel
 */
export const createBrandTemplate = async (name: string, description: string): Promise<BrandTemplateResponseModel> => {
  LOG.debug('Creating Brand Template');

  try {
    const BrandTemplate = await BrandTemplateDao.createBrandTemplate(name, description);

    return BrandTemplate;
  } catch (err) {
    throw err;
  }
};

export const getBrandTemplateById = async (id: number): Promise<BrandTemplateResponseModel> => {
  LOG.debug('Getting Brand Template full details from id');

  const brandTemplate = await BrandTemplateDao.getBrandTemplateTemplateById(id);

  if (!brandTemplate) {
    throw new BrandTemplateNotFoundError(id);
  }

  return brandTemplate.toResponseFormat();
};

/**
 * To Edit a Brand Template in the system, based on user choose and inputed new data
 *
 * @param id of Brand Template
 * @param name of the Brand Template
 * @param description of the Brand Template
 *
 * @returns void
 */
export const editBrandTemplate = async (id: number, name: string, description: string): Promise<BrandTemplate> => {
  LOG.debug('Editing Brand Template');

  const brandTemplate = await BrandTemplateDao.getBrandTemplateTemplateById(id);

  if (!brandTemplate) {
    throw new BrandTemplateNotFoundError(id);
  }

  try {
    return await brandTemplate.update({ name, description });
  } catch (err) {
    throw err;
  }
};

/**
 * To delete Brand Template (hard delete)
 *
 * @param id of the Brand Template to be deleted
 *
 * @returns void
 */
export const deleteBrandTemplate = async (id: number): Promise<void> => {
  await BrandTemplateDao.deleteBrandTemplate(id);
};
