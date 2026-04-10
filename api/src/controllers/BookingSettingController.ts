import { Request, Response, NextFunction } from 'express';
import { Controller, ClassMiddleware, Get, Put, ClassErrorMiddleware } from '../overnightjs/core/lib/decorators';

import Logger from '../Logger';
import { Authentication } from '../config/passport';
import * as BookingSettingService from '../services/BookingSettingService';
import * as AppLogService from '../services/AppLogService';
import * as AwsService from '../services/AwsService';

import { AccessLevels, Modules } from '../database/models/Permission';
import { Auth } from '../middleware/authorization';
import { JwtPayload } from '../typings/jwtPayload';
import { OK } from 'http-status-codes';
import globalErrorHandler from '../globalErrorHandler';
import { BookingSettingCode } from '../database/models/BookingSetting';

const LOG = new Logger('BookingSettingController.ts');

interface SettingQueryParams {
  q?: string; // query for searching
  cd?: string; // filter by for code of settings items
}

@Controller('api/booking-settings')
@ClassMiddleware(Authentication.AUTHENTICATED)
@ClassErrorMiddleware(globalErrorHandler)
export class BookingSettingController {
  @Get(':code')
  @Auth({ module: Modules.SETTING, accessLevel: AccessLevels.VIEW })
  private async getCode(req: Request, res: Response, next: NextFunction) {
    try {
      const { code } = req.params;
      const setting = await BookingSettingService.getSpecificSettings(code);

      return res.status(OK).json(setting);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Get('')
  @Auth({ module: Modules.SETTING, accessLevel: AccessLevels.VIEW })
  private async get(req: Request, res: Response, next: NextFunction) {
    try {
      const { q, cd }: SettingQueryParams = req.query;

      const settings = await BookingSettingService.getSettings(q, cd);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result: Record<string, any> = {};

      for (const setting of settings) {
        result[setting.label] = setting.value;
        if (setting.code === BookingSettingCode.LOGO) {
          result['LogoUrl'] = await AwsService.s3BucketGetSignedUrl(setting.value, 'booking_settings');
        }
        if (setting.code === BookingSettingCode.INCLUDE_PUBLIC_HOLIDAY) {
          result['IncludePublicHoliday'] = setting.value === 'true';
        }
      }

      return res.status(OK).json(result);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Put('')
  @Auth({ module: Modules.SETTING, accessLevel: AccessLevels.EDIT })
  private async update(req: Request, res: Response, next: NextFunction) {
    try {
      const editedSetting = await BookingSettingService.editBookingSetting(req.body);
      const businessName = editedSetting.find(val => val.code === BookingSettingCode.BUSINESS_NAME)?.value ?? '';
      let logoUrl = '';

      await Promise.all(
        editedSetting.map(async row => {
          if (row.code === BookingSettingCode.LOGO && row.value) {
            const signedImageUrl = await AwsService.s3BucketGetPutSignedUrl(row.value, 'booking_settings');
            logoUrl = String(signedImageUrl);
          }
        })
      );

      const { id } = req.user as JwtPayload;
      await AppLogService.createAppLog(id, `Update Booking Setting : ${businessName}`);
      return res.status(OK).json({ ...editedSetting, logoUrl });
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }
}
