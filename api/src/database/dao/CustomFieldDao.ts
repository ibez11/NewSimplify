import CustomField from '../models/CustomField';
import { getCustomFieldModel } from '../models';
import { CustomFieldResponseModel } from '../../typings/ResponseFormats';
import { Transaction } from 'sequelize';

// eslint-disable-next-line
export const bulkCreateCustomField = async (value: CustomFieldResponseModel[], transaction?: Transaction): Promise<any> => {
  const model = getCustomFieldModel();

  return model.bulkCreate(value, { validate: false, transaction });
};

export const getCustomFieldByServiceId = async (serviceId: number): Promise<CustomField> => {
  const model = getCustomFieldModel();

  return model.findOne<CustomField>({ where: { serviceId } });
};

// eslint-disable-next-line
export const deleteCustomFieldByServiceId = async (serviceId: number): Promise<any> => {
  const model = getCustomFieldModel();

  await model.destroy({ where: { serviceId } });
};
