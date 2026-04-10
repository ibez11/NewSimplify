import { Request, Response, NextFunction } from 'express';
import { Controller, ClassMiddleware, ClassErrorMiddleware, Get } from '../../../overnightjs/core/lib/decorators';
import { OK } from 'http-status-codes';
// import { ValidationChain, body } from 'express-validator';
// import ValidationHandler from './ValidationHandler';

import Logger from '../../../Logger';
import globalErrorHandler from '../../../globalErrorHandler';
import { Authentication } from '../../../config/passport';
import * as SmartRankingService from '../../../services/SmartRankingService';
import * as DistrictService from '../../../services/DistrictService';

const LOG = new Logger('SmartRankingController.ts');

interface SmartRankingQueryParams {
  s?: string;
  jobId?: number;
  postalCode?: string;
  fs?: boolean;
  fp?: boolean;
}

@Controller('api/mobile/admin/smart-ranking')
@ClassMiddleware(Authentication.AUTHENTICATED)
@ClassErrorMiddleware(globalErrorHandler)
export class AdminMobileSmartRankingController {
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
}
