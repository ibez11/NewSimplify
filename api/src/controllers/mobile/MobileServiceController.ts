import { Request, Response, NextFunction } from 'express';
import { Controller, ClassMiddleware, ClassErrorMiddleware, Post, Put, Delete, Get } from '../../overnightjs/core/lib/decorators';
import { OK, NO_CONTENT } from 'http-status-codes';

import Logger from '../../Logger';
import globalErrorHandler from '../../globalErrorHandler';
import { Authentication } from '../../config/passport';
import * as ServiceService from '../../services/ServiceService';
import * as AppLogService from '../../services/AppLogService';
import * as JobService from '../../services/JobService';
import { AccessLevels, Modules } from '../../database/models/Permission';
import { Auth } from '../../middleware/authorization';
import { JwtPayload } from '../../typings/jwtPayload';
import JobAttributes from '../../typings/attributes/JobAttributes';

const LOG = new Logger('ServiceController.ts');

@Controller('api/mobile/services')
@ClassMiddleware(Authentication.AUTHENTICATED)
@ClassErrorMiddleware(globalErrorHandler)
export class MobileServiceController {
  // for create additional service
  @Post('additionalservice')
  @Auth({ module: Modules.SERVICES, accessLevel: AccessLevels.CREATE })
  private async additional(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.user as JwtPayload;
      const newAdditionalService = await ServiceService.createAdditionalService(req.body);
      const jobDetail = await JobService.getJobDetailByAdditionalServiceId(newAdditionalService.id);

      const result = await JobAttributes.additionalItemResponse(jobDetail);

      await AppLogService.createAppLog(id, `[Mobile] Create Additional Contract : ${newAdditionalService.serviceTitle}`);
      return res.status(OK).json(result);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  // for update additional service based on additional service id
  @Put('additionalservice/:additionalServiceId')
  @Auth({ module: Modules.SERVICES, accessLevel: AccessLevels.EDIT })
  private async updateAdditional(req: Request, res: Response, next: NextFunction) {
    try {
      const { additionalServiceId } = req.params;

      const editAdditionalService = await ServiceService.updateAdditionalService(Number(additionalServiceId), req.body);
      const jobDetail = await JobService.getJobDetailByAdditionalServiceId(editAdditionalService.id);

      const result = await JobAttributes.additionalItemResponse(jobDetail);

      const { id } = req.user as JwtPayload;
      await AppLogService.createAppLog(id, `[Mobile] Update Additional Contract : ${editAdditionalService.serviceTitle}`);
      return res.status(OK).json(result);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  // for convert adhoc to service
  @Put('convert/:serviceId')
  @Auth({ module: Modules.SERVICES, accessLevel: AccessLevels.EDIT })
  private async convertAdhoc(req: Request, res: Response, next: NextFunction) {
    try {
      const { serviceId } = req.params;

      const newService = await ServiceService.convertToService(Number(serviceId), req.body);

      const { id } = req.user as JwtPayload;
      await AppLogService.createAppLog(id, `[Mobile] Convert Adhoc to Service Contract : ${newService.serviceTitle}`);
      return res.status(OK).sendStatus(NO_CONTENT);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  // for delete saved additional item based on job id id
  @Delete('additionalservice/:jobId')
  @Auth({ module: Modules.SERVICES, accessLevel: AccessLevels.DELETE })
  private async deleteAdditional(req: Request, res: Response, next: NextFunction) {
    try {
      const { jobId } = req.params;
      const { id } = req.user as JwtPayload;

      const job = await JobService.getJobDetailById(Number(jobId));

      const deletedService = await ServiceService.getServiceDetailById(Number(job.row.additionalServiceId));

      await ServiceService.deleteAdditionalService(Number(jobId), Number(job.row.additionalServiceId));

      await AppLogService.createAppLog(id, `[Mobile] Delete Additional Contract : ${deletedService.serviceTitle}`);
      return res.status(OK).sendStatus(NO_CONTENT);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }
}
