import { Request, Response, NextFunction } from 'express';
import { Controller, ClassMiddleware, ClassErrorMiddleware, Get, Post, Put, Delete } from '../overnightjs/core/lib/decorators';

import { OK, NO_CONTENT } from 'http-status-codes';

import { JwtPayload } from '../typings/jwtPayload';

import Logger from '../Logger';
import globalErrorHandler from '../globalErrorHandler';
import { Authentication } from '../config/passport';
import * as JobExpensesService from '../services/JobExpensesService';
import * as AppLogService from '../services/AppLogService';
import { AccessLevels, Modules } from '../database/models/Permission';
import { Auth } from '../middleware/authorization';
import { sequelize } from '../config/database';

const LOG = new Logger('JobExpensesController.ts');

@Controller('api/job-expenses')
@ClassMiddleware(Authentication.AUTHENTICATED)
@ClassErrorMiddleware(globalErrorHandler)
export class JobExpensesController {
  @Get('')
  @Auth({ module: Modules.JOB_EXPENSES, accessLevel: AccessLevels.VIEW })
  private async get(req: Request, res: Response, next: NextFunction) {
    try {
      const { jobId } = req.query;

      const jobExpenses = await JobExpensesService.getJobExpensesByJobId(Number(jobId));

      return res.status(OK).json({ jobExpenses });
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Post('')
  @Auth({ module: Modules.JOB_EXPENSES, accessLevel: AccessLevels.CREATE })
  private async add(req: Request, res: Response, next: NextFunction) {
    try {
      const { jobId, header, remarks, expensesItems } = req.body;
      const { id } = req.user as JwtPayload;

      const newJobExpenses = await JobExpensesService.createJobExpenses(jobId, header, remarks, expensesItems);

      await AppLogService.createAppLog(id, `Create Job Expenses : ${jobId} - ${header}`);
      return res.status(OK).json(newJobExpenses);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Put(':jobExpensesId')
  @Auth({ module: Modules.JOB_EXPENSES, accessLevel: AccessLevels.EDIT })
  private async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { jobExpensesId } = req.params;
      const { header, remarks, expensesItems } = req.body;
      const { id } = req.user as JwtPayload;

      const editedJobExpenses = await JobExpensesService.editJobExpenses(Number(jobExpensesId), header, remarks, expensesItems);

      await AppLogService.createAppLog(id, `Edit Job Expenses : ${editedJobExpenses.jobId} - ${header}`);
      return res.status(OK).json(editedJobExpenses);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Delete(':jobExpensesId')
  @Auth({ module: Modules.JOB_EXPENSES, accessLevel: AccessLevels.DELETE })
  private async delete(req: Request, res: Response, next: NextFunction) {
    const transaction = await sequelize.transaction();
    try {
      const { jobExpensesId } = req.params;
      const { id } = req.user as JwtPayload;
      const { jobId, header } = await JobExpensesService.getJobExpensesById(Number(jobExpensesId));

      await JobExpensesService.deleteJobExpenses(Number(jobExpensesId), transaction);
      await AppLogService.createAppLog(id, `Delete Job Expenses : ${jobId} - ${header}`);
      await transaction.commit();
      return res.sendStatus(NO_CONTENT);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }
}
