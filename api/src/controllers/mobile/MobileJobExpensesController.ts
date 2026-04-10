import { Request, Response, NextFunction } from 'express';
import { Controller, ClassMiddleware, ClassErrorMiddleware, Get, Post, Put, Delete } from '../../overnightjs/core/lib/decorators';

import { OK, NO_CONTENT } from 'http-status-codes';

import { JwtPayload } from '../../typings/jwtPayload';

import Logger from '../../Logger';
import globalErrorHandler from '../../globalErrorHandler';
import { Authentication } from '../../config/passport';
import * as JobExpensesService from '../../services/JobExpensesService';
import * as AppLogService from '../../services/AppLogService';
import { AccessLevels, Modules } from '../../database/models/Permission';
import { Auth } from '../../middleware/authorization';
import { sequelize } from '../../config/database';
import { MobileJobExpensesResponseModel } from '../../typings/ResponseFormats';

const LOG = new Logger('MobileJobExpensesController.ts');

@Controller('api/mobile/job-expenses')
@ClassMiddleware(Authentication.AUTHENTICATED)
@ClassErrorMiddleware(globalErrorHandler)
export class MobileJobExpensesController {
  // for get list of job expenses
  @Get('')
  @Auth({ module: Modules.JOB_EXPENSES, accessLevel: AccessLevels.VIEW })
  private async get(req: Request, res: Response, next: NextFunction) {
    try {
      const { jobId } = req.query;

      const jobExpenses = await JobExpensesService.getJobExpensesByJobId(Number(jobId));

      const rows: MobileJobExpensesResponseModel[] = [];

      if (jobExpenses) {
        await Promise.all(
          jobExpenses.map(row => {
            rows.push({
              id: row.id,
              jobId: row.jobId,
              serviceId: row.serviceId,
              header: row.header,
              remarks: row.remarks,
              totalExpenses: row.totalExpenses,
              expensesItems: row.JobExpensesItems ? row.JobExpensesItems.map(value => value.toResponseFormat()) : []
            });
          })
        );
      }

      return res.status(OK).json(rows);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  // for add job expenses
  @Post('')
  @Auth({ module: Modules.JOB_EXPENSES, accessLevel: AccessLevels.CREATE })
  private async add(req: Request, res: Response, next: NextFunction) {
    try {
      const { jobId, header, remarks, expensesItems } = req.body;
      const { id } = req.user as JwtPayload;

      const newJobExpenses = await JobExpensesService.createJobExpenses(jobId, header, remarks, expensesItems);
      const row: MobileJobExpensesResponseModel = {
        id: newJobExpenses.id,
        jobId: newJobExpenses.jobId,
        serviceId: newJobExpenses.serviceId,
        header: newJobExpenses.header,
        remarks: newJobExpenses.remarks,
        totalExpenses: newJobExpenses.totalExpenses,
        expensesItems: newJobExpenses.JobExpensesItems ? newJobExpenses.JobExpensesItems.map(value => value.toResponseFormat()) : []
      };

      await AppLogService.createAppLog(id, `[Mobile] Create Job Expenses : ${jobId} - ${header}`);
      return res.status(OK).json(row);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  // for update job expenses based on job expenses id
  @Put(':jobExpensesId')
  @Auth({ module: Modules.JOB_EXPENSES, accessLevel: AccessLevels.EDIT })
  private async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { jobExpensesId } = req.params;
      const { header, remarks, expensesItems } = req.body;
      const { id } = req.user as JwtPayload;

      const editedJobExpenses = await JobExpensesService.editJobExpenses(Number(jobExpensesId), header, remarks, expensesItems);
      const row: MobileJobExpensesResponseModel = {
        id: editedJobExpenses.id,
        jobId: editedJobExpenses.jobId,
        serviceId: editedJobExpenses.serviceId,
        header: editedJobExpenses.header,
        remarks: editedJobExpenses.remarks,
        totalExpenses: editedJobExpenses.totalExpenses,
        expensesItems: editedJobExpenses.JobExpensesItems ? editedJobExpenses.JobExpensesItems.map(value => value.toResponseFormat()) : []
      };

      await AppLogService.createAppLog(id, `[Mobile] Edit Job Expenses : ${editedJobExpenses.jobId} - ${header}`);
      return res.status(OK).json(row);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  // for delete job expenses based on job expenses id
  @Delete(':jobExpensesId')
  @Auth({ module: Modules.JOB_EXPENSES, accessLevel: AccessLevels.DELETE })
  private async delete(req: Request, res: Response, next: NextFunction) {
    const transaction = await sequelize.transaction();
    try {
      const { jobExpensesId } = req.params;
      const { id } = req.user as JwtPayload;
      const { jobId, header } = await JobExpensesService.getJobExpensesById(Number(jobExpensesId));

      await JobExpensesService.deleteJobExpenses(Number(jobExpensesId), transaction);
      await AppLogService.createAppLog(id, `[Mobile] Delete Job Expenses : ${jobId} - ${header}`);
      await transaction.commit();
      return res.sendStatus(NO_CONTENT);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }
}
