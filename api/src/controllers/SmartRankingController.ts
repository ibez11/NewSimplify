import { Request, Response, NextFunction } from 'express';
import { Controller, ClassMiddleware, ClassErrorMiddleware, Get, Put } from '../overnightjs/core/lib/decorators';
import { OK } from 'http-status-codes';

import Logger from '../Logger';
import globalErrorHandler from '../globalErrorHandler';
import { Authentication } from '../config/passport';
import { Auth } from '../middleware/authorization';
import { JwtPayload } from '../typings/jwtPayload';
import { AccessLevels, Modules } from '../database/models/Permission';

import * as AppLogService from '../services/AppLogService';
import * as SmartRankingService from '../services/SmartRankingService';
import * as DistrictService from '../services/DistrictService';
import * as SettingService from '../services/SettingService';

const LOG = new Logger('SmartRankingController.ts');

interface SmartRankingQueryParams {
  s?: string;
  jobId?: number;
  postalCode?: string;
  fs?: boolean;
  fp?: boolean;
}

@Controller('api/smart-ranking')
@ClassMiddleware(Authentication.AUTHENTICATED)
@ClassErrorMiddleware(globalErrorHandler)
export class SmartRankingController {
  @Get('technician')
  private async proximityTechnician(req: Request<void, void, void, SmartRankingQueryParams>, res: Response, next: NextFunction) {
    try {
      const { s, jobId, postalCode, fs, fp } = req.query;

      // Convert string query params to booleans: '?fs=true' → true, '?fs=false' → false
      const useSkill = String(fs).toLowerCase() === 'true';
      const useProximity = String(fp).toLowerCase() === 'true';
      const technicians = await SmartRankingService.getSmartRangkingTechnician(jobId, postalCode, s, useSkill, useProximity);
      const jobLocation = await DistrictService.getDistrictGroupByPostalCode(postalCode);
      return res.status(OK).json({
        technicians,
        jobLocation
      });
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Put('setting/:settingId')
  @Auth({ module: Modules.SETTING, accessLevel: AccessLevels.EDIT })
  private async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { settingId } = req.params;
      const { value, isActive } = req.body;
      const editedSetting = await SettingService.editSetting(Number(settingId), value, isActive);

      const { id } = req.user as JwtPayload;
      await AppLogService.createAppLog(id, `Update Setting : ${editedSetting.label} - ${value || isActive}`);
      return res.status(OK).json(editedSetting);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }
}
