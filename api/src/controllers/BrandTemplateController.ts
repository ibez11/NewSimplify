import { Request, Response, NextFunction } from 'express';
import { OK, NO_CONTENT } from 'http-status-codes';
import { Controller, ClassMiddleware, ClassErrorMiddleware, Get, Post, Put, Delete } from '../overnightjs/core/lib/decorators';

import Logger from '../Logger';
import globalErrorHandler from '../globalErrorHandler';
import { Authentication } from '../config/passport';
import * as BrandTemplateService from '../services/BrandTemplateService';
import * as AppLogService from '../services/AppLogService';
import { AccessLevels, Modules } from '../database/models/Permission';
import { Auth } from '../middleware/authorization';
import { JwtPayload } from '../typings/jwtPayload';

const LOG = new Logger('BrandTemplateController.ts');

interface SearchBrandTemplateQueryParams {
  s: number;
  l?: number;
  q?: string;
}

@Controller('api/brand-templates')
@ClassMiddleware(Authentication.AUTHENTICATED)
@ClassErrorMiddleware(globalErrorHandler)
export class BrandTemplateController {
  @Get('')
  @Auth({ module: Modules.BRANDS, accessLevel: AccessLevels.VIEW })
  private async getAll(req: Request<void, void, void, SearchBrandTemplateQueryParams>, res: Response, next: NextFunction) {
    try {
      const { s, l, q } = req.query;

      const { rows, count } = await BrandTemplateService.searchBrandTemplatesWithPagination(s, l, q);

      return res.status(OK).json({
        count,
        BrandTemplates: rows.map(row => row.toResponseFormat())
      });
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Get(':id')
  @Auth({ module: Modules.BRANDS, accessLevel: AccessLevels.VIEW })
  private async get(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const brandTemplate = await BrandTemplateService.getBrandTemplateById(Number(id));
      return res.status(OK).json({
        brandTemplate: brandTemplate
      });
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Post('')
  @Auth({ module: Modules.BRANDS, accessLevel: AccessLevels.CREATE })
  private async add(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description } = req.body;
      const newBrandTemplate = await BrandTemplateService.createBrandTemplate(name, description);

      const { id } = req.user as JwtPayload;
      await AppLogService.createAppLog(id, `Create Brand Template : ${name}`);

      return res.status(OK).json(newBrandTemplate);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Put(':brandTemplateId')
  @Auth({ module: Modules.BRANDS, accessLevel: AccessLevels.EDIT })
  private async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { brandTemplateId } = req.params;
      const { name, description } = req.body;
      const editedBrandTemplate = await BrandTemplateService.editBrandTemplate(Number(brandTemplateId), name, description);

      const { id } = req.user as JwtPayload;
      await AppLogService.createAppLog(id, `Edit Brand Template : ${brandTemplateId}`);
      return res.status(OK).json(editedBrandTemplate);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Delete(':brandTemplateId')
  @Auth({ module: Modules.BRANDS, accessLevel: AccessLevels.DELETE })
  private async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { brandTemplateId } = req.params;
      const deletedBrandTemplate = await BrandTemplateService.getBrandTemplateById(Number(brandTemplateId));

      await BrandTemplateService.deleteBrandTemplate(Number(brandTemplateId));

      const { id } = req.user as JwtPayload;
      await AppLogService.createAppLog(id, `Delete Brand Template : ${deletedBrandTemplate.name}`);
      return res.sendStatus(NO_CONTENT);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }
}
