import { Request, Response, NextFunction } from 'express';
import { Controller, ClassMiddleware, Get, ClassErrorMiddleware } from '../overnightjs/core/lib/decorators';
import { OK } from 'http-status-codes';

import Logger from '../Logger';
import { Authentication } from '../config/passport';
import * as AppLogService from '../services/AppLogService';
import globalErrorHandler from '../globalErrorHandler';
import { PaginationQueryParams } from '../typings/params/PaginationQueryParams';

const LOG = new Logger('AppLogController.ts');

@Controller('api/applogs')
@ClassMiddleware(Authentication.AUTHENTICATED)
@ClassErrorMiddleware(globalErrorHandler)
export class AppLogController {
  @Get('')
  private async get(req: Request<void, void, void, PaginationQueryParams>, res: Response, next: NextFunction) {
    try {
      const { rows, count } = await AppLogService.searchAppWithPagination(req.query);

      return res.status(OK).json({
        count,
        appLogs: rows
      });
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }
}
