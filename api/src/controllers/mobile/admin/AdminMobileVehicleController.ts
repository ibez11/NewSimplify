import { Request, Response, NextFunction } from 'express';
import { Controller, ClassMiddleware, Get, ClassErrorMiddleware } from '../../../overnightjs/core/lib/decorators';
import { OK } from 'http-status-codes';

import Logger from '../../../Logger';
import { Authentication } from '../../../config/passport';
import * as VehicleService from '../../../services/VehicleService';
import { AccessLevels, Modules } from '../../../database/models/Permission';
import { Auth } from '../../../middleware/authorization';
import globalErrorHandler from '../../../globalErrorHandler';
import _ from 'lodash';

const LOG = new Logger('AdminMobileVehicleController.ts');

@Controller('api/mobile/admin/vehicles')
@ClassMiddleware(Authentication.AUTHENTICATED)
@ClassErrorMiddleware(globalErrorHandler)
export class AdminMobileVehicleController {
  @Get('active')
  @Auth({ module: Modules.VEHICLES, accessLevel: AccessLevels.VIEW })
  private async get(req: Request, res: Response, next: NextFunction) {
    try {
      const vehicles = await VehicleService.getActiveVehicle();

      return res.status(OK).json(vehicles && vehicles.length > 1 ? vehicles.map(val => _.pick(val, ['id', 'carplateNumber'])) : []);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }
}
