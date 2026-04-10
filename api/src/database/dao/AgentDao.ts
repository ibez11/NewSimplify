import { Op, WhereOptions } from 'sequelize';
import Agent from '../models/Agent';
import { getAgentModel } from '../models';
import { PaginationQueryParams } from '../../typings/params/PaginationQueryParams';
import { AgentBody } from '../../typings/body/AgentBody';

export const getPaginated = async (req?: PaginationQueryParams): Promise<{ rows: Agent[]; count: number }> => {
  const model = getAgentModel();
  let where: WhereOptions = {};

  const query = req.q;
  const limit = req.l;
  const offset = req.s;

  if (query) {
    where = {
      [Op.or]: {
        name: { [Op.iLike]: `%${query}%` }
      }
    };
  }

  return model.findAndCountAll<Agent>({
    where,
    order: [['name', 'ASC']],
    limit,
    offset
  });
};

export const createAgent = async (req: AgentBody): Promise<Agent> => {
  const model = getAgentModel();
  const { name, description } = req;

  return await model.create<Agent>({ name, description });
};

export const getAgentById = async (id: number): Promise<Agent> => {
  const model = getAgentModel();

  return model.findOne<Agent>({ where: { id } });
};

export const getByAgentName = async (name: string): Promise<Agent> => {
  const model = getAgentModel();

  return model.findOne<Agent>({ where: { name } });
};
