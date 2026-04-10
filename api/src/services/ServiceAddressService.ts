import Logger from '../Logger';
import * as ServiceAddressDao from '../database/dao/ServiceAddressDao';
import ServiceAddress from '../database/models/ServiceAddress';
import ServiceAddressNotFoundError from '../errors/ServiceAddressNotFoundError';
import { ServiceAddressBody } from '../typings/body/ServiceAddressBody';

const LOG = new Logger('ServiceAddressService');

export const getServiceAddressById = async (id: number): Promise<ServiceAddress> => {
  LOG.debug('Getting Service Addree from Id');

  return await ServiceAddressDao.getById(id);
};

export const getServiceAddressesByClientId = async (clientId: number): Promise<{ rows: ServiceAddress[]; count: number }> => {
  LOG.debug('Getting service addresses from client id');

  return await ServiceAddressDao.getByClientId(clientId);
};

/**
 * Create a new service address in the system, based on user input
 *
 * @param country of the service address
 * @param address of the service address
 * @param floorNo of the service address
 * @param unitNo of the service address
 * @param postalCode of the service address
 * @param clientId of the service address
 *
 * @returns ServiceAddressModel
 */
export const createServiceAddress = async (req: ServiceAddressBody): Promise<ServiceAddress> => {
  LOG.debug('Creating Service Address');

  try {
    const serviceAddress = await ServiceAddressDao.createServiceAddress(req);
    return serviceAddress;
  } catch (err) {
    throw err;
  }
};

/**
 * Edit service address in the system, based on user input
 *
 * @param id of the service address
 * @param country of the service address
 * @param address of the service address
 * @param floorNo of the service address
 * @param unitNo of the service address
 * @param postalCode of the service address
 * @param clientId of the service address
 *
 * @returns ServiceAddressModel
 */

export const editServiceAddress = async (
  id: number,
  country: string,
  address: string,
  floorNo: string,
  unitNo: string,
  postalCode: string,
  clientId: number
): Promise<void> => {
  LOG.debug('Editing Service Address');

  const serviceAddress = await ServiceAddressDao.getById(id);

  if (!serviceAddress) {
    throw new ServiceAddressNotFoundError(id);
  }

  try {
    await serviceAddress.update({
      country,
      address,
      floorNo,
      unitNo,
      postalCode,
      clientId
    });
  } catch (err) {
    throw err;
  }
};

export const deleteServiceAddress = async (id: number): Promise<void> => {
  await ServiceAddressDao.deleteServiceAddressById(id);
};
