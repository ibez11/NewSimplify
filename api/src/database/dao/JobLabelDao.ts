import { Op, QueryTypes, Transaction } from 'sequelize';
import { getJobLabelModel } from '../models';
import JobLabel from '../models/JobLabel';
import { sequelize } from '../../config/database';

export const createJobLabel = async (
  jobId: number,
  name: string,
  description: string,
  color: string,
  transaction?: Transaction
): Promise<JobLabel> => {
  const model = getJobLabelModel();

  return model.create<JobLabel>(
    {
      name,
      description,
      color,
      jobId
    },
    { transaction }
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const bulkCreateJobLabel = async (value: JobLabel[], transaction?: Transaction): Promise<any> => {
  const model = getJobLabelModel();

  return model.bulkCreate(value, { validate: false, transaction });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const bulkCreateJobLabelWithoutTransaction = async (value: JobLabel[]): Promise<any> => {
  const model = getJobLabelModel();

  return model.bulkCreate(value, { validate: false });
};

export const getJobLabelByJobId = async (jobId: number): Promise<JobLabel[]> => {
  const model = getJobLabelModel();

  return model.findAll<JobLabel>({ where: { jobId } });
};

export const deleteJobLabelByJobId = async (jobId: number[]): Promise<void> => {
  const model = getJobLabelModel();

  await model.destroy({ where: { jobId: { [Op.in]: jobId } } });
};

export const getJobLabelByServiceId = async (serviceId: number): Promise<JobLabel[]> => {
  const rows: JobLabel[] = await sequelize.query(
    `SELECT DISTINCT ON ("JobLabel"."name") * from gcool."JobLabel" where "JobLabel"."jobId" IN(
      SELECT "Job"."id" from gcool."Job" WHERE "Job"."serviceId" = ${serviceId}
    )`,
    { type: QueryTypes.SELECT }
  );

  return rows;
};
