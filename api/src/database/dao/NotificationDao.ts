import { Op, QueryTypes } from 'sequelize';
import { sequelize } from '../../config/database';
import { getNotificationModel } from '../models';
import Notification from '../models/Notification';
import { format, subDays } from 'date-fns';

export const getPaginated = async (offset?: number, limit?: number, q?: string): Promise<{ rows: Notification[]; count: number }> => {
  const model = getNotificationModel();

  // eslint-disable-next-line
  const where: any = {};

  where[Op.and] = {
    updatedAt: {
      [Op.gte]: `${format(subDays(new Date(), 7), 'yyyy-MM-dd')} 00:00:00`,
      [Op.lte]: `${format(new Date(), 'yyyy-MM-dd')} 23:59:59`
    }
  };

  if (q) {
    where[Op.or] = {
      title: {
        [Op.iLike]: `%${q}%`
      },
      description: {
        [Op.iLike]: `%${q}%`
      },
      status: {
        [Op.iLike]: `%${q}%`
      }
    };
  }

  return model.findAndCountAll<Notification>({
    where,
    offset,
    limit,
    order: [['id', 'DESC']]
  });
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const createNotification = async (tenantKey: string, title: string, description: string, type: string, jobId: number) => {
  return sequelize.query(
    `INSERT INTO "${tenantKey}"."Notification" ("title", "description", "type", "status", "jobId", "createdAt", "updatedAt") VALUES ('${title}', '${description}', '${type}', 'unread', ${jobId}, now(), now()) RETURNING id;`,
    {
      type: QueryTypes.INSERT
    }
  );
};

export const getNotificationById = async (id: number): Promise<Notification> => {
  const model = getNotificationModel();

  return model.findByPk<Notification>(id);
};

export const getNotificationByJobId = async (jobId: number): Promise<Notification[]> => {
  const model = getNotificationModel();

  return model.findAll<Notification>({ where: { jobId } });
};

export const deleteNotificationById = async (id: number): Promise<void> => {
  const model = getNotificationModel();

  await model.destroy({ where: { id } });
};

export const updateStatusNotification = async (q: string, status: string): Promise<void> => {
  const model = getNotificationModel();

  await model.update({ status }, { where: { status: q } });
};
