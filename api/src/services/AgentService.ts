import Logger from '../Logger';
import Agent from '../database/models/Agent';
import * as AgentDao from '../database/dao/AgentDao';
import DuplicatedAgentError from '../errors/DuplicatedAgentError';
import AgentNotFoundError from '../errors/AgentNotFoundError';
import { AgentResponseModel } from '../typings/ResponseFormats';
import { PaginationQueryParams } from '../typings/params/PaginationQueryParams';
import { AgentBody } from '../typings/body/AgentBody';

const LOG = new Logger('AgentService.ts');

/**
 * Search agent with query and optional pagination
 *
 * @param s offset for pagination searc
 * @param l limit for pagination search
 * @param q query for searching
 *
 * @returns the total counts and the data for current page
 */
export const searchAppWithPagination = async (req?: PaginationQueryParams): Promise<{ rows: Agent[]; count: number }> => {
  LOG.debug('Searching Agent with Pagination');

  const { rows, count } = await AgentDao.getPaginated(req);

  return { rows, count };
};

/**
 * Check if a agent exists
 *
 * @param agentName of the required agent
 *
 * @returns boolean
 */
export const isAgentExistsByAgentName = async (agentName: string): Promise<boolean> => {
  return !!(await AgentDao.getByAgentName(agentName));
};

/**
 * Create a new agent template in the system, based on user input
 *
 * @param name of the new agent item template
 * @param description of the new agent item template
 *
 * @returns AgentModel
 */
export const createAgent = async (req: AgentBody): Promise<Agent> => {
  LOG.debug('Creating Agent Template');

  const existingAgentName = await isAgentExistsByAgentName(req.name);

  if (existingAgentName) {
    throw new DuplicatedAgentError();
  }
  try {
    const agent = await AgentDao.createAgent(req);

    return agent;
  } catch (err) {
    throw err;
  }
};

/**
 * To Edit a new agent template in the system, based on user input
 *
 * @param name of the new agent item template
 * @param description of the new agent item template
 *
 * @returns AgentModel
 */
export const editAgent = async (id: number, req: AgentBody): Promise<Agent> => {
  LOG.debug('Editing Agent Template');

  const agent = await AgentDao.getAgentById(id);

  if (!agent) {
    throw new AgentNotFoundError(id);
  }

  const { name, description } = req;

  const existingAgentName: AgentResponseModel = await AgentDao.getByAgentName(name);

  if (existingAgentName) {
    if (existingAgentName.id != id) {
      throw new DuplicatedAgentError();
    }
  }

  try {
    return agent.update({ name, description });
  } catch (err) {
    throw err;
  }
};
