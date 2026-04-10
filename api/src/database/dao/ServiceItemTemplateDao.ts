import { Op, cast, col, where as sequelizeWhere } from 'sequelize';

import { getServiceItemTemplateModel } from '../models';
import ServiceItemTemplate from '../models/ServiceItemTemplate';

export const getPaginated = async (
  offset: number,
  limit: number,
  q: string,
  orderBy?: string,
  orderType?: string
): Promise<{ rows: ServiceItemTemplate[]; count: number }> => {
  const model = getServiceItemTemplateModel();

  // eslint-disable-next-line
  const where: any = {};

  if (q) {
    where[Op.or] = {
      name: {
        [Op.iLike]: `%${q}%`
      },
      description: {
        [Op.iLike]: `%${q}%`
      },
      unitPrice: sequelizeWhere(cast(col('unitPrice'), 'TEXT'), { [Op.iLike]: `%${q}%` })
    };
  }

  return model.findAndCountAll<ServiceItemTemplate>({
    where,
    offset,
    limit,
    order: [[orderBy || 'name', orderType || 'ASC']]
  });
};

export const createServiceItemTemplate = async (name: string, description: string, unitPrice: number): Promise<ServiceItemTemplate> => {
  const model = getServiceItemTemplateModel();

  return model.create<ServiceItemTemplate>({
    name,
    description,
    unitPrice
  });
};

export const getServiceItemTemplateById = async (id: number): Promise<ServiceItemTemplate> => {
  const model = getServiceItemTemplateModel();

  return model.findByPk<ServiceItemTemplate>(id);
};

export const getServiceItemTemplateBySyncId = async (syncId: string): Promise<ServiceItemTemplate> => {
  const model = getServiceItemTemplateModel();

  return model.findOne<ServiceItemTemplate>({ where: { idQboWithGST: syncId } });
};

// eslint-disable-next-line
export const deleteServiceItemTemplateById = async (id: number): Promise<any> => {
  const model = getServiceItemTemplateModel();

  await model.destroy({ where: { id } });
};

export const countByServiceItemName = async (name: string): Promise<ServiceItemTemplate> => {
  const model = getServiceItemTemplateModel();

  return model.findOne<ServiceItemTemplate>({ where: { name } });
};
