import { Request, Response, NextFunction } from 'express';
import { Controller, ClassMiddleware, ClassErrorMiddleware, Get, Post, Put, Delete } from '../overnightjs/core/lib/decorators';
import { OK, NO_CONTENT } from 'http-status-codes';
// import { ValidationChain, body } from 'express-validator';
// import ValidationHandler from './ValidationHandler';

import Logger from '../Logger';
import { Authentication } from '../config/passport';
import * as ChecklistTemplateService from '../services/ChecklistTemplateService';
import * as AppLogService from '../services/AppLogService';
import { AccessLevels, Modules } from '../database/models/Permission';
import { Auth } from '../middleware/authorization';
import { JwtPayload } from '../typings/jwtPayload';
import globalErrorHandler from '../globalErrorHandler';

const LOG = new Logger('ChecklistTemplateController.ts');

interface SearchChecklistTemplateQueryParams {
  s: number;
  l?: number;
  q?: string;
}

// const checklistTemplateValidator: ValidationChain[] = [
//   body('name', 'Task Name must not be empty')
//     .not()
//     .isEmpty()
// ];

@Controller('api/checklist-templates')
@ClassMiddleware(Authentication.AUTHENTICATED)
@ClassErrorMiddleware(globalErrorHandler)
export class ChecklistTemplateController {
  @Get(':checklistTemplateId')
  @Auth({ module: Modules.CHECKLIST_TEMPLATES, accessLevel: AccessLevels.VIEW })
  private async get(req: Request, res: Response, next: NextFunction) {
    try {
      const { checklistTemplateId } = req.params;
      const checklistTemplate = await ChecklistTemplateService.getChecklistTemplateFullDetailsById(Number(checklistTemplateId));

      return res.status(OK).json(checklistTemplate);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Get('')
  @Auth({ module: Modules.CHECKLIST_TEMPLATES, accessLevel: AccessLevels.VIEW })
  private async getAll(req: Request<void, void, void, SearchChecklistTemplateQueryParams>, res: Response, next: NextFunction) {
    try {
      const { s, l, q } = req.query;

      const { rows, count } = await ChecklistTemplateService.searchChecklistTemplatesWithPagination(s, l, q);

      rows.map(value => {
        value.ChecklistItems = value.ChecklistItems ? value.ChecklistItems.sort((a, b) => a.id - b.id) : [];
      });

      return res.status(OK).json({
        count,
        checklistTemplates: rows
      });
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Post('')
  @Auth({ module: Modules.CHECKLIST_TEMPLATES, accessLevel: AccessLevels.CREATE })
  private async add(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description, checklistItems } = req.body;
      const newChecklistTemplate = await ChecklistTemplateService.createChecklistTemplate(name, description, checklistItems);

      const { id } = req.user as JwtPayload;
      await AppLogService.createAppLog(id, `Create Service Item Template : ${name}`);
      return res.status(OK).json(newChecklistTemplate);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Put(':checklistTemplateId')
  @Auth({ module: Modules.CHECKLIST_TEMPLATES, accessLevel: AccessLevels.EDIT })
  private async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { checklistTemplateId } = req.params;
      const { name, description, checklistItems } = req.body;
      const editedChecklistTemplate = await ChecklistTemplateService.editChecklistTemplate(
        Number(checklistTemplateId),
        name,
        description,
        checklistItems
      );

      const { id } = req.user as JwtPayload;
      await AppLogService.createAppLog(id, `Edit Service Item Template : ${name}`);
      return res.status(OK).json(editedChecklistTemplate);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Delete(':checklistTemplateId')
  @Auth({ module: Modules.CHECKLIST_TEMPLATES, accessLevel: AccessLevels.DELETE })
  private async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { checklistTemplateId } = req.params;
      const deletedChecklistTemplate = await ChecklistTemplateService.getChecklistTemplateFullDetailsById(Number(checklistTemplateId));

      await ChecklistTemplateService.deleteChecklistTemplate(Number(checklistTemplateId));

      const { id } = req.user as JwtPayload;
      await AppLogService.createAppLog(id, `Delete Service Item Template : ${deletedChecklistTemplate.name}`);
      return res.sendStatus(NO_CONTENT);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }
}
