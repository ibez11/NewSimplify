import { Op } from 'sequelize';
import { getServiceTemplateModel } from '../models';
import ServiceTemplate from '../models/ServiceTemplate';

export const getPaginated = async (offset: number, limit: number, q: string): Promise<{ rows: ServiceTemplate[]; count: number }> => {
  const model = getServiceTemplateModel();

  // eslint-disable-next-line
  const where: any = {};

  if (q) {
    where[Op.or] = {
      name: {
        [Op.iLike]: `%${q}%`
      },
      description: {
        [Op.iLike]: `%${q}%`
      }
    };
  }

  return model.findAndCountAll<ServiceTemplate>({
    where,
    offset,
    limit,
    order: [['name', 'ASC']]
  });
};

export const createServiceTemplate = async (name: string, description: string, termCondition: string): Promise<ServiceTemplate> => {
  const model = getServiceTemplateModel();

  return model.create<ServiceTemplate>({
    name,
    description,
    termCondition
  });
};

export const getServiceTemplateById = async (id: number): Promise<ServiceTemplate> => {
  const model = getServiceTemplateModel();

  return model.findByPk<ServiceTemplate>(id);
};

// eslint-disable-next-line
export const deleteServiceTemplate = async (id: number): Promise<any> => {
  const model = getServiceTemplateModel();

  await model.destroy({ where: { id } });
};
