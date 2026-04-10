import { ClassErrorMiddleware, ClassMiddleware, Controller, Delete, Get, Post, Put } from '../../../overnightjs/core/lib/decorators';
import Logger from '../../../Logger';
import { Authentication } from '../../../config/passport';
import globalErrorHandler from '../../../globalErrorHandler';
import { AccessLevels, Modules } from '../../../database/models/Permission';
import { NextFunction, Request, Response } from 'express';
import { ServiceQueryParams } from '../../../typings/params/ServiceQueryParams';
import { Auth } from '../../../middleware/authorization';
import * as ServiceService from '../../../services/ServiceService';
import * as JobService from '../../../services/JobService';
import { NO_CONTENT, OK } from 'http-status-codes';
import AdminMobileServiceAttributes from '../../../typings/attributes/mobile/admin/AdminMobileServiceAttributes';
import { JwtPayload } from '../../../typings/jwtPayload';
import * as AppLogService from '../../../services/AppLogService';
import Schedule from '../../../database/models/Schedule';
import JobAttributes from '../../../typings/attributes/JobAttributes';

const LOG = new Logger('AdminMobileServiceController.ts');

@Controller('api/mobile/admin/services')
@ClassMiddleware(Authentication.AUTHENTICATED)
@ClassErrorMiddleware(globalErrorHandler)
export class AdminMobileServiceController {
  @Get('')
  @Auth({ module: Modules.SERVICES, accessLevel: AccessLevels.VIEW })
  private async getAll(req: Request<void, void, void, ServiceQueryParams>, res: Response, next: NextFunction) {
    try {
      const { rows } = await ServiceService.searchServicesWithPagination(req.query);
      const results = await AdminMobileServiceAttributes.getAll(rows);
      return res.status(OK).json(results);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Get(':id')
  @Auth({ module: Modules.SERVICES, accessLevel: AccessLevels.VIEW })
  private async get(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const service = await AdminMobileServiceAttributes.get(await ServiceService.getServiceDetailById(Number(id)));

      return res.status(OK).json(service);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Post('')
  @Auth({ module: Modules.SERVICES, accessLevel: AccessLevels.CREATE })
  private async add(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.user as JwtPayload;

      const schedules: Schedule[] = [];
      schedules.push(req.body.Schedules);
      req.body.Schedules = schedules;
      req.body.serviceNumber = '';

      const newService = await ServiceService.createService(req.body);

      await AppLogService.createAppLog(id, `[Admin Mobile] Create Contract : ${newService.serviceTitle} (#${newService.id})`);
      return res.sendStatus(NO_CONTENT);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Post('schedule')
  private async schedule(req: Request, res: Response, next: NextFunction) {
    try {
      const schedules: Schedule[] = [];
      schedules.push(req.body.Schedules);

      const jobs = await ServiceService.generateSchedule(schedules, req.body.isNextDay);

      return res.status(OK).json({ jobs: jobs });
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Put(':serviceId')
  @Auth({ module: Modules.SERVICES, accessLevel: AccessLevels.EDIT })
  private async updateServiceDetail(req: Request, res: Response, next: NextFunction) {
    try {
      const { serviceId } = req.params;

      const editService = await ServiceService.editServiceDetail(Number(serviceId), req.body);

      const { id } = req.user as JwtPayload;
      await AppLogService.createAppLog(id, `[Admin Mobile] Edit Contract : ${editService.serviceTitle} (#${serviceId})`);
      return res.sendStatus(NO_CONTENT);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  // for create additional service
  @Post('additionalservice')
  @Auth({ module: Modules.SERVICES, accessLevel: AccessLevels.CREATE })
  private async additional(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.user as JwtPayload;
      const newAdditionalService = await ServiceService.createAdditionalService(req.body);
      const jobDetail = await JobService.getJobDetailByAdditionalServiceId(newAdditionalService.id);

      const result = await JobAttributes.additionalItemResponse(jobDetail);

      await AppLogService.createAppLog(id, `[Admin Mobile] Create Additional Contract : ${newAdditionalService.serviceTitle}`);
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
      await AppLogService.createAppLog(id, `[Admin Mobile] Update Additional Contract : ${editAdditionalService.serviceTitle}`);
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
      await AppLogService.createAppLog(id, `[Admin Mobile] Convert Adhoc to Service Contract : ${newService.serviceTitle}`);
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

      await AppLogService.createAppLog(id, `[Admin Mobile] Delete Additional Contract : ${deletedService.serviceTitle}`);
      return res.status(OK).sendStatus(NO_CONTENT);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }
}
