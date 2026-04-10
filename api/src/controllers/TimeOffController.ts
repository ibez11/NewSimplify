import { ClassErrorMiddleware, ClassMiddleware, Controller, Delete, Get, Post, Put } from '../overnightjs/core/lib/decorators';
import Logger from '../Logger';
import { Authentication } from '../config/passport';
import globalErrorHandler from '../globalErrorHandler';
import { Auth } from '../middleware/authorization';
import { AccessLevels, Modules } from '../database/models/Permission';
import { NextFunction, Request, Response } from 'express';
import TimeOffQueryParams from '../typings/params/TimeOffQueryParams';
import * as TimeOffService from '../services/TimeOffService';
import { NO_CONTENT, OK } from 'http-status-codes';
import { JwtPayload } from '../typings/jwtPayload';
import * as AppLogService from '../services/AppLogService';
import { sequelize } from '../config/database';

const LOG = new Logger('TimeOffController.ts');

@Controller('api/timeoff')
@ClassMiddleware(Authentication.AUTHENTICATED)
@ClassErrorMiddleware(globalErrorHandler)
export class TimeOffController {
  @Get('')
  @Auth({ module: Modules.TIMEOFF, accessLevel: AccessLevels.VIEW })
  private async getAll(req: Request<void, void, void, TimeOffQueryParams>, res: Response, next: NextFunction) {
    try {
      const rows = await TimeOffService.searchTimeOffsWithPagination(req.query);
      return res.status(OK).json({ timeOff: rows });
    } catch (error) {
      LOG.error(error);
      return next(error);
    }
  }

  @Get(':id')
  @Auth({ module: Modules.TIMEOFF, accessLevel: AccessLevels.VIEW })
  private async get(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const timeOff = await TimeOffService.getTimeOffById(Number(id));
      return res.status(OK).json({
        timeOff
      });
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Post('')
  @Auth({ module: Modules.TIMEOFF, accessLevel: AccessLevels.CREATE })
  private async add(req: Request, res: Response, next: NextFunction) {
    try {
      const newTimeOff = await TimeOffService.createTimeOff(req.body);

      const { id } = req.user as JwtPayload;
      await AppLogService.createAppLog(id, `Create Time Off : ${newTimeOff.map(val => val.id)}`);

      return res.status(OK).json(newTimeOff[0]);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Put(':timeOffId')
  @Auth({ module: Modules.TIMEOFF, accessLevel: AccessLevels.EDIT })
  private async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { timeOffId } = req.params;
      const editedTimeOff = await TimeOffService.editTimeOff(Number(timeOffId), req.body);

      const { id } = req.user as JwtPayload;
      await AppLogService.createAppLog(id, `Edit Time Off : ${timeOffId}`);
      return res.status(OK).json(editedTimeOff);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Delete(':timeOffId')
  @Auth({ module: Modules.TIMEOFF, accessLevel: AccessLevels.DELETE })
  private async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { timeOffId } = req.params;
      const deletedTimeOff = await TimeOffService.getTimeOffById(Number(timeOffId));

      await TimeOffService.deleteTimeOff(Number(timeOffId));

      const { id } = req.user as JwtPayload;
      await AppLogService.createAppLog(id, `Delete Time Off : ${deletedTimeOff[0].id}`);
      return res.sendStatus(NO_CONTENT);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }
}
