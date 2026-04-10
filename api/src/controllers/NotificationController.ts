import { Request, Response, NextFunction } from 'express';
import { OK } from 'http-status-codes';
import { Controller, ClassMiddleware, ClassErrorMiddleware, Get, Put } from '../overnightjs/core/lib/decorators';
// import { ValidationChain, body } from 'express-validator';
// import ValidationHandler from './ValidationHandler';

import Logger from '../Logger';
import globalErrorHandler from '../globalErrorHandler';
import { Authentication } from '../config/passport';
import * as NotificationService from '../services/NotificationService';
import * as AppLogService from '../services/AppLogService';
import { AccessLevels, Modules } from '../database/models/Permission';
import { Auth } from '../middleware/authorization';
import { JwtPayload } from '../typings/jwtPayload';

const LOG = new Logger('NotificationController.ts');

interface SearchNotificationQueryParams {
  s: number;
  l?: number;
  q?: string;
}

@Controller('api/notifications')
@ClassMiddleware(Authentication.AUTHENTICATED)
@ClassErrorMiddleware(globalErrorHandler)
export class NotificationController {
  @Get('')
  @Auth({ module: Modules.NOTIFICATIONS, accessLevel: AccessLevels.VIEW })
  private async getAll(req: Request<void, void, void, SearchNotificationQueryParams>, res: Response, next: NextFunction) {
    try {
      const { s, l, q } = req.query;

      const { rows, count } = await NotificationService.searchNotificationWithPagination(s, l, q);

      return res.status(OK).json({
        count,
        notifications: rows.map(row => row.toResponseFormat())
      });
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Put('')
  @Auth({ module: Modules.JOB_LABEL_TEMPLATES, accessLevel: AccessLevels.EDIT })
  private async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { q, status } = req.body;
      await NotificationService.editStatusNotification(q, status);

      const { id } = req.user as JwtPayload;
      await AppLogService.createAppLog(id, `Mark all notification ${status}`);
      return res.status(OK).json('SUCCESS');
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Put(':notifId')
  @Auth({ module: Modules.JOB_LABEL_TEMPLATES, accessLevel: AccessLevels.EDIT })
  private async updateById(req: Request, res: Response, next: NextFunction) {
    try {
      const { notifId } = req.params;
      const { status } = req.body;
      const { id } = req.user as JwtPayload;
      await NotificationService.editIndividualNotification(Number(notifId), status, id);

      await AppLogService.createAppLog(id, `Change status notification ${notifId} to ${status}`);
      return res.status(OK).json('SUCCESS');
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }
}
