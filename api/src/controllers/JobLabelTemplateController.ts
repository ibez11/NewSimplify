import { Request, Response, NextFunction } from 'express';
import { OK, NO_CONTENT } from 'http-status-codes';
import { Controller, ClassMiddleware, ClassErrorMiddleware, Get, Post, Put, Delete } from '../overnightjs/core/lib/decorators';
// import { ValidationChain, body } from 'express-validator';
// import ValidationHandler from './ValidationHandler';

import Logger from '../Logger';
import globalErrorHandler from '../globalErrorHandler';
import { Authentication } from '../config/passport';
import * as JobLabelTemplateService from '../services/JobLabelTemplateService';
import * as AppLogService from '../services/AppLogService';
import { AccessLevels, Modules } from '../database/models/Permission';
import { Auth } from '../middleware/authorization';
import { JwtPayload } from '../typings/jwtPayload';

const LOG = new Logger('JobLabelTemplateController.ts');

interface SearchJobLabelTemplateQueryParams {
  s: number;
  l?: number;
  q?: string;
}

@Controller('api/joblabel-templates')
@ClassMiddleware(Authentication.AUTHENTICATED)
@ClassErrorMiddleware(globalErrorHandler)
export class JobLabelTemplateController {
  @Get(':id')
  @Auth({ module: Modules.JOB_LABEL_TEMPLATES, accessLevel: AccessLevels.VIEW })
  private async get(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const jobLabelTemplate = await JobLabelTemplateService.getJobLabelTemplateById(Number(id));
      return res.status(OK).json({
        jobLabelTemplate: jobLabelTemplate
      });
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Get('')
  @Auth({ module: Modules.JOB_LABEL_TEMPLATES, accessLevel: AccessLevels.VIEW })
  private async getAll(req: Request<void, void, void, SearchJobLabelTemplateQueryParams>, res: Response, next: NextFunction) {
    try {
      const { s, l, q } = req.query;

      const { rows, count } = await JobLabelTemplateService.searchJobLabelTemplatesWithPagination(s, l, q);

      return res.status(OK).json({
        count,
        JobLabelTemplates: rows.map(row => row.toResponseFormat())
      });
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Post('')
  @Auth({ module: Modules.JOB_LABEL_TEMPLATES, accessLevel: AccessLevels.CREATE })
  private async add(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description, color } = req.body;
      const newJobLabelTemplate = await JobLabelTemplateService.createJobLabelTemplate(name, description, color);

      const { id } = req.user as JwtPayload;
      await AppLogService.createAppLog(id, `Create Job Label Template : ${name}`);

      return res.status(OK).json(newJobLabelTemplate);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Put(':jobLabelTemplateId')
  @Auth({ module: Modules.JOB_LABEL_TEMPLATES, accessLevel: AccessLevels.EDIT })
  private async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { jobLabelTemplateId } = req.params;
      const { name, description, color } = req.body;
      const editedJobLabelTemplate = await JobLabelTemplateService.editJobLabelTemplate(Number(jobLabelTemplateId), name, description, color);

      const { id } = req.user as JwtPayload;
      await AppLogService.createAppLog(id, `Edit Job Label Template : ${jobLabelTemplateId}`);
      return res.status(OK).json(editedJobLabelTemplate);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Delete(':jobLabelTemplateId')
  @Auth({ module: Modules.JOB_LABEL_TEMPLATES, accessLevel: AccessLevels.DELETE })
  private async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { jobLabelTemplateId } = req.params;
      const deletedJobLabelTemplate = await JobLabelTemplateService.getJobLabelTemplateById(Number(jobLabelTemplateId));

      await JobLabelTemplateService.deleteJobLabelTemplate(Number(jobLabelTemplateId));

      const { id } = req.user as JwtPayload;
      await AppLogService.createAppLog(id, `Delete Job Label Template : ${deletedJobLabelTemplate.name}`);
      return res.sendStatus(NO_CONTENT);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }
}
