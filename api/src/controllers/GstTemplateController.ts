import { Request, Response, NextFunction } from 'express';
import { OK } from 'http-status-codes';
import { Controller, ClassMiddleware, ClassErrorMiddleware, Get } from '../overnightjs/core/lib/decorators';

import Logger from '../Logger';
import globalErrorHandler from '../globalErrorHandler';
import { Authentication } from '../config/passport';
import * as GstTemplateService from '../services/GstTemplateService';
import { AccessLevels, Modules } from '../database/models/Permission';
import { Auth } from '../middleware/authorization';

const LOG = new Logger('GstTemplateController.ts');

interface SearchGstTemplateQueryParams {
  s: number;
  l?: number;
  q?: string;
}

@Controller('api/gst-templates')
@ClassMiddleware(Authentication.AUTHENTICATED)
@ClassErrorMiddleware(globalErrorHandler)
export class GstTemplateController {
  @Get('')
  @Auth({ module: Modules.SKILL_TEMPLATES, accessLevel: AccessLevels.VIEW })
  private async getAll(req: Request<void, void, void, SearchGstTemplateQueryParams>, res: Response, next: NextFunction) {
    try {
      const { s, l, q } = req.query;

      const { rows, count } = await GstTemplateService.searchGstTemplatesWithPagination(s, l, q);

      return res.status(OK).json({
        count,
        gstTemplates: rows.map(row => row.toResponseFormat())
      });
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }
}
