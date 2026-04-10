import Logger from '../Logger';
import ServiceItemTemplate from '../database/models/ServiceItemTemplate';
import * as ServiceItemTemplateDao from '../database/dao/ServiceItemTemplateDao';
import ServiceItemTemplateNotFoundError from '../errors/ServiceItemTemplateNotFoundError';
import DuplicatedServiceItemError from '../errors/DuplicatedServiceItemError';
import { ServiceItemTemplateResponseModel } from '../typings/ResponseFormats';

const LOG = new Logger('ServiceItemTemplateService');

/**
 * Search Service Item Template with query and optional pagination
 *
 * @param s offset for pagination search
 * @param l limit for pagination search
 * @param q query for searching
 * @param orderBy query for searching
 * @param orderType query for searching
 *
 * @returns the total counts and the data for current page
 */
export const searchServiceItemTemplatesWithPagination = (
  offset: number,
  limit?: number,
  q?: string,
  orderBy?: string,
  orderType?: string
): Promise<{ rows: ServiceItemTemplate[]; count: number }> => {
  LOG.debug('Searching Service Item Templates with Pagination');

  return ServiceItemTemplateDao.getPaginated(offset, limit, q, orderBy, orderType);
};

/**
 * Check if a service item exists
 *
 * @param serviceItemName of the required service item
 *
 * @returns boolean
 */
export const isServiceItemExistsByServiceItemName = (serviceItemName: string): Promise<ServiceItemTemplate> => {
  LOG.debug('Checking Service Item Exists By Service Item Name');

  return ServiceItemTemplateDao.countByServiceItemName(serviceItemName);
};

/**
 * Create a new service item template in the system, based on user input
 *
 * @param name of the new service item template
 * @param description of the new service item template
 * @param unitPrice of the new service item template
 *
 * @returns ServiceItemTemplatesModel
 */
export const createServiceItemTemplate = async (name: string, description: string, unitPrice: number): Promise<ServiceItemTemplate> => {
  LOG.debug('Creating Service Item Template');

  const existingServiceItemName = await isServiceItemExistsByServiceItemName(name);

  if (existingServiceItemName) {
    throw new DuplicatedServiceItemError();
  }

  try {
    return ServiceItemTemplateDao.createServiceItemTemplate(name, description, unitPrice);
  } catch (err) {
    throw err;
  }
};

export const getServiceItemTemplateFullDetailsById = async (id: number): Promise<ServiceItemTemplateResponseModel> => {
  LOG.debug('Getting Service Item Template full details from id');

  const serviceItemTemplate = await ServiceItemTemplateDao.getServiceItemTemplateById(id);

  if (!serviceItemTemplate) {
    throw new ServiceItemTemplateNotFoundError(id);
  }

  return serviceItemTemplate.toResponseFormat();
};

export const getServiceItemTemplateBySyncId = async (syncId: string): Promise<ServiceItemTemplate> => {
  LOG.debug('Getting Service Item Template full details from syncId');

  const serviceItemTemplate = await ServiceItemTemplateDao.getServiceItemTemplateBySyncId(syncId);

  if (!serviceItemTemplate) {
    throw new ServiceItemTemplateNotFoundError(syncId);
  }

  return serviceItemTemplate;
};

/**
 * To Edit a service item template in the system, based on user choose and inputed new data
 *
 * @param id of service item template
 * @param name of the service item template
 * @param description of the service item template
 * @param unitPrice of the service item template
 *
 * @returns void
 */
export const editServiceItemTemplate = async (
  id: number,
  name: string,
  description: string,
  unitPrice: number,
  idQboWithGST: number,
  IdQboWithoutGST: number
): Promise<ServiceItemTemplateResponseModel> => {
  LOG.debug('Editing Service Item Template');

  const serviceItemTemplate = await ServiceItemTemplateDao.getServiceItemTemplateById(id);

  if (!serviceItemTemplate) {
    throw new ServiceItemTemplateNotFoundError(id);
  }

  const existingServiceItemName: ServiceItemTemplateResponseModel = await isServiceItemExistsByServiceItemName(name);

  if (existingServiceItemName) {
    if (existingServiceItemName.id != id) {
      throw new DuplicatedServiceItemError();
    }
  }

  try {
    await serviceItemTemplate.update({ name, description, unitPrice, idQboWithGST, IdQboWithoutGST });

    return await getServiceItemTemplateFullDetailsById(id);
  } catch (err) {
    throw err;
  }
};

/**
 * To delete service item template (hard delete)
 *
 * @param serviceItemTemplateId of the service item template to be deleted
 *
 * @returns void
 */
export const deleteServiceItemTemplate = async (id: number): Promise<void> => {
  await ServiceItemTemplateDao.deleteServiceItemTemplateById(id);
};
