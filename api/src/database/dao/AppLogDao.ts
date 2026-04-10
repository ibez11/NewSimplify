import { Op, WhereOptions } from 'sequelize';
import AppLog from '../models/AppLog';
import { getAppLogModel } from '../models';
import { PaginationQueryParams } from '../../typings/params/PaginationQueryParams';

export const getPaginated = async (req: PaginationQueryParams): Promise<{ rows: AppLog[]; count: number }> => {
  const model = getAppLogModel();
  let where: WhereOptions = {};

  const limit = req.l;
  const offset = req.s;
  const query = req.q;

  if (query) {
    where = {
      [Op.or]: {
        user: { [Op.iLike]: `%${query}%` },
        description: { [Op.iLike]: `%${query}%` }
      }
    };
  }

  return model.findAndCountAll<AppLog>({
    where,
    order: [['createdAt', 'DESC']],
    limit,
    offset
  });
};

export const createAppLog = async (user: string, description: string): Promise<AppLog> => {
  const model = getAppLogModel();

  return await model.create<AppLog>({ user, description });
};
