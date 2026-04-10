import { Request, Response, NextFunction } from 'express';
import { Controller, ClassMiddleware, ClassErrorMiddleware, Get, Post, Put, Delete } from '../../overnightjs/core/lib/decorators';

import { OK, NO_CONTENT } from 'http-status-codes';

import { JwtPayload } from '../../typings/jwtPayload';

import Logger from '../../Logger';
import globalErrorHandler from '../../globalErrorHandler';
import { Authentication } from '../../config/passport';
import * as ChecklistJobItemService from '../../services/ChecklistJobItemService';
import * as AppLogService from '../../services/AppLogService';
import { AccessLevels, Modules } from '../../database/models/Permission';
import { Auth } from '../../middleware/authorization';
import { sequelize } from '../../config/database';

const LOG = new Logger('MobileChecklistJobItemController.ts');

@Controller('api/mobile/checklist-job-item')
@ClassMiddleware(Authentication.AUTHENTICATED)
@ClassErrorMiddleware(globalErrorHandler)
export class MobileChecklistJobItemController {
  // for get detail of checklist job item
  @Get(':checklistJobItemId')
  @Auth({ module: Modules.JOBS, accessLevel: AccessLevels.VIEW })
  private async get(req: Request, res: Response, next: NextFunction) {
    try {
      const { checklistJobItemId } = req.params;

      const checklistJobItem = await ChecklistJobItemService.getChecklistJobItemById(Number(checklistJobItemId));

      return res.status(OK).json(checklistJobItem);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  // gor add checklist job item
  @Post('')
  @Auth({ module: Modules.JOBS, accessLevel: AccessLevels.CREATE })
  private async add(req: Request, res: Response, next: NextFunction) {
    try {
      const { checklistJobId, name, status, remarks } = req.body;
      const { id } = req.user as JwtPayload;

      const newChecklistJobItem = await ChecklistJobItemService.createChecklistJobItem(checklistJobId, name, status, remarks);

      await AppLogService.createAppLog(id, `[Mobile] Create Checklist Job Item : ${newChecklistJobItem.id} - ${name}`);
      return res.status(OK).json(newChecklistJobItem);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  // for edit checklist job item based on id
  @Put(':checklistJobItemId')
  @Auth({ module: Modules.JOBS, accessLevel: AccessLevels.EDIT })
  private async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { checklistJobItemId } = req.params;
      const { name, remarks } = req.body;
      const { id } = req.user as JwtPayload;

      const editedChecklistJobItem = await ChecklistJobItemService.editChecklistJobItem(Number(checklistJobItemId), name, remarks);

      await AppLogService.createAppLog(id, `[Mobile] Edit Checklist Job : ${editedChecklistJobItem.id} - ${name}`);
      return res.status(OK).json(editedChecklistJobItem);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  // for delete checklist job item based on id
  @Delete(':checklistJobItemId')
  @Auth({ module: Modules.JOBS, accessLevel: AccessLevels.DELETE })
  private async delete(req: Request, res: Response, next: NextFunction) {
    const transaction = await sequelize.transaction();
    try {
      const { checklistJobItemId } = req.params;
      const { id } = req.user as JwtPayload;
      const { name } = await ChecklistJobItemService.getChecklistJobItemById(Number(checklistJobItemId));

      await ChecklistJobItemService.deleteChecklistJobItemById(Number(checklistJobItemId));
      await AppLogService.createAppLog(id, `[Mobile] Delete Checklist Job Item: ${checklistJobItemId} - ${name}`);
      await transaction.commit();
      return res.sendStatus(NO_CONTENT);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }
}
