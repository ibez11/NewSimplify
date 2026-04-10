import { Request, Response, NextFunction } from 'express';
import { ClassErrorMiddleware, ClassMiddleware, Controller, Get } from '../overnightjs/core/lib/decorators';
import Logger from '../Logger';
import { Authentication } from '../config/passport';
import globalErrorHandler from '../globalErrorHandler';
import { AccessLevels, Modules } from '../database/models/Permission';
import { Auth } from '../middleware/authorization';
import * as DistrictService from '../services/DistrictService';
import { OK } from 'http-status-codes';
import { PaginationQueryParams } from '../typings/params/PaginationQueryParams';

const LOG = new Logger('DistrictController.ts');

@Controller('api/districts')
@ClassMiddleware(Authentication.AUTHENTICATED)
@ClassErrorMiddleware(globalErrorHandler)
export class DistrictController {
  @Get('')
  @Auth({ module: Modules.DISTRICT, accessLevel: AccessLevels.VIEW })
  private async getAll(req: Request<void, void, void, PaginationQueryParams>, res: Response, next: NextFunction) {
    try {
      const { rows, count } = await DistrictService.searchDistrictWithPagination(req.query);

      return res.status(OK).json({
        count,
        districts: rows
      });
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }
}
