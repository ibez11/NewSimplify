import Logger from '../Logger';
import ServiceTemplate from '../database/models/ServiceTemplate';
import * as ServiceTemplateDao from '../database/dao/ServiceTemplateDao';
import ServiceTemplateNotFoundError from '../errors/ServiceTemplateNotFoundError';
import { ServiceTemplateResponseModel } from '../typings/ResponseFormats';

const LOG = new Logger('ServiceTemplateService');

/**
 * Search Service Template with query and optional pagination
 *
 * @param s offset for pagination search
 * @param l limit for pagination search
 * @param q query for searching
 *
 * @returns the total counts and the data for current page
 */
export const searchServiceTemplatesWithPagination = async (
  offset: number,
  limit?: number,
  q?: string
): Promise<{ rows: ServiceTemplate[]; count: number }> => {
  LOG.debug('Searching Service Templates with Pagination');

  return await ServiceTemplateDao.getPaginated(offset, limit, q);
};

/**
 * Create a new service template in the system, based on user input
 *
 * @param name of the new service template
 * @param description of the new service template
 * @param termCondition of the new service template
 *
 * @returns ServiceTemplatesModel
 */
export const createServiceTemplate = async (name: string, description: string, termCondition: string): Promise<ServiceTemplate> => {
  LOG.debug('Creating Service Template');

  try {
    return ServiceTemplateDao.createServiceTemplate(name, description, termCondition);
  } catch (err) {
    throw err;
  }
};

export const getServiceTemplateFullDetailsById = async (id: number): Promise<ServiceTemplateResponseModel> => {
  LOG.debug('Getting Service Template full details from id');

  const serviceTemplate = await ServiceTemplateDao.getServiceTemplateById(id);

  if (!serviceTemplate) {
    throw new ServiceTemplateNotFoundError(id);
  }

  return serviceTemplate.toResponseFormat();
};

/**
 * To Edit a service template in the system, based on user choose and inputed new data
 *
 * @param id of service template
 * @param name of the service template
 * @param description of the service template
 * @param termCondition of the service template
 *
 * @returns void
 */
export const editServiceTemplate = async (id: number, name: string, description: string, termCondition: string): Promise<ServiceTemplate> => {
  LOG.debug('Editing Service emplate');

  const serviceTemplate = await ServiceTemplateDao.getServiceTemplateById(id);

  if (!serviceTemplate) {
    throw new ServiceTemplateNotFoundError(id);
  }

  try {
    return await serviceTemplate.update({ name, description, termCondition });
  } catch (err) {
    throw err;
  }
};

/**
 * To delete service template (hard delete)
 *
 * @param serviceTemplateId of the service template to be deleted
 *
 * @returns void
 */
export const deleteServiceTemplate = async (id: number): Promise<void> => {
  await ServiceTemplateDao.deleteServiceTemplate(id);
};
