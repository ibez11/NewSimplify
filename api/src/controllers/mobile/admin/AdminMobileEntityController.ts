import { Request, Response, NextFunction } from 'express';
import { Controller, ClassMiddleware, ClassErrorMiddleware, Get } from '../../../overnightjs/core/lib/decorators';
import { OK } from 'http-status-codes';

import Logger from '../../../Logger';
import globalErrorHandler from '../../../globalErrorHandler';
import { Authentication } from '../../../config/passport';
import { Auth } from '../../../middleware/authorization';
import * as EntityService from '../../../services/EntityService';
import * as GstTemplateService from '../../../services/GstTemplateService';
import { AccessLevels, Modules } from '../../../database/models/Permission';
import _ from 'lodash';

const LOG = new Logger('AdminMobileEntityController.ts');

@Controller('api/mobile/admin/entities')
@ClassMiddleware(Authentication.AUTHENTICATED)
@ClassErrorMiddleware(globalErrorHandler)
export class AdminMobileEntityController {
  @Get('')
  @Auth({ module: Modules.ENTITIES, accessLevel: AccessLevels.VIEW })
  private async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { rows } = await EntityService.getAllEntities();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let result: any[] = [];
      if (rows && rows.length > 0) {
        const gstTax = await GstTemplateService.getDefaultGst();
        result = rows.map(val => ({
          ..._.pick(val, ['id', 'name', 'needGST']),
          gstTax: val.needGST ? gstTax.tax : 0
        }));
      }

      return res.status(OK).json(result);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }
}
