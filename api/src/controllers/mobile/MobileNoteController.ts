import { Request, Response, NextFunction } from 'express';
import { Controller, ClassMiddleware, ClassErrorMiddleware, Get, Post, Put, Delete } from '../../overnightjs/core/lib/decorators';

import { OK, NO_CONTENT } from 'http-status-codes';

import { JwtPayload } from '../../typings/jwtPayload';

import Logger from '../../Logger';
import globalErrorHandler from '../../globalErrorHandler';
import { Authentication } from '../../config/passport';
import * as JobNoteService from '../../services/JobNoteService';
import * as AppLogService from '../../services/AppLogService';
import * as AwsService from '../../services/AwsService';
import * as EquipmentService from '../../services/EquipmentService';

import { AccessLevels, Modules } from '../../database/models/Permission';
import { Auth } from '../../middleware/authorization';
import { sequelize } from '../../config/database';
import { MobileJobNoteResponseModel } from '../../typings/ResponseFormats';
import _ from 'lodash';
import JobNoteQueryParams from '../../typings/params/JobNoteQueryParams';
import { generateWithOpenAI, spellingCheck } from '../../utils';

const LOG = new Logger('MobileNoteController.ts');

@Controller('api/mobile/notes')
@ClassMiddleware(Authentication.AUTHENTICATED)
@ClassErrorMiddleware(globalErrorHandler)
export class MobileNoteController {
  // for get job note list based on job id (with new flow after combine all job notes)
  @Get('')
  @Auth({ module: Modules.JOB_NOTES, accessLevel: AccessLevels.VIEW })
  private async getAll(req: Request<{ jobId: string }, void, void, JobNoteQueryParams>, res: Response, next: NextFunction) {
    try {
      const { jobId } = req.query;
      const { rows } = await JobNoteService.getJobNotesByJobId(Number(jobId), req.query);

      return res.status(OK).json(rows);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  // for create job notes
  @Post('')
  @Auth({ module: Modules.JOB_NOTES, accessLevel: AccessLevels.CREATE })
  private async add(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.user as JwtPayload;
      req.body.createdBy = id;

      const newJobNote = await JobNoteService.createJobNote(req.body);
      newJobNote.Equipments = await EquipmentService.getEquipmentByJobNoteId(newJobNote.id);

      if (newJobNote.JobNoteMedia) {
        await Promise.all(
          newJobNote.JobNoteMedia.sort((a, b) => a.id - b.id).map(async media => {
            if (media.fileName) {
              const imageUrl = await AwsService.s3BucketGetSignedUrl(media.fileName, 'jobs');
              media.setDataValue('imageUrl', imageUrl);
            }
          })
        );
      }

      const row: MobileJobNoteResponseModel = {
        id: newJobNote.id,
        jobId: newJobNote.jobId,
        notes: newJobNote.notes,
        isHide: newJobNote.isHide,
        createdAt: newJobNote.createdAt,
        updatedAt: newJobNote.updatedAt,
        Equipments: newJobNote.Equipments,
        displayName: newJobNote.UserProfile.displayName,
        JobNoteMedia: newJobNote.JobNoteMedia
      };

      await AppLogService.createAppLog(id, `[Mobile] Create Job Note : ${newJobNote.jobId} - ${newJobNote.notes}`);
      return res.status(OK).json(row);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  // for update job note
  @Put(':jobNoteId')
  @Auth({ module: Modules.JOB_NOTES, accessLevel: AccessLevels.EDIT })
  private async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { jobNoteId } = req.params;
      const { id } = req.user as JwtPayload;

      const editedJobNote = await JobNoteService.editJobNote(Number(jobNoteId), req.body);
      editedJobNote.Equipments = await EquipmentService.getEquipmentByJobNoteId(Number(jobNoteId));

      await Promise.all(
        editedJobNote.JobNoteMedia.map(async row => {
          if (row.fileName) {
            const imageUrl = await AwsService.s3BucketGetSignedUrl(row.fileName, 'jobs');
            row.setDataValue('imageUrl', imageUrl);
          }
        })
      );

      const row: MobileJobNoteResponseModel = {
        id: editedJobNote.id,
        jobId: editedJobNote.jobId,
        notes: editedJobNote.notes,
        isHide: editedJobNote.isHide,
        createdAt: editedJobNote.createdAt,
        updatedAt: editedJobNote.updatedAt,
        Equipments: editedJobNote.Equipments,
        displayName: editedJobNote.UserProfile.displayName,
        JobNoteMedia: editedJobNote.JobNoteMedia
      };

      await AppLogService.createAppLog(id, `[Mobile] Edit Job Note : ${editedJobNote.jobId} - ${editedJobNote.notes}`);
      return res.status(OK).json(row);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  // for hide or show job note
  @Put(':jobNoteId/visibility')
  @Auth({ module: Modules.JOB_NOTES, accessLevel: AccessLevels.EDIT })
  private async updateVisibilityJobNote(req: Request, res: Response, next: NextFunction) {
    try {
      const { jobNoteId } = req.params;
      const { isHide } = req.body;
      const { id } = req.user as JwtPayload;

      await JobNoteService.updateVisibilityJobNote(Number(jobNoteId), isHide);

      await AppLogService.createAppLog(id, `[Mobile] Edit Job Note : ${id} - ${isHide ? 'Hide' : 'Show'}`);
      return res.sendStatus(NO_CONTENT);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  // for get previous note under the same client
  @Get('previous/:jobId')
  @Auth({ module: Modules.JOB_NOTES, accessLevel: AccessLevels.VIEW })
  private async previousUnderSameClient(req: Request<{ jobId: string }, void, void, JobNoteQueryParams>, res: Response, next: NextFunction) {
    try {
      const { jobId } = req.params;
      const rows = await JobNoteService.getPreviousJobNotesByClientId(Number(jobId), req.query);

      if (rows) {
        await Promise.all(
          rows.map(async row => {
            if (row.JobNoteMedia) {
              await Promise.all(
                row.JobNoteMedia.sort((a, b) => a.id - b.id).map(async media => {
                  if (media.fileName) {
                    const preSignedUrl = await AwsService.s3BucketGetSignedUrl(media.fileName, 'jobs');
                    media.imageUrl = preSignedUrl;
                  }
                })
              );
            }
          })
        );
      }

      return res.status(OK).json(rows);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  // for delete job note by job note id
  @Delete(':jobNoteId')
  @Auth({ module: Modules.JOB_NOTES, accessLevel: AccessLevels.EDIT })
  private async delete(req: Request, res: Response, next: NextFunction) {
    const transaction = await sequelize.transaction();
    try {
      const { jobNoteId } = req.params;
      const { id } = req.user as JwtPayload;
      const { notes } = await JobNoteService.getJobNoteById(Number(jobNoteId));

      await JobNoteService.deleteJobNote(Number(jobNoteId), transaction);
      await AppLogService.createAppLog(id, `[Mobile] Delete Job Note : ${jobNoteId} - ${notes}`);
      await transaction.commit();

      return res.sendStatus(NO_CONTENT);
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
