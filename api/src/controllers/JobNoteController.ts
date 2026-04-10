import { Request, Response, NextFunction } from 'express';
import { Controller, ClassMiddleware, ClassErrorMiddleware, Get, Post, Put, Delete } from '../overnightjs/core/lib/decorators';

import { OK, NO_CONTENT } from 'http-status-codes';
// import { ValidationChain, body } from 'express-validator';
// import ValidationHandler from './ValidationHandler';

import ImageNotFound from '../errors/ImageNotFound';
import { JwtPayload } from '../typings/jwtPayload';

import Logger from '../Logger';
import globalErrorHandler from '../globalErrorHandler';
import { Authentication } from '../config/passport';
import * as JobNoteService from '../services/JobNoteService';
import * as AppLogService from '../services/AppLogService';
import * as AwsService from '../services/AwsService';

import { AccessLevels, Modules } from '../database/models/Permission';
import { Auth } from '../middleware/authorization';
import { sequelize } from '../config/database';
import * as EquipmentService from '../services/EquipmentService';
import { generateWithOpenAI, spellingCheck } from '../utils';

const LOG = new Logger('JobNoteController.ts');

// const createJobNoteValidator: ValidationChain[] = [
//   body('jobId', 'Job id must not be empty')
//     .not()
//     .isEmpty()
// ];

@Controller('api/jobnotes')
@ClassMiddleware(Authentication.AUTHENTICATED)
@ClassErrorMiddleware(globalErrorHandler)
export class JobNoteController {
  @Get('getimage/:image')
  @Auth({ module: Modules.JOB_NOTES, accessLevel: AccessLevels.VIEW })
  private async getimage(req: Request, res: Response, next: NextFunction) {
    const { image } = req.params;

    try {
      const imageUrl = await AwsService.s3BucketGetSignedUrl(image, 'jobs');

      return res.status(OK).json({ imageUrl });
    } catch (err) {
      LOG.error(err);
      next(new ImageNotFound(image));
    }
  }

  @Get(':jobNoteId')
  @Auth({ module: Modules.JOB_NOTES, accessLevel: AccessLevels.VIEW })
  private async get(req: Request, res: Response, next: NextFunction) {
    try {
      const { jobNoteId } = req.params;

      const { rows } = await JobNoteService.getJobNotesByJobId(Number(jobNoteId));

      return res.status(OK).json({
        jobNotes: rows
      });
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Get('preSignedUrl/:fileName')
  @Auth({ module: Modules.JOB_NOTES, accessLevel: AccessLevels.VIEW })
  private async getPreSignedUrl(req: Request, res: Response, next: NextFunction) {
    const { fileName } = req.params;
    const preSignedUrl = await AwsService.s3BucketGetPutSignedUrl(fileName, 'jobs');

    return res.status(OK).json(String(preSignedUrl));
  }

  @Post('')
  @Auth({ module: Modules.JOB_NOTES, accessLevel: AccessLevels.CREATE })
  private async add(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.user as JwtPayload;
      req.body.createdBy = id;

      const newJobNote = await JobNoteService.createJobNote(req.body);
      newJobNote.Equipments = await EquipmentService.getEquipmentByJobNoteId(newJobNote.id);

      await Promise.all(
        newJobNote.JobNoteMedia.map(async row => {
          let imageUrl = '';
          if (row.fileName) {
            imageUrl = await AwsService.s3BucketGetSignedUrl(row.fileName, 'jobs');
            row.setDataValue('imageUrl', String(imageUrl));
            newJobNote.setDataValue('imageBucket', AwsService.s3BucketStringGenerate('jobs'));
          }
          newJobNote.setDataValue('imageUrl', String(imageUrl));
        })
      );

      newJobNote.setDataValue('displayName', newJobNote.UserProfile.displayName);
      newJobNote.setDataValue('Equipments', newJobNote.Equipments);

      await AppLogService.createAppLog(id, `Create Job Note : ${newJobNote.jobId} - ${newJobNote.notes}`);
      return res.status(OK).json(newJobNote);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Put(':jobNoteId')
  @Auth({ module: Modules.JOB_NOTES, accessLevel: AccessLevels.EDIT })
  private async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { jobNoteId } = req.params;
      const { id } = req.user as JwtPayload;

      const editedJobNote = await JobNoteService.editJobNote(Number(jobNoteId), req.body);
      editedJobNote.Equipments = await EquipmentService.getEquipmentByJobNoteId(editedJobNote.id);

      await Promise.all(
        editedJobNote.JobNoteMedia.map(async row => {
          if (row.fileName) {
            const imageUrl = await AwsService.s3BucketGetSignedUrl(row.fileName, 'jobs');
            row.setDataValue('imageUrl', String(imageUrl));
            editedJobNote.setDataValue('imageBucket', AwsService.s3BucketStringGenerate('jobs'));
          }
        })
      );

      editedJobNote.setDataValue('displayName', editedJobNote.UserProfile.displayName);
      editedJobNote.setDataValue('Equipments', editedJobNote.Equipments);

      await AppLogService.createAppLog(id, `Edit Job Note : ${editedJobNote.jobId} - ${editedJobNote.notes}`);
      return res.status(OK).json(editedJobNote);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Put('visibility/:jobNoteId')
  @Auth({ module: Modules.JOB_NOTES, accessLevel: AccessLevels.EDIT })
  private async updateVisibilityJobNote(req: Request, res: Response, next: NextFunction) {
    try {
      const { jobNoteId } = req.params;
      const { isHide } = req.body;
      const { id } = req.user as JwtPayload;

      await JobNoteService.updateVisibilityJobNote(Number(jobNoteId), isHide);

      await AppLogService.createAppLog(id, `Edit Job Note : ${id} - ${isHide ? 'Hide' : 'Show'}`);
      return res.sendStatus(NO_CONTENT);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Delete(':jobNoteId')
  @Auth({ module: Modules.JOB_NOTES, accessLevel: AccessLevels.EDIT })
  private async delete(req: Request, res: Response, next: NextFunction) {
    const transaction = await sequelize.transaction();
    try {
      const { jobNoteId } = req.params;
      const { id } = req.user as JwtPayload;
      const { notes } = await JobNoteService.getJobNoteById(Number(jobNoteId));

      await JobNoteService.deleteJobNote(Number(jobNoteId), transaction);
      await AppLogService.createAppLog(id, `Delete Job Note : ${jobNoteId} - ${notes}`);
      await transaction.commit();
      return res.sendStatus(NO_CONTENT);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Get('equipmentNote/:equipmentId')
  @Auth({ module: Modules.JOB_NOTES, accessLevel: AccessLevels.VIEW })
  private async getByEquipmentId(req: Request, res: Response, next: NextFunction) {
    try {
      const { equipmentId } = req.params;

      const rows = await JobNoteService.getJobNoteByEquipmentId(Number(equipmentId));

      await Promise.all(
        rows.map(async row => {
          await Promise.all(
            row.JobNoteMedia.map(async media => {
              if (media.fileName) {
                media.imageUrl = await AwsService.s3BucketGetSignedUrl(media.fileName, 'jobs');
              }
            })
          );
        })
      );

      return res.status(OK).json({
        jobNotes: rows
      });
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Post('generate-text')
  private async generateText(req: Request, res: Response, next: NextFunction) {
    try {
      const { prompt } = req.body;
      const result = await generateWithOpenAI(prompt);
      return res.status(OK).json({ result });
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Post('spelling-check')
  private async spellingCheck(req: Request, res: Response, next: NextFunction) {
    try {
      const { prompt } = req.body;
      const result = await spellingCheck(prompt);
      return res.status(OK).json({ result });
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }
}
