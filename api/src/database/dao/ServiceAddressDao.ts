import ServiceAddress from '../models/ServiceAddress';
import { getServiceAddressModel } from '../models';
import { ServiceAddressResponseModel } from '../../typings/ResponseFormats';
import { ServiceAddressBody } from '../../typings/body/ServiceAddressBody';

export const getByClientId = async (clientId: number): Promise<{ rows: ServiceAddress[]; count: number }> => {
  const model = getServiceAddressModel();

  return model.findAndCountAll<ServiceAddress>({ where: { clientId }, order: ['id'] });
};

export const getById = async (id: number): Promise<ServiceAddress> => {
  const model = getServiceAddressModel();

  return model.findByPk<ServiceAddress>(id);
};

export const createServiceAddress = async (req: ServiceAddressBody): Promise<ServiceAddress> => {
  const model = getServiceAddressModel();

  const { country, address, floorNo, unitNo, postalCode, clientId } = req;

  return model.create<ServiceAddress>({
    country,
    address,
    floorNo,
    unitNo,
    postalCode,
    clientId
  });
};

// eslint-disable-next-line
export const bulkCreateServiceAddress = async (value: ServiceAddressResponseModel[]): Promise<any> => {
  const model = getServiceAddressModel();

  return model.bulkCreate(value, { validate: false });
};

// eslint-disable-next-line
export const bulkdeleteServiceAddressByClientId = async (clientId: number): Promise<any> => {
  const model = getServiceAddressModel();

  await model.destroy({ where: { clientId } });
};

// eslint-disable-next-line
export const deleteServiceAddressById = async (id: number): Promise<any> => {
  const model = getServiceAddressModel();

  await model.destroy({ where: { id } });
};

// eslint-disable-next-line
export const bulkdeleteServiceAddressById = async (id: number[]): Promise<any> => {
  const model = getServiceAddressModel();

  await model.destroy({ where: { id } });
};
