import { Request, Response, NextFunction } from 'express';
import { OK } from 'http-status-codes';
import { Controller, ClassMiddleware, ClassErrorMiddleware, Get } from '../../overnightjs/core/lib/decorators';

import Logger from '../../Logger';
import globalErrorHandler from '../../globalErrorHandler';
import { Authentication } from '../../config/passport';
import * as BrandTemplateService from '../../services/BrandTemplateService';
import * as ServiceItemTemplateService from '../../services/ServiceItemTemplateService';
import * as JobNoteTemplateService from '../../services/JobNoteTemplateService';
import { AccessLevels, Modules } from '../../database/models/Permission';
import { Auth } from '../../middleware/authorization';
import { PaginationQueryParams } from '../../typings/params/PaginationQueryParams';
import * as ServiceTemplateService from '../../services/ServiceTemplateService';

const LOG = new Logger('MobileTemplateController.ts');

@Controller('api/mobile/templates')
@ClassMiddleware(Authentication.AUTHENTICATED)
@ClassErrorMiddleware(globalErrorHandler)
export class MobileTemplateController {
  // for get brands templates
  @Get('brands')
  @Auth({ module: Modules.BRANDS, accessLevel: AccessLevels.VIEW })
  private async getBrands(req: Request<void, void, void, PaginationQueryParams>, res: Response, next: NextFunction) {
    try {
      const { s, l, q } = req.query;

      const { rows } = await BrandTemplateService.searchBrandTemplatesWithPagination(s, l, q);

      return res.status(OK).json(rows);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  // for get service items templates
  @Get('service-items')
  @Auth({ module: Modules.SERVICE_TEMPLATES, accessLevel: AccessLevels.VIEW })
  private async getServiceItems(req: Request<void, void, void, PaginationQueryParams>, res: Response, next: NextFunction) {
    try {
      const { s, l, q } = req.query;

      const { rows } = await ServiceItemTemplateService.searchServiceItemTemplatesWithPagination(s, l, q);

      return res.status(OK).json(rows);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  // for get job notes templates
  @Get('job-notes')
  @Auth({ module: Modules.JOB_NOTE_TEMPLATES, accessLevel: AccessLevels.VIEW })
  private async getJobNotes(req: Request<void, void, void, PaginationQueryParams>, res: Response, next: NextFunction) {
    try {
      const { s, l, q } = req.query;

      const { rows } = await JobNoteTemplateService.searchJobNoteTemplatesWithPagination(s, l, q);

      return res.status(OK).json(rows);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  // for get service templates
  @Get('service')
  @Auth({ module: Modules.SERVICES, accessLevel: AccessLevels.VIEW })
  private async serviceTemplate(req: Request<void, void, void, PaginationQueryParams>, res: Response, next: NextFunction) {
    try {
      const { s, l, q } = req.query;

      const { rows } = await ServiceTemplateService.searchServiceTemplatesWithPagination(s, l, q);

      return res.status(OK).json(rows.map(row => row.toResponseFormat()));
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }
}
