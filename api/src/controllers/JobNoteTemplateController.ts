import { Request, Response, NextFunction } from 'express';
import { OK, NO_CONTENT } from 'http-status-codes';
import { Controller, ClassMiddleware, ClassErrorMiddleware, Get, Post, Put, Delete } from '../overnightjs/core/lib/decorators';
// import { ValidationChain, body } from 'express-validator';
// import ValidationHandler from './ValidationHandler';

import Logger from '../Logger';
import globalErrorHandler from '../globalErrorHandler';
import { Authentication } from '../config/passport';
import * as JobNoteTemplateService from '../services/JobNoteTemplateService';
import * as AppLogService from '../services/AppLogService';
import { AccessLevels, Modules } from '../database/models/Permission';
import { Auth } from '../middleware/authorization';
import { JwtPayload } from '../typings/jwtPayload';

const LOG = new Logger('JobNoteTemplateController.ts');

interface SearchJobNoteTemplateQueryParams {
  s: number;
  l?: number;
  q?: string;
}

@Controller('api/jobnote-templates')
@ClassMiddleware(Authentication.AUTHENTICATED)
@ClassErrorMiddleware(globalErrorHandler)
export class JobNoteTemplateController {
  @Get(':id')
  @Auth({ module: Modules.JOB_NOTE_TEMPLATES, accessLevel: AccessLevels.VIEW })
  private async get(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const jobNoteTemplate = await JobNoteTemplateService.getJobNoteTemplateById(Number(id));
      return res.status(OK).json({
        jobNoteTemplate: jobNoteTemplate
      });
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Get('')
  @Auth({ module: Modules.JOB_NOTE_TEMPLATES, accessLevel: AccessLevels.VIEW })
  private async getAll(req: Request<void, void, void, SearchJobNoteTemplateQueryParams>, res: Response, next: NextFunction) {
    try {
      const { s, l, q } = req.query;

      const { rows, count } = await JobNoteTemplateService.searchJobNoteTemplatesWithPagination(s, l, q);

      return res.status(OK).json({
        count,
        JobNoteTemplates: rows.map(row => row.toResponseFormat())
      });
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Post('')
  @Auth({ module: Modules.JOB_NOTE_TEMPLATES, accessLevel: AccessLevels.CREATE })
  private async add(req: Request, res: Response, next: NextFunction) {
    try {
      const { notes } = req.body;
      const newJobNoteTemplate = await JobNoteTemplateService.createJobNoteTemplate(notes);

      const { id } = req.user as JwtPayload;
      await AppLogService.createAppLog(id, `Create Job Note Template : ${notes}`);

      return res.status(OK).json(newJobNoteTemplate);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Put(':jobNoteTemplateId')
  @Auth({ module: Modules.JOB_NOTE_TEMPLATES, accessLevel: AccessLevels.EDIT })
  private async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { jobNoteTemplateId } = req.params;
      const { notes } = req.body;
      const editedJobNoteTemplate = await JobNoteTemplateService.editJobNoteTemplate(Number(jobNoteTemplateId), notes);

      const { id } = req.user as JwtPayload;
      await AppLogService.createAppLog(id, `Edit Job Note Template : ${jobNoteTemplateId}`);
      return res.status(OK).json(editedJobNoteTemplate);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Delete(':jobNoteTemplateId')
  @Auth({ module: Modules.JOB_NOTE_TEMPLATES, accessLevel: AccessLevels.DELETE })
  private async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { jobNoteTemplateId } = req.params;
      const deletedJobNoteTemplate = await JobNoteTemplateService.getJobNoteTemplateById(Number(jobNoteTemplateId));

      await JobNoteTemplateService.deleteJobNoteTemplate(Number(jobNoteTemplateId));

      const { id } = req.user as JwtPayload;
      await AppLogService.createAppLog(id, `Delete Job Note Template : ${deletedJobNoteTemplate.notes}`);
      return res.sendStatus(NO_CONTENT);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }
}
