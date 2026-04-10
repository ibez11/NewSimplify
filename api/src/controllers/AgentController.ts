import { Request, Response, NextFunction } from 'express';
import { Controller, ClassMiddleware, ClassErrorMiddleware, Get, Post, Put, Middleware } from '../overnightjs/core/lib/decorators';
import { OK } from 'http-status-codes';
import Logger from '../Logger';
import { Authentication } from '../config/passport';
import * as AgentService from '../services/AgentService';
import * as AppLogService from '../services/AppLogService';
import { AccessLevels, Modules } from '../database/models/Permission';
import { Auth } from '../middleware/authorization';
import globalErrorHandler from '../globalErrorHandler';
import { JwtPayload } from '../typings/jwtPayload';
import { PaginationQueryParams } from '../typings/params/PaginationQueryParams';
// import { body, ValidationChain } from 'express-validator';
// import ValidationHandler from './ValidationHandler';

const LOG = new Logger('AgentController.ts');

// const createAgentValidator: ValidationChain[] = [
//   body('name', 'Agent Name must not be empty')
//     .not()
//     .isEmpty()
// ];

// const editAgentValidator: ValidationChain[] = [
//   body('name', 'Agent Name must not be empty')
//     .not()
//     .isEmpty()
// ];

@Controller('api/agents')
@ClassMiddleware(Authentication.AUTHENTICATED)
@ClassErrorMiddleware(globalErrorHandler)
export class AgentController {
  @Get('')
  @Auth({ module: Modules.AGENT, accessLevel: AccessLevels.VIEW })
  private async get(req: Request<void, void, void, PaginationQueryParams>, res: Response, next: NextFunction) {
    try {
      const { rows, count } = await AgentService.searchAppWithPagination(req.query);

      return res.status(OK).json({
        agents: rows.map(row => row.toResponseFormat()),
        count
      });
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Post('')
  @Auth({ module: Modules.AGENT, accessLevel: AccessLevels.CREATE })
  private async add(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.user as JwtPayload;
      const newAgent = await AgentService.createAgent(req.body);

      await AppLogService.createAppLog(id, `Create New Agent : ${newAgent.name}`);
      return res.status(OK).json(newAgent);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Put(':agentId')
  @Auth({ module: Modules.AGENT, accessLevel: AccessLevels.EDIT })
  private async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { agentId } = req.params;
      const { id } = req.user as JwtPayload;

      const editedAgent = await AgentService.editAgent(Number(agentId), req.body);

      await AppLogService.createAppLog(id, `Edit Agent : ${editedAgent.name}`);
      return res.status(OK).json(editedAgent);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }
}
