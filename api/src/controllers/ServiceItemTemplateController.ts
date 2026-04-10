import { Request, Response, NextFunction } from 'express';
import { Controller, ClassMiddleware, ClassErrorMiddleware, Get, Post, Put, Delete } from '../overnightjs/core/lib/decorators';
import { OK, NO_CONTENT } from 'http-status-codes';
// import { ValidationChain, body } from 'express-validator';
// import ValidationHandler from './ValidationHandler';

import Logger from '../Logger';
import globalErrorHandler from '../globalErrorHandler';
import { Authentication } from '../config/passport';
import * as ServiceItemTemplateService from '../services/ServiceItemTemplateService';
import * as AppLogService from '../services/AppLogService';
import { AccessLevels, Modules } from '../database/models/Permission';
import { Auth } from '../middleware/authorization';
import { JwtPayload } from '../typings/jwtPayload';

const LOG = new Logger('ServiceItemTemplateController.ts');

interface SearchServiceItemTemplateQueryParams {
  s: number;
  l?: number;
  q?: string;
  ob?: string;
  ot?: string;
}

// const createServiceItemTemplateValidator: ValidationChain[] = [
//   body('name', 'Task Name must not be empty')
//     .not()
//     .isEmpty(),
//   body('unitPrice', 'Cost must not be empty')
//     .not()
//     .isEmpty()
// ];

// const editServiceItemTemplateValidator: ValidationChain[] = [
//   body('name', 'Task Name must not be empty')
//     .not()
//     .isEmpty(),
//   body('unitPrice', 'Cost must not be empty')
//     .not()
//     .isEmpty()
// ];

@Controller('api/serviceitemtemplates')
@ClassMiddleware(Authentication.AUTHENTICATED)
@ClassErrorMiddleware(globalErrorHandler)
export class ServiceItemTemplateController {
  @Get('')
  @Auth({ module: Modules.SERVICE_ITEM_TEMPLATES, accessLevel: AccessLevels.VIEW })
  private async get(req: Request<void, void, void, SearchServiceItemTemplateQueryParams>, res: Response, next: NextFunction) {
    try {
      const { s, l, q, ob, ot } = req.query;

      const { rows, count } = await ServiceItemTemplateService.searchServiceItemTemplatesWithPagination(s, l, q, ob, ot);

      return res.status(OK).json({
        count,
        serviceItemTemplates: rows.map(row => row.toResponseFormat())
      });
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Post('')
  @Auth({ module: Modules.SERVICE_ITEM_TEMPLATES, accessLevel: AccessLevels.CREATE })
  private async add(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description, unitPrice } = req.body;
      const newServiceItemTemplate = await ServiceItemTemplateService.createServiceItemTemplate(name, description, unitPrice);

      const { id } = req.user as JwtPayload;
      await AppLogService.createAppLog(id, `Create Service Item Template : ${name}`);
      return res.status(OK).json(newServiceItemTemplate);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Put(':serviceItemTemplateId')
  @Auth({ module: Modules.SERVICE_ITEM_TEMPLATES, accessLevel: AccessLevels.EDIT })
  private async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { serviceItemTemplateId } = req.params;
      const { name, description, unitPrice, idQboWithGST, IdQboWithoutGST } = req.body;
      const editedServiceItemTemplate = await ServiceItemTemplateService.editServiceItemTemplate(
        Number(serviceItemTemplateId),
        name,
        description,
        unitPrice,
        idQboWithGST,
        IdQboWithoutGST
      );

      const { id } = req.user as JwtPayload;
      await AppLogService.createAppLog(id, `Edit Service Item Template : ${name}`);
      return res.status(OK).json(editedServiceItemTemplate);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Delete(':serviceItemTemplateId')
  @Auth({ module: Modules.SERVICE_ITEM_TEMPLATES, accessLevel: AccessLevels.DELETE })
  private async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { serviceItemTemplateId } = req.params;
      const deletedServiceItemTemplate = await ServiceItemTemplateService.getServiceItemTemplateFullDetailsById(Number(serviceItemTemplateId));

      await ServiceItemTemplateService.deleteServiceItemTemplate(Number(serviceItemTemplateId));

      const { id } = req.user as JwtPayload;
      await AppLogService.createAppLog(id, `Delete Service Item Template : ${deletedServiceItemTemplate.name}`);
      return res.sendStatus(NO_CONTENT);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }
}
