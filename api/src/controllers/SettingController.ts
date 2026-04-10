import { Request, Response, NextFunction } from 'express';
import { Controller, ClassMiddleware, Get, Post, Put, ClassErrorMiddleware } from '../overnightjs/core/lib/decorators';
// import { ValidationChain, body } from 'express-validator';
// import ValidationHandler from './ValidationHandler';

import Logger from '../Logger';
import { Authentication } from '../config/passport';
import * as SettingService from '../services/SettingService';
import * as AppLogService from '../services/AppLogService';
import * as TenantService from '../services/TenantService';
import * as AwsService from '../services/AwsService';
import * as UserService from '../services/UserService';
import * as VehicleService from '../services/VehicleService';
import * as AgentService from '../services/AgentService';
import * as ClientService from '../services/ClientService';

import { SettingCode } from '../database/models/Setting';
import { AccessLevels, Modules } from '../database/models/Permission';
import { Auth } from '../middleware/authorization';
import { JwtPayload } from '../typings/jwtPayload';
import { OK } from 'http-status-codes';
import { SettingDetailResponseModel } from '../typings/ResponseFormats';
import globalErrorHandler from '../globalErrorHandler';

const LOG = new Logger('SettingController.ts');

interface SettingQueryParams {
  q?: string; // query for searching
  cd?: string; // filter by for code of settings items
}

// const createSettingValidator: ValidationChain[] = [
//   body('value', 'Value must not be empty')
//     .not()
//     .isEmpty(),
//   body('code', 'Code must not be empty')
//     .not()
//     .isEmpty()
// ];

// const editSettingValidator: ValidationChain[] = [
//   body('isActive', 'Is Active Status must not be empty')
//     .not()
//     .isEmpty()
// ];

@Controller('api/settings')
@ClassMiddleware(Authentication.AUTHENTICATED)
@ClassErrorMiddleware(globalErrorHandler)
export class SettingController {
  @Get(':code')
  @Auth({ module: Modules.SETTING, accessLevel: AccessLevels.VIEW })
  private async getCode(req: Request, res: Response, next: NextFunction) {
    try {
      const { code } = req.params;

      if (code === 'TENANTSUBSCRIPIONEXP') {
        const user = req.user as JwtPayload;
        const tenant = await TenantService.getTenant(user.tenant);

        return res.status(OK).json(tenant);
      } else {
        const setting = await SettingService.getSpecificSettings(code);

        return res.status(OK).json(setting);
      }
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

      const settings = await SettingService.getSettings(q, cd);
      const activeTechnician = await UserService.getActiveTechnicians();
      const activeAdmin = await UserService.getActiveAdmins();
      const activeVehicle = await VehicleService.getActiveVehicle();
      const agent = await AgentService.searchAppWithPagination({ s: 0 });
      const client = await ClientService.getCount();

      await Promise.all(
        settings.map(async row => {
          if (row.label === 'CompanyImage') {
            const signedImageUrl = await AwsService.s3BucketGetSignedUrl(row.value);

            row.setDataValue('image', String(signedImageUrl));
          }

          if (row.label === 'PaynowGstImage') {
            const signedImageUrl = await AwsService.s3BucketGetSignedUrl(row.value);

            row.setDataValue('image', String(signedImageUrl));
          }

          if (row.label === 'PaynowNonGstImage') {
            const signedImageUrl = await AwsService.s3BucketGetSignedUrl(row.value);

            row.setDataValue('image', String(signedImageUrl));
          }
        })
      );

      const detailSetting: SettingDetailResponseModel = { Setting: settings };
      detailSetting.activeTechnician = activeTechnician.length;
      detailSetting.activeAdmin = activeAdmin.length;
      detailSetting.activeVehicle = activeVehicle.length;
      detailSetting.agent = agent.count;
      detailSetting.client = client.count;

      return res.status(OK).json({
        detailSetting
      });
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Post('')
  @Auth({ module: Modules.SETTING, accessLevel: AccessLevels.EDIT })
  private async add(req: Request, res: Response, next: NextFunction) {
    try {
      const { label, code, value, image, isActive } = req.body;

      if (image && label === 'CompanyImage') {
        const oldLogo = await SettingService.getSpecificSettings(SettingCode.COMPANY_SETTING, 'CompanyImage');

        if (oldLogo) {
          const imageKey = oldLogo.getDataValue('value');
          if (imageKey) {
            // await AwsService.s3BucketDeleteObject(imageKey);
          }
        }
      }

      if (image && label === 'PaynowGstImage') {
        const oldLogo = await SettingService.getSpecificSettings(SettingCode.COMPANY_SETTING, 'PaynowGstImage');

        if (oldLogo) {
          const imageKey = oldLogo.getDataValue('value');
          if (imageKey) {
            // await AwsService.s3BucketDeleteObject(imageKey);
          }
        }
      }

      if (image && label === 'PaynowNonGstImage') {
        const oldLogo = await SettingService.getSpecificSettings(SettingCode.COMPANY_SETTING, 'PaynowNonGstImage');

        if (oldLogo) {
          const imageKey = oldLogo.getDataValue('value');
          if (imageKey) {
            // await AwsService.s3BucketDeleteObject(imageKey);
          }
        }
      }

      const setting = await SettingService.createSetting(code, label, value, isActive);

      if (image && label === 'CompanyImage') {
        const imageUrl = await AwsService.s3BucketGetPutSignedUrl(image);
        setting.setDataValue('image', imageUrl);
      }

      if (image && label === 'PaynowGstImage') {
        const imageUrl = await AwsService.s3BucketGetPutSignedUrl(image);
        setting.setDataValue('image', imageUrl);
      }

      if (image && label === 'PaynowNonGstImage') {
        const imageUrl = await AwsService.s3BucketGetPutSignedUrl(image);
        setting.setDataValue('image', imageUrl);
      }

      const { id } = req.user as JwtPayload;
      await AppLogService.createAppLog(id, `Create or Update Setting : ${label} - ${value || image}`);
      return res.status(OK).json(setting);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Put(':settingId')
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
