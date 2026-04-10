import { Transaction } from 'sequelize';
import { NewChecklistItemTemplateResponseModel } from '../../typings/ResponseFormats';
import { getChecklistItemTemplateModel } from '../models';
import ChecklistItemTemplate from '../models/ChecklistItemTemplate';

export const getById = async (id: number): Promise<ChecklistItemTemplate> => {
  const model = getChecklistItemTemplateModel();

  return model.findByPk<ChecklistItemTemplate>(id);
};

export const getItemsTemplateByChecklistId = async (checklistId: number): Promise<{ rows: ChecklistItemTemplate[]; count: number }> => {
  const model = getChecklistItemTemplateModel();

  return model.findAndCountAll<ChecklistItemTemplate>({ where: { checklistId }, order: [['id', 'asc']] });
};

export const createChecklistItemTemplate = async (checklistId: number, name: string, transaction: Transaction): Promise<ChecklistItemTemplate> => {
  const model = getChecklistItemTemplateModel();

  return model.create<ChecklistItemTemplate>({ name, checklistId }, { transaction });
};

export const bulkCreateChecklistItemTemplate = async (value: NewChecklistItemTemplateResponseModel[]): Promise<ChecklistItemTemplate[]> => {
  const model = getChecklistItemTemplateModel();

  return model.bulkCreate<ChecklistItemTemplate>(value, { validate: false });
};

// eslint-disable-next-line
export const deleteItemByChecklistId = async (checklistId: number, transaction: Transaction): Promise<any> => {
  const model = getChecklistItemTemplateModel();

  return model.destroy({ where: { checklistId }, transaction });
};

// eslint-disable-next-line
export const deleteItemByChecklistIdWithouTransaction = async (checklistId: number): Promise<any> => {
  const model = getChecklistItemTemplateModel();

  return model.destroy({ where: { checklistId } });
};
