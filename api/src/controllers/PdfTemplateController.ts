import Logger from '../Logger';
import { Controller, ClassMiddleware, ClassErrorMiddleware, Get, Put, Post } from '../overnightjs/core/lib/decorators';
import { Authentication } from '../config/passport';
import globalErrorHandler from '../globalErrorHandler';
import { AccessLevels, Modules } from '../database/models/Permission';
import { Auth } from '../middleware/authorization';
import { NextFunction, Request, Response } from 'express';
import * as PdfTemplateService from '../services/PdfTemplateOptionsService';
import { OK } from 'http-status-codes';
import { JwtPayload } from '../typings/jwtPayload';
import * as AppLogService from '../services/AppLogService';

const LOG = new Logger('PdfTemplateController.ts');

@Controller('api/pdf-templates')
@ClassMiddleware(Authentication.AUTHENTICATED)
@ClassErrorMiddleware(globalErrorHandler)
export class PdfTemplateController {
  @Get(':fileName')
  @Auth({ module: Modules.PDFTEMPLATEOPTIONS, accessLevel: AccessLevels.VIEW })
  private async get(req: Request, res: Response, next: NextFunction) {
    try {
      const { fileName } = req.params;
      const pdfTemplateOptions = await PdfTemplateService.getPdfTemplateOptionsByFileName(fileName);

      return res.status(OK).json(pdfTemplateOptions);
    } catch (error) {
      LOG.error(error);
      return next(error);
    }
  }

  @Put(':fileName')
  @Auth({ module: Modules.PDFTEMPLATEOPTIONS, accessLevel: AccessLevels.VIEW })
  private async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.user as JwtPayload;
      const { fileName } = req.params;
      const editedPdfTemplateOptions = await PdfTemplateService.editPdfTemplateOptionsByFileName(req.body);

      await AppLogService.createAppLog(id, `Edit Pdf Template : ${fileName.toUpperCase()}`);
      return res.status(OK).json(editedPdfTemplateOptions);
    } catch (error) {
      LOG.error(error);
      return next(error);
    }
  }

  @Post('preview/:fileName')
  @Auth({ module: Modules.PDFTEMPLATEOPTIONS, accessLevel: AccessLevels.VIEW })
  private async getFullPreview(req: Request, res: Response, next: NextFunction) {
    try {
      const { fileName } = req.params;
      const result = await PdfTemplateService.getPreviewPdfTemplate(fileName, req.body);

      res.set({ 'Content-Type': 'application/pdf', 'Content-Length': result.length });
      return res.send(result);
    } catch (error) {
      LOG.error(error);
      return next(error);
    }
  }
}
