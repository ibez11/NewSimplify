import { Request, Response, NextFunction } from 'express';
import { Controller, ClassMiddleware, ClassErrorMiddleware, Post, Put, Delete } from '../overnightjs/core/lib/decorators';

import { OK, NO_CONTENT } from 'http-status-codes';

import { JwtPayload } from '../typings/jwtPayload';

import Logger from '../Logger';
import globalErrorHandler from '../globalErrorHandler';
import { Authentication } from '../config/passport';
import * as JobExpensesItemService from '../services/JobExpensesItemService';
import * as AppLogService from '../services/AppLogService';
import { AccessLevels, Modules } from '../database/models/Permission';
import { Auth } from '../middleware/authorization';
import { sequelize } from '../config/database';

const LOG = new Logger('JobExpensesItemController.ts');

@Controller('api/job-expenses-item')
@ClassMiddleware(Authentication.AUTHENTICATED)
@ClassErrorMiddleware(globalErrorHandler)
export class JobExpensesItemController {
  @Post('')
  @Auth({ module: Modules.JOB_EXPENSES, accessLevel: AccessLevels.CREATE })
  private async add(req: Request, res: Response, next: NextFunction) {
    try {
      const { jobExpensesId, itemName, remarks, price } = req.body;
      const { id } = req.user as JwtPayload;

      const newJobExpensesItem = await JobExpensesItemService.createJobExpensesItem(jobExpensesId, itemName, remarks, price);

      await AppLogService.createAppLog(id, `Create Job Expenses Item: ${jobExpensesId} - ${itemName}`);
      return res.status(OK).json(newJobExpensesItem);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Put(':jobExpensesItemId')
  @Auth({ module: Modules.JOB_EXPENSES, accessLevel: AccessLevels.EDIT })
  private async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { jobExpensesItemId } = req.params;
      const { itemName, remarks, price } = req.body;
      const { id } = req.user as JwtPayload;

      const editedJobExpensesItem = await JobExpensesItemService.editJobExpensesItem(Number(jobExpensesItemId), itemName, remarks, price);

      await AppLogService.createAppLog(id, `Edit Job Expenses : ${editedJobExpensesItem.id} - ${itemName}`);
      return res.status(OK).json(editedJobExpensesItem);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Delete(':jobExpensesItemId')
  @Auth({ module: Modules.JOB_EXPENSES, accessLevel: AccessLevels.DELETE })
  private async delete(req: Request, res: Response, next: NextFunction) {
    const transaction = await sequelize.transaction();
    try {
      const { jobExpensesItemId } = req.params;
      const { id } = req.user as JwtPayload;
      const { itemName } = await JobExpensesItemService.getJobExpensesItemById(Number(jobExpensesItemId));

      await JobExpensesItemService.deleteJobExpensesItemById(Number(jobExpensesItemId), transaction);
      await AppLogService.createAppLog(id, `Delete Job Expenses : ${jobExpensesItemId} - ${itemName}`);
      await transaction.commit();
      return res.sendStatus(NO_CONTENT);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }
}
