import { ClassErrorMiddleware, ClassMiddleware, Controller, Get } from '../../overnightjs/core/lib/decorators';
import { Request, Response, NextFunction } from 'express';
import Logger from '../../Logger';
import * as AwsService from '../../services/AwsService';
import { OK } from 'http-status-codes';
import globalErrorHandler from '../../globalErrorHandler';
import { Authentication } from '../../config/passport';

const LOG = new Logger('MobileUploadController');

@Controller('api/mobile/upload')
@ClassErrorMiddleware(globalErrorHandler)
@ClassMiddleware(Authentication.AUTHENTICATED)
export class MobileUploadController {
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
