import { Op } from 'sequelize';
import { getJobNoteTemplateModel } from '../models';
import JobNoteTemplate from '../models/JobNoteTemplate';

export const getPaginated = async (offset: number, limit: number, q: string): Promise<{ rows: JobNoteTemplate[]; count: number }> => {
  const model = getJobNoteTemplateModel();

  // eslint-disable-next-line
  const where: any = {};

  if (q) {
    where[Op.or] = {
      notes: {
        [Op.iLike]: `%${q}%`
      }
    };
  }

  return model.findAndCountAll<JobNoteTemplate>({
    where,
    offset,
    limit,
    order: [['id', 'ASC']]
  });
};

export const createJobNoteTemplateTemplate = async (notes: string): Promise<JobNoteTemplate> => {
  const model = getJobNoteTemplateModel();

  return model.create<JobNoteTemplate>({
    notes
  });
};

export const getJobNoteTemplateTemplateById = async (id: number): Promise<JobNoteTemplate> => {
  const model = getJobNoteTemplateModel();

  return model.findByPk<JobNoteTemplate>(id);
};

// eslint-disable-next-line
export const deleteJobNoteTemplate = async (id: number): Promise<any> => {
  const model = getJobNoteTemplateModel();

  await model.destroy({ where: { id } });
};
