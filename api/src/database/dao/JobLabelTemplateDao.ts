import { Op } from 'sequelize';
import { getJobLabelTemplateModel } from '../models';
import JobLabelTemplate from '../models/JobLabelTemplate';

export const getPaginated = async (offset: number, limit: number, q: string): Promise<{ rows: JobLabelTemplate[]; count: number }> => {
  const model = getJobLabelTemplateModel();

  // eslint-disable-next-line
  const where: any = {};

  if (q) {
    where[Op.or] = {
      name: {
        [Op.iLike]: `%${q}%`
      }
    };
  }

  return model.findAndCountAll<JobLabelTemplate>({
    where,
    offset,
    limit,
    order: [['id', 'ASC']]
  });
};

export const createJobLabelTemplateTemplate = async (name: string, description: string, color: string): Promise<JobLabelTemplate> => {
  const model = getJobLabelTemplateModel();

  return model.create<JobLabelTemplate>({
    name,
    description,
    color
  });
};

export const getJobLabelTemplateTemplateById = async (id: number): Promise<JobLabelTemplate> => {
  const model = getJobLabelTemplateModel();

  return model.findByPk<JobLabelTemplate>(id);
};

// eslint-disable-next-line
export const deleteJobLabelTemplate = async (id: number): Promise<any> => {
  const model = getJobLabelTemplateModel();

  await model.destroy({ where: { id } });
};
