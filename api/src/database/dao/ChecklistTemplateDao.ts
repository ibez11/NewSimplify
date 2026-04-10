import { Op, Transaction } from 'sequelize';
import { getChecklistTemplateModel, getChecklistItemTemplateModel } from '../models';
import ChecklistTemplate from '../models/ChecklistTemplate';

export const getPaginated = async (offset: number, limit: number, q: string): Promise<{ rows: ChecklistTemplate[]; count: number }> => {
  const model = getChecklistTemplateModel();
  const modelItems = getChecklistItemTemplateModel();

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

  const include = [{ model: modelItems, required: false, as: 'ChecklistItems', attributes: ['id', 'name'] }];

  return model.findAndCountAll<ChecklistTemplate>({
    where,
    offset,
    limit,
    include,
    order: [['id', 'DESC']],
    distinct: true,
    col: 'id'
  });
};

export const createChecklistTemplate = async (name: string, description: string, transaction: Transaction): Promise<ChecklistTemplate> => {
  const model = getChecklistTemplateModel();

  return model.create<ChecklistTemplate>(
    {
      name,
      description
    },
    { transaction }
  );
};

export const createChecklistTemplateWithoutTransaction = async (name: string, description: string): Promise<ChecklistTemplate> => {
  const model = getChecklistTemplateModel();

  return model.create<ChecklistTemplate>({
    name,
    description
  });
};

export const getChecklistTemplateById = async (id: number): Promise<ChecklistTemplate> => {
  const model = getChecklistTemplateModel();
  const modelItems = getChecklistItemTemplateModel();

  const include = [{ model: modelItems, required: false, as: 'ChecklistItems', attributes: ['id', 'name'] }];

  return model.findByPk<ChecklistTemplate>(id, { include });
};

export const deleteChecklistTemplate = async (id: number): Promise<void> => {
  const model = getChecklistTemplateModel();

  await model.destroy({ where: { id } });
};

export const countByChecklistName = async (name: string): Promise<ChecklistTemplate> => {
  const model = getChecklistTemplateModel();

  return model.findOne<ChecklistTemplate>({ where: { name } });
};
