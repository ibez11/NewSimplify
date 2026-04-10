import { ClassErrorMiddleware, ClassMiddleware, Controller, Get } from '../../../overnightjs/core/lib/decorators';
import { Request, Response, NextFunction } from 'express';
import Logger from '../../../Logger';
import * as AwsService from '../../../services/AwsService';
import { OK } from 'http-status-codes';
import globalErrorHandler from '../../../globalErrorHandler';
import { Authentication } from '../../../config/passport';

const LOG = new Logger('AdminMobileUploadController');

@Controller('api/mobile/admin/upload')
@ClassErrorMiddleware(globalErrorHandler)
@ClassMiddleware(Authentication.AUTHENTICATED)
export class AdminMobileUploadController {
  @Get(':directory/:key')
  private async signature(req: Request, res: Response, next: NextFunction) {
    try {
      const { directory, key } = req.params;
      let presignUrl = '';
      if (key) {
        presignUrl = await AwsService.s3BucketGetPutSignedUrl(key, directory);
      }

      return res.status(OK).json({ presignUrl });
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }
}
