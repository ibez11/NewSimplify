import { Op } from 'sequelize';
import { getGstTemplateModel } from '../models';
import GstTemplate from '../models/GstTemplate';

export const getPaginated = async (offset: number, limit: number, q: string): Promise<{ rows: GstTemplate[]; count: number }> => {
  const model = getGstTemplateModel();

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

  where[Op.and] = { isActive: true };

  return model.findAndCountAll<GstTemplate>({
    where,
    offset,
    limit,
    order: [['isDefault', 'DESC']]
  });
};

export const getDefaultGstTemplate = async (): Promise<GstTemplate> => {
  const model = getGstTemplateModel();

  return model.findOne<GstTemplate>({ where: { isDefault: true } });
};
