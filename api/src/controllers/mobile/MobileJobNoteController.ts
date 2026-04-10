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
import { JobNoteResponseModel, MobileJobNoteResponseModel } from '../../typings/ResponseFormats';
import _ from 'lodash';
import JobNote from '../../database/models/JobNote';

const LOG = new Logger('MobileJobNoteController.ts');

interface JobNoteQueryParams {
  type: string;
  s: number;
  l: number;
}

@Controller('api/mobile/jobnotes')
@ClassMiddleware(Authentication.AUTHENTICATED)
@ClassErrorMiddleware(globalErrorHandler)
export class MobileJobNoteController {
  // for get job note list based on job id
  @Get(':jobId')
  @Auth({ module: Modules.JOB_NOTES, accessLevel: AccessLevels.VIEW })
  private async getAll(req: Request<{ jobId: string }, void, void, JobNoteQueryParams>, res: Response, next: NextFunction) {
    try {
      const { jobId } = req.params;
      const { type, s, l } = req.query;
      const { rows } = await JobNoteService.getJobNoteByJobId(Number(jobId), type, s, l);

      await Promise.all(
        rows.map(async row => {
          row.Equipments = await EquipmentService.getEquipmentByJobNoteId(row.id);
          if (row.JobNoteMedia) {
            await Promise.all(
              row.JobNoteMedia.sort((a, b) => a.id - b.id).map(async media => {
                if (media.fileName) {
                  const preSignedUrl = await AwsService.s3BucketGetSignedUrl(media.fileName, 'jobs');
                  media.setDataValue('imageUrl', preSignedUrl);
                }
              })
            );
          }
        })
      );

      const result = _.map(rows, row => {
        const pickedValue: JobNoteResponseModel = {
          id: row.id,
          jobId: row.jobId,
          notes: row.notes,
          isHide: row.isHide,
          jobNoteType: row.jobNoteType,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          equipmentId: row.equipmentId,
          JobNoteMedia: row.JobNoteMedia,
          Equipment: row.Equipments ? row.Equipments[0] : null,
          displayName: row.UserProfile.displayName
        };
        return pickedValue;
      });

      return res.status(OK).json(result);
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
      await Promise.all(
        newJobNote.JobNoteMedia.map(async row => {
          if (row.fileName) {
            const preSignedUrl = await AwsService.s3BucketGetPutSignedUrl(row.fileName, 'jobs');
            row.setDataValue('preSignedUrl', preSignedUrl);
          }
        })
      );

      const row: MobileJobNoteResponseModel = {
        id: newJobNote.id,
        jobId: newJobNote.jobId,
        notes: newJobNote.notes,
        jobNoteType: newJobNote.jobNoteType,
        isHide: newJobNote.isHide,
        Equipment: newJobNote.Equipments ? newJobNote.Equipments[0] : null,
        createdBy: newJobNote.createdBy,
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

      editedJobNote.Equipments = await EquipmentService.getEquipmentByJobNoteId(editedJobNote.id);

      await Promise.all(
        editedJobNote.JobNoteMedia.map(async row => {
          if (row.fileName) {
            const preSignedUrl = await AwsService.s3BucketGetPutSignedUrl(row.fileName, 'jobs');
            row.setDataValue('preSignedUrl', preSignedUrl);
          }
        })
      );

      const row: MobileJobNoteResponseModel = {
        id: editedJobNote.id,
        jobId: editedJobNote.jobId,
        notes: editedJobNote.notes,
        jobNoteType: editedJobNote.jobNoteType,
        isHide: editedJobNote.isHide,
        Equipment: editedJobNote.Equipments ? editedJobNote.Equipments[0] : null,
        createdBy: editedJobNote.createdBy,
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

  // for get previous note based on job id
  @Get('previous/:jobId')
  @Auth({ module: Modules.JOB_NOTES, accessLevel: AccessLevels.VIEW })
  private async previous(req: Request<{ jobId: string }, void, void, JobNoteQueryParams>, res: Response, next: NextFunction) {
    try {
      const { jobId } = req.params;
      const { type, s, l } = req.query;
      const { rows } = await JobNoteService.getPreviousJobNoteByJobId(Number(jobId), type, s, l);

      await Promise.all(
        rows.map(async row => {
          await Promise.all(
            row.JobNoteMedia.map(async media => {
              if (media.fileName) {
                const preSignedUrl = await AwsService.s3BucketGetSignedUrl(media.fileName, 'jobs');
                media.setDataValue('imageUrl', preSignedUrl);
              }
            })
          );
        })
      );

      return res.status(OK).json(rows);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  // for get previous note under the same client
  @Get('previousbyclient/:jobId')
  @Auth({ module: Modules.JOB_NOTES, accessLevel: AccessLevels.VIEW })
  private async previousByClientID(req: Request<{ jobId: string }, void, void, JobNoteQueryParams>, res: Response, next: NextFunction) {
    try {
      const { jobId } = req.params;
      const { type, s, l } = req.query;
      const { rows } = await JobNoteService.getPreviousJobNoteByClientId(Number(jobId), type, s, l);

      await Promise.all(
        rows.map(async row => {
          await Promise.all(
            row.JobNoteMedia.map(async media => {
              if (media.fileName) {
                const preSignedUrl = await AwsService.s3BucketGetSignedUrl(media.fileName, 'jobs');
                media.setDataValue('imageUrl', preSignedUrl);
              }
            })
          );
          row.setDataValue('displayName', row.UserProfile.displayName);
        })
      );

      return res.status(OK).json(rows);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  // for get equipment note based on equipment id
  @Get('equipmentNote/:equipmentId')
  @Auth({ module: Modules.JOB_NOTES, accessLevel: AccessLevels.VIEW })
  private async getByEquipmentId(req: Request, res: Response, next: NextFunction) {
    try {
      const { equipmentId } = req.params;
      const { s, l } = req.query;

      const rows = await JobNoteService.getJobNoteByEquipmentId(Number(equipmentId), s, l);

      await Promise.all(
        rows.map(async row => {
          row.equipmentId = Number(equipmentId);
          await Promise.all(
            row.JobNoteMedia.map(async media => {
              if (media.fileName) {
                const preSignedUrl = await AwsService.s3BucketGetSignedUrl(media.fileName, 'jobs');
                media.imageUrl = preSignedUrl;
              }
            })
          );
        })
      );

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
}
