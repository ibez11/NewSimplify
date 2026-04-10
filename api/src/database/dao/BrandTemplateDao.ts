import { Op } from 'sequelize';
import { getBrandTemplateModel } from '../models';
import BrandTemplate from '../models/BrandTemplate';

export const getPaginated = async (offset: number, limit: number, q: string): Promise<{ rows: BrandTemplate[]; count: number }> => {
  const model = getBrandTemplateModel();

  // eslint-disable-next-line
  const where: any = {};

  if (q) {
    where[Op.or] = {
      name: {
        [Op.iLike]: `%${q}%`
      }
    };
  }

  return model.findAndCountAll<BrandTemplate>({
    where,
    offset,
    limit,
    order: [['name', 'ASC']]
  });
};

export const createBrandTemplate = async (name: string, description: string): Promise<BrandTemplate> => {
  const model = getBrandTemplateModel();

  return model.create<BrandTemplate>({
    name,
    description
  });
};

export const getBrandTemplateTemplateById = async (id: number): Promise<BrandTemplate> => {
  const model = getBrandTemplateModel();

  return model.findByPk<BrandTemplate>(id);
};

export const getBrandTemplateTemplateByName = async (name: string): Promise<BrandTemplate> => {
  const model = getBrandTemplateModel();

  return model.findOne<BrandTemplate>({ where: { name } });
};

// eslint-disable-next-line
export const deleteBrandTemplate = async (id: number): Promise<any> => {
  const model = getBrandTemplateModel();

  await model.destroy({ where: { id } });
};
