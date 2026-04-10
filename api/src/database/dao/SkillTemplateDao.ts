import { Op } from 'sequelize';
import { getSkillTemplateModel } from '../models';
import SkillTemplate from '../models/SkillTemplate';

export const getPaginated = async (offset: number, limit: number, q: string): Promise<{ rows: SkillTemplate[]; count: number }> => {
  const model = getSkillTemplateModel();

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

  return model.findAndCountAll<SkillTemplate>({
    where,
    offset,
    limit,
    order: [['name', 'ASC']]
  });
};

export const createSkillTemplate = async (name: string, description: string): Promise<SkillTemplate> => {
  const model = getSkillTemplateModel();

  return model.create<SkillTemplate>({
    name,
    description
  });
};

export const getSkillTemplateById = async (id: number): Promise<SkillTemplate> => {
  const model = getSkillTemplateModel();

  return model.findByPk<SkillTemplate>(id);
};

// eslint-disable-next-line
export const deleteSkillTemplate = async (id: number): Promise<any> => {
  const model = getSkillTemplateModel();

  await model.destroy({ where: { id } });
};
