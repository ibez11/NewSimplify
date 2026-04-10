import { Request, Response, NextFunction } from 'express';
import { Controller, Get } from '../overnightjs/core/lib/decorators';
import Logger from '../Logger';
import { OK } from 'http-status-codes';

const LOG = new Logger('ClientController.ts');

@Controller('api/healthcheck')
export class HealthCheckController {
  @Get('')
  private async health(req: Request, res: Response, next: NextFunction) {
    try {
      LOG.info('Health check successful');

      return res.sendStatus(OK);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }
}
