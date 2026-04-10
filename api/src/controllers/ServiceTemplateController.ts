import { Request, Response, NextFunction } from 'express';
import { Controller, ClassMiddleware, Get, Post, Put, Delete, ClassErrorMiddleware } from '../overnightjs/core/lib/decorators';
import { OK, NO_CONTENT } from 'http-status-codes';
// import { ValidationChain, body } from 'express-validator';
// import ValidationHandler from './ValidationHandler';

import Logger from '../Logger';
import { Authentication } from '../config/passport';
import * as ServiceTemplateService from '../services/ServiceTemplateService';
import * as AppLogService from '../services/AppLogService';
import { AccessLevels, Modules } from '../database/models/Permission';
import { Auth } from '../middleware/authorization';
import { JwtPayload } from '../typings/jwtPayload';
import globalErrorHandler from '../globalErrorHandler';

const LOG = new Logger('ServiceTemplateController.ts');

interface SearchServiceTemplateQueryParams {
  s: number;
  l?: number;
  q?: string;
}

// const createServiceTemplateValidator: ValidationChain[] = [
//   body('name', 'Service Name must not be empty')
//     .not()
//     .isEmpty()
// ];

// const editServiceTemplateValidator: ValidationChain[] = [
//   body('name', 'Task Name must not be empty')
//     .not()
//     .isEmpty()
// ];

@Controller('api/servicetemplates')
@ClassMiddleware(Authentication.AUTHENTICATED)
@ClassErrorMiddleware(globalErrorHandler)
export class ServiceTemplateController {
  @Get('')
  @Auth({ module: Modules.SERVICE_TEMPLATES, accessLevel: AccessLevels.VIEW })
  private async get(req: Request<void, void, void, SearchServiceTemplateQueryParams>, res: Response, next: NextFunction) {
    try {
      const { s, l, q } = req.query;

      const { rows, count } = await ServiceTemplateService.searchServiceTemplatesWithPagination(s, l, q);

      return res.status(OK).json({
        count,
        serviceTemplates: rows.map(row => row.toResponseFormat())
      });
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Post('')
  @Auth({ module: Modules.SERVICE_TEMPLATES, accessLevel: AccessLevels.CREATE })
  private async add(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description, termCondition } = req.body;
      const newServiceTemplate = await ServiceTemplateService.createServiceTemplate(name, description, termCondition);

      const { id } = req.user as JwtPayload;
      await AppLogService.createAppLog(id, `Create Contract Template : ${name}`);
      return res.status(OK).json(newServiceTemplate);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Put(':serviceTemplateId')
  @Auth({ module: Modules.SERVICE_TEMPLATES, accessLevel: AccessLevels.EDIT })
  private async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { serviceTemplateId } = req.params;
      const { name, description, termCondition } = req.body;
      const editedServiceTemplate = await ServiceTemplateService.editServiceTemplate(Number(serviceTemplateId), name, description, termCondition);

      const { id } = req.user as JwtPayload;
      await AppLogService.createAppLog(id, `Edit Contract Template : ${name}`);
      return res.status(OK).json(editedServiceTemplate);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Delete(':serviceTemplateId')
  @Auth({ module: Modules.SERVICE_TEMPLATES, accessLevel: AccessLevels.DELETE })
  private async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { serviceTemplateId } = req.params;
      const deletedServiceTemplate = await ServiceTemplateService.getServiceTemplateFullDetailsById(Number(serviceTemplateId));

      await ServiceTemplateService.deleteServiceTemplate(Number(serviceTemplateId));

      const { id } = req.user as JwtPayload;
      await AppLogService.createAppLog(id, `Delete Contract Template : ${deletedServiceTemplate.name}`);
      return res.sendStatus(NO_CONTENT);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }
}
