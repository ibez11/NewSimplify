import { Request, Response, NextFunction } from 'express';
import { Controller, ClassMiddleware, Get, ClassErrorMiddleware } from '../../../overnightjs/core/lib/decorators';

import Logger from '../../../Logger';
import { Authentication } from '../../../config/passport';
import * as SettingService from '../../../services/SettingService';

import { AccessLevels, Modules } from '../../../database/models/Permission';
import { Auth } from '../../../middleware/authorization';
import { OK } from 'http-status-codes';
import globalErrorHandler from '../../../globalErrorHandler';

const LOG = new Logger('AdminMobileSettingController.ts');

@Controller('api/mobile/admin/settings')
@ClassMiddleware(Authentication.AUTHENTICATED)
@ClassErrorMiddleware(globalErrorHandler)
export class AdminMobileSettingController {
  // for get settings mobile
  @Get('')
  @Auth({ module: Modules.SETTING, accessLevel: AccessLevels.VIEW })
  private async get(req: Request, res: Response, next: NextFunction) {
    try {
      const priceVisibility = await SettingService.getSpecificSettings('PRICEVISIBILITY');
      const jobHistoriesVisibility = await SettingService.getSpecificSettings('JOBHISTORIESVISIBILITY');
      const futureJobVisibility = await SettingService.getSpecificSettings('FUTUREJOBSVISIBILITY');
      const duplicateClientNamePermission = await SettingService.getSpecificSettings('DUPLICATECLIENT');
      let totalFutureDays = 1;
      if (futureJobVisibility.isActive) {
        totalFutureDays = Number(futureJobVisibility.value);
      }

      return res.status(OK).json({
        priceVisibility: priceVisibility.isActive,
        jobHistoriesVisibility: jobHistoriesVisibility.isActive,
        futureJobVisibility: futureJobVisibility.isActive,
        totalFutureDays: totalFutureDays,
        duplicateClientNamePermission: duplicateClientNamePermission.isActive
      });
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }
}
