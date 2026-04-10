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
import * as JobDocumentService from '../services/JobDocumentService';
import * as AppLogService from '../services/AppLogService';
import * as AwsService from '../services/AwsService';

import { AccessLevels, Modules } from '../database/models/Permission';
import { Auth } from '../middleware/authorization';
import { sequelize } from '../config/database';

const LOG = new Logger('JobDocumentController.ts');

// const createJobDocumentValidator: ValidationChain[] = [
//   body('jobId', 'Job id must not be empty')
//     .not()
//     .isEmpty()
// ];

@Controller('api/jobdocuments')
@ClassMiddleware(Authentication.AUTHENTICATED)
@ClassErrorMiddleware(globalErrorHandler)
export class JobDocumentController {
  @Get('getdocument/:document')
  @Auth({ module: Modules.JOB_NOTES, accessLevel: AccessLevels.VIEW })
  private async getdocument(req: Request, res: Response, next: NextFunction) {
    const { document } = req.params;

    try {
      const documentUrl = await AwsService.s3BucketGetSignedUrl(document, 'documents');

      return res.status(OK).json({ documentUrl });
    } catch (err) {
      LOG.error(err);
      next(new ImageNotFound(document));
    }
  }

  @Get(':jobDocumentId')
  @Auth({ module: Modules.JOB_NOTES, accessLevel: AccessLevels.VIEW })
  private async get(req: Request, res: Response, next: NextFunction) {
    try {
      const { jobDocumentId } = req.params;

      const { rows } = await JobDocumentService.getJobDocumentByJobId(Number(jobDocumentId));

      await Promise.all(
        rows.map(async row => {
          if (row.documentUrl) {
            const signedImageUrl = await AwsService.s3BucketGetSignedUrl(row.documentUrl, 'documents');

            row.setDataValue('documentUrl', String(signedImageUrl));
          }
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

  @Post('')
  @Auth({ module: Modules.JOB_NOTES, accessLevel: AccessLevels.CREATE })
  private async add(req: Request, res: Response, next: NextFunction) {
    try {
      const { notes, jobId, document } = req.body;
      const { id } = req.user as JwtPayload;

      const newJobDocument = await JobDocumentService.createJobDocument(notes, document, jobId);

      let documentUrl = '';
      if (document) {
        documentUrl = await AwsService.s3BucketGetPutSignedUrl(document, 'documents');

        newJobDocument.setDataValue('documentBucket', AwsService.s3BucketStringGenerate('documents'));
      }

      newJobDocument.setDataValue('documentUrl', String(documentUrl));

      await AppLogService.createAppLog(id, `Create Job Note : ${jobId} - ${notes}`);
      return res.status(OK).json(newJobDocument);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Put(':jobDocumentId')
  @Auth({ module: Modules.JOB_NOTES, accessLevel: AccessLevels.EDIT })
  private async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { jobDocumentId } = req.params;
      const { notes, document, isHide } = req.body;
      const { id } = req.user as JwtPayload;

      const editedJobDocument = await JobDocumentService.editJobDocument(Number(jobDocumentId), notes, document, isHide);

      await AppLogService.createAppLog(id, `Edit Job Note : ${editedJobDocument.jobId} - ${notes}`);
      return res.status(OK).json(editedJobDocument);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Delete(':jobDocumentId')
  @Auth({ module: Modules.JOB_NOTES, accessLevel: AccessLevels.EDIT })
  private async delete(req: Request, res: Response, next: NextFunction) {
    const transaction = await sequelize.transaction();
    try {
      const { jobDocumentId } = req.params;
      const { id } = req.user as JwtPayload;
      const { documentUrl, notes } = await JobDocumentService.getJobDocumentById(Number(jobDocumentId));

      if (documentUrl) {
        await JobDocumentService.deleteJobDocument(Number(jobDocumentId), transaction);
        await AppLogService.createAppLog(id, `Delete Job Note : ${jobDocumentId} - ${notes}`);

        await transaction.commit();
        return res.sendStatus(NO_CONTENT);

        // const deleteImage = await AwsService.s3BucketDeleteObject(documentUrl, 'documents');
        // if (!deleteImage) {
        //   await transaction.rollback();
        // } else {
        //   await transaction.commit();
        //   return res.sendStatus(NO_CONTENT);
        // }
      } else {
        await JobDocumentService.deleteJobDocument(Number(jobDocumentId), transaction);
        await AppLogService.createAppLog(id, `Delete Job Note : ${jobDocumentId} - ${notes}`);
        await transaction.commit();
        return res.sendStatus(NO_CONTENT);
      }
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }
}
