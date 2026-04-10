import ContactPerson from '../models/ContactPerson';
import { getContactPersonModel } from '../models';
import { ContactPersonResponseModel } from '../../typings/ResponseFormats';

export const getByClientId = async (clientId: number): Promise<{ rows: ContactPerson[]; count: number }> => {
  const model = getContactPersonModel();

  return model.findAndCountAll<ContactPerson>({ where: { clientId }, order: ['id'] });
};

export const getById = async (id: number): Promise<ContactPerson> => {
  const model = getContactPersonModel();

  return model.findByPk<ContactPerson>(id);
};

export const createContactPerson = async (
  clientId: number,
  contactPerson: string,
  countryCode: string,
  contactNumber: string,
  contactEmail: string,
  isMain: boolean,
  country?: string
): Promise<ContactPerson> => {
  const model = getContactPersonModel();

  return model.create<ContactPerson>({
    contactPerson,
    countryCode: countryCode || '+65',
    contactNumber,
    contactEmail,
    clientId,
    isMain,
    country
  });
};

// eslint-disable-next-line
export const bulkCreateContactPerson = async (value: ContactPersonResponseModel[]): Promise<any> => {
  const model = getContactPersonModel();

  return model.bulkCreate(value, { validate: false });
};

// eslint-disable-next-line
export const bulkdeleteContactPersonByClientId = async (clientId: number): Promise<any> => {
  const model = getContactPersonModel();

  await model.destroy({ where: { clientId } });
};

// eslint-disable-next-line
export const deleteContactPersonById = async (id: number): Promise<any> => {
  const model = getContactPersonModel();

  await model.destroy({ where: { id } });
};
