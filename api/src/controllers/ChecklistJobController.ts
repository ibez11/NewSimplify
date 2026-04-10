import { Request, Response, NextFunction } from 'express';
import { Controller, ClassMiddleware, ClassErrorMiddleware, Get, Post, Put, Delete } from '../overnightjs/core/lib/decorators';

import { OK, NO_CONTENT } from 'http-status-codes';
// import { ValidationChain, body } from 'express-validator';
// import ValidationHandler from './ValidationHandler';

import { JwtPayload } from '../typings/jwtPayload';

import Logger from '../Logger';
import globalErrorHandler from '../globalErrorHandler';
import { Authentication } from '../config/passport';
import * as ChecklistJobService from '../services/ChecklistJobService';
import * as AppLogService from '../services/AppLogService';
import { AccessLevels, Modules } from '../database/models/Permission';
import { Auth } from '../middleware/authorization';
import { sequelize } from '../config/database';

const LOG = new Logger('ChecklistJobController.ts');

// const createChecklistJobValidator: ValidationChain[] = [
//   body('jobId', 'Job id must not be empty')
//     .not()
//     .isEmpty()
// ];

@Controller('api/checklist-jobs')
@ClassMiddleware(Authentication.AUTHENTICATED)
@ClassErrorMiddleware(globalErrorHandler)
export class ChecklistJobController {
  @Get('')
  @Auth({ module: Modules.JOBS, accessLevel: AccessLevels.VIEW })
  private async get(req: Request, res: Response, next: NextFunction) {
    try {
      const { jobId } = req.query;

      const checklistJobs = await ChecklistJobService.getChecklistJobByJobId(Number(jobId));

      return res.status(OK).json({ checklistJobs });
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Post('')
  @Auth({ module: Modules.JOBS, accessLevel: AccessLevels.CREATE })
  private async add(req: Request, res: Response, next: NextFunction) {
    try {
      const { jobId, name, description, remarks, ChecklistItems } = req.body;
      const { id } = req.user as JwtPayload;

      const newChecklistJob = await ChecklistJobService.createChecklistJob(jobId, name, description, remarks, ChecklistItems);

      await AppLogService.createAppLog(id, `Create Checklist Job : ${jobId} - ${name}`);
      return res.status(OK).json(newChecklistJob);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Put(':checklistJobId')
  @Auth({ module: Modules.JOBS, accessLevel: AccessLevels.EDIT })
  private async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { checklistJobId } = req.params;
      const { name, description, remarks, ChecklistItems } = req.body;
      const { id } = req.user as JwtPayload;

      const editedChecklistJob = await ChecklistJobService.editChecklistJob(Number(checklistJobId), name, description, remarks, ChecklistItems);

      await AppLogService.createAppLog(id, `Edit Checklist Job : ${editedChecklistJob.jobId} - ${name}`);
      return res.status(OK).json(editedChecklistJob);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Delete(':checklistJobId')
  @Auth({ module: Modules.JOBS, accessLevel: AccessLevels.DELETE })
  private async delete(req: Request, res: Response, next: NextFunction) {
    const transaction = await sequelize.transaction();
    try {
      const { checklistJobId } = req.params;
      const { id } = req.user as JwtPayload;
      const { jobId, name } = await ChecklistJobService.getChecklistJobById(Number(checklistJobId));

      await ChecklistJobService.deleteChecklistJob(Number(checklistJobId), transaction);
      await AppLogService.createAppLog(id, `Delete Checklist Job : ${jobId} - ${name}`);
      await transaction.commit();
      return res.sendStatus(NO_CONTENT);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }
}
