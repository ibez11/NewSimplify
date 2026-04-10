import { Request, Response, NextFunction } from 'express';
import { OK, NO_CONTENT } from 'http-status-codes';
import { Controller, ClassMiddleware, ClassErrorMiddleware, Get, Post, Put, Delete } from '../overnightjs/core/lib/decorators';
// import { ValidationChain, body } from 'express-validator';
// import ValidationHandler from './ValidationHandler';

import Logger from '../Logger';
import globalErrorHandler from '../globalErrorHandler';
import { Authentication } from '../config/passport';
import * as SkillTemplateService from '../services/SkillTemplateService';
import * as AppLogService from '../services/AppLogService';
import { AccessLevels, Modules } from '../database/models/Permission';
import { Auth } from '../middleware/authorization';
import { JwtPayload } from '../typings/jwtPayload';

const LOG = new Logger('SkillTemplateController.ts');

interface SearchSkillTemplateQueryParams {
  s: number;
  l?: number;
  q?: string;
}

// const skillTemplateValidator: ValidationChain[] = [
//   body('name', 'Service Name must not be empty')
//     .not()
//     .isEmpty()
// ];

@Controller('api/skill-templates')
@ClassMiddleware(Authentication.AUTHENTICATED)
@ClassErrorMiddleware(globalErrorHandler)
export class SkillTemplateController {
  @Get(':id')
  @Auth({ module: Modules.SKILL_TEMPLATES, accessLevel: AccessLevels.VIEW })
  private async get(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const skillTemplate = await SkillTemplateService.getSkillTemplateById(Number(id));
      return res.status(OK).json({
        SkillTemplate: skillTemplate
      });
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Get('')
  @Auth({ module: Modules.SKILL_TEMPLATES, accessLevel: AccessLevels.VIEW })
  private async getAll(req: Request<void, void, void, SearchSkillTemplateQueryParams>, res: Response, next: NextFunction) {
    try {
      const { s, l, q } = req.query;

      const { rows, count } = await SkillTemplateService.searchSkillTemplatesWithPagination(s, l, q);

      return res.status(OK).json({
        count,
        SkillTemplates: rows.map(row => row.toResponseFormat())
      });
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Post('')
  @Auth({ module: Modules.SKILL_TEMPLATES, accessLevel: AccessLevels.CREATE })
  private async add(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description } = req.body;
      const newSkillTemplate = await SkillTemplateService.createSkillTemplate(name, description);

      const { id } = req.user as JwtPayload;
      await AppLogService.createAppLog(id, `Create Skill Template : ${name}`);

      return res.status(OK).json(newSkillTemplate);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Put(':skillTemplateId')
  @Auth({ module: Modules.SKILL_TEMPLATES, accessLevel: AccessLevels.EDIT })
  private async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { skillTemplateId } = req.params;
      const { name, description } = req.body;
      const editedSkillTemplate = await SkillTemplateService.editSkillTemplate(Number(skillTemplateId), name, description);

      const { id } = req.user as JwtPayload;
      await AppLogService.createAppLog(id, `Edit Skill Template : ${name}`);
      return res.status(OK).json(editedSkillTemplate);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Delete(':skillTemplateId')
  @Auth({ module: Modules.SKILL_TEMPLATES, accessLevel: AccessLevels.DELETE })
  private async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { skillTemplateId } = req.params;
      const deletedSkillTemplate = await SkillTemplateService.getSkillTemplateById(Number(skillTemplateId));

      await SkillTemplateService.deleteSkillTemplate(Number(skillTemplateId));

      const { id } = req.user as JwtPayload;
      await AppLogService.createAppLog(id, `Delete Skill Template : ${deletedSkillTemplate.name}`);
      return res.sendStatus(NO_CONTENT);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }
}
