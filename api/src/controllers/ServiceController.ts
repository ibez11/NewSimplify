import { Request, Response, NextFunction } from 'express';
import { Controller, ClassMiddleware, ClassErrorMiddleware, Get, Post, Put, Delete } from '../overnightjs/core/lib/decorators';
import { OK, NO_CONTENT } from 'http-status-codes';

// import { body, ValidationChain } from 'express-validator';
// import ValidationHandler from './ValidationHandler';
import Logger from '../Logger';
import globalErrorHandler from '../globalErrorHandler';
import { Authentication } from '../config/passport';
import * as ServiceService from '../services/ServiceService';
import * as AppLogService from '../services/AppLogService';
import { AccessLevels, Modules } from '../database/models/Permission';
import { Auth } from '../middleware/authorization';
import { JwtPayload } from '../typings/jwtPayload';
import { scheduling } from '../utils';
import lodash from 'lodash';
import ServiceAttributes from '../typings/attributes/ServiceAttributes';
import { ServiceQueryParams } from '../typings/params/ServiceQueryParams';
import * as InvoiceService from '../services/InvoiceService';
import * as JobService from '../services/JobService';
import * as BookingSettingService from '../services/BookingSettingService';

const LOG = new Logger('ServiceController.ts');

// const createServiceValidator: ValidationChain[] = [
//   body('serviceType', 'Service type must not be empty')
//     .not()
//     .isEmpty(),
//   body('serviceTitle', 'Service Number must not be empty')
//     .not()
//     .isEmpty(),
//   body('termStart', 'Term start must not be empty')
//     .not()
//     .isEmpty(),
//   body('termEnd', 'Term end must not be empty')
//     .not()
//     .isEmpty(),
//   body('clientId', 'Client id must not be empty')
//     .not()
//     .isEmpty(),
//   body('serviceAddressId', 'Service address id must not be empty')
//     .not()
//     .isEmpty(),
//   body('entityId', 'Entity id must not be empty')
//     .not()
//     .isEmpty()
// ];

@Controller('api/services')
@ClassMiddleware(Authentication.AUTHENTICATED)
@ClassErrorMiddleware(globalErrorHandler)
export class ServiceController {
  @Get('')
  @Auth({ module: Modules.SERVICES, accessLevel: AccessLevels.VIEW })
  private async getAll(req: Request<void, void, void, ServiceQueryParams>, res: Response, next: NextFunction) {
    try {
      const { rows, count } = await ServiceService.searchServicesWithPagination(req.query);

      const result = lodash.map(rows, service => lodash.omit(service, 'createdDate'));

      return res.status(OK).json({
        count,
        contracts: result
      });
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Get('last')
  @Auth({ module: Modules.SERVICES, accessLevel: AccessLevels.VIEW })
  private async getLastService(req: Request, res: Response, next: NextFunction) {
    try {
      const lastService = await ServiceService.getLastService();

      return res.status(OK).json(lastService);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Get('exportCsv')
  @Auth({ module: Modules.SERVICES, accessLevel: AccessLevels.VIEW })
  private async exportCsv(req: Request<void, void, void, ServiceQueryParams>, res: Response, next: NextFunction) {
    try {
      const rows = await ServiceService.exportCsv(req.query);

      return res.status(OK).json({
        contracts: rows
      });
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

      const service = ServiceAttributes.get(await ServiceService.getServiceDetailById(Number(id)));

      return res.status(OK).json(service);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Post('additionalService')
  @Auth({ module: Modules.SERVICES, accessLevel: AccessLevels.CREATE })
  private async additional(req: Request, res: Response, next: NextFunction) {
    try {
      const additionalService = await ServiceService.createAdditionalService(req.body);

      const { id } = req.user as JwtPayload;
      await AppLogService.createAppLog(id, `Create Additional Contract : ${additionalService.serviceTitle}`);
      return res.status(OK).json(additionalService);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Put('additionalService/:additionalServiceId')
  @Auth({ module: Modules.SERVICES, accessLevel: AccessLevels.EDIT })
  private async updateAdditional(req: Request, res: Response, next: NextFunction) {
    try {
      const { additionalServiceId } = req.params;

      const additionalService = await ServiceService.updateAdditionalService(Number(additionalServiceId), req.body);

      const { id } = req.user as JwtPayload;
      await AppLogService.createAppLog(id, `Update Additional Contract : ${additionalService.serviceTitle}`);
      return res.status(OK).json(additionalService);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Get('export/:id')
  private async export(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const result = await ServiceService.exportPdf(Number(id));

      res.set({ 'Content-Type': 'application/pdf', 'Content-Length': result.length });
      return res.send(result);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Post('schedule')
  private async schedule(req: Request, res: Response, next: NextFunction) {
    try {
      const { Schedules } = req.body;

      // eslint-disable-next-line
      const jobs: any = scheduling(Schedules);

      return res.status(OK).json(jobs);
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

      const newService = await ServiceService.createService(req.body);

      await AppLogService.createAppLog(id, `Create Contract : ${newService.serviceTitle} (#${newService.id})`);
      return res.status(OK).json(newService);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Put('confirm/:serviceId')
  @Auth({ module: Modules.SERVICES, accessLevel: AccessLevels.EDIT })
  private async confirm(req: Request, res: Response, next: NextFunction) {
    try {
      const { serviceId } = req.params;
      const confirmedService = await ServiceService.confirmService(Number(serviceId));

      const { id } = req.user as JwtPayload;
      await AppLogService.createAppLog(id, `Confirm Contract : ${confirmedService.contractTitle} (#${serviceId})`);
      return res.status(OK).json(confirmedService);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Put('cancel/:serviceId')
  @Auth({ module: Modules.SERVICES, accessLevel: AccessLevels.EDIT })
  private async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const { serviceId } = req.params;
      const service = await ServiceService.cancelService(Number(serviceId));

      const { id } = req.user as JwtPayload;
      await AppLogService.createAppLog(id, `Cancel Contract : ${service.contractTitle} (#${serviceId}) `);
      return res.status(OK).json(service);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Put('detail/:serviceId')
  @Auth({ module: Modules.SERVICES, accessLevel: AccessLevels.EDIT })
  private async updateServiceDetail(req: Request, res: Response, next: NextFunction) {
    try {
      const { serviceId } = req.params;

      const editService = ServiceAttributes.get(await ServiceService.editServiceDetail(Number(serviceId), req.body));

      const { id } = req.user as JwtPayload;
      await AppLogService.createAppLog(id, `Edit Contract : ${editService.serviceTitle} (#${serviceId})`);
      return res.status(OK).json(editService);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Put('book/:serviceId')
  @Auth({ module: Modules.SERVICES, accessLevel: AccessLevels.EDIT })
  private async addBooking(req: Request, res: Response, next: NextFunction) {
    try {
      const { serviceId } = req.params;

      const editService = ServiceAttributes.get(await ServiceService.editServiceDetail(Number(serviceId), req.body));

      const { id } = req.user as JwtPayload;
      await AppLogService.createAppLog(id, `Edit Contract : ${editService.serviceTitle} (#${serviceId})`);
      return res.status(OK).json(editService);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Get('schedule/:serviceId')
  @Auth({ module: Modules.SERVICES, accessLevel: AccessLevels.VIEW })
  private async getSchedule(req: Request, res: Response, next: NextFunction) {
    try {
      const { serviceId } = req.params;

      const schedules = await ServiceService.getSchedulesById(Number(serviceId));

      return res.status(OK).json({ schedules });
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Get('renew/:serviceId')
  @Auth({ module: Modules.SERVICES, accessLevel: AccessLevels.VIEW })
  private async renew(req: Request, res: Response, next: NextFunction) {
    try {
      const { serviceId } = req.params;

      const { service, jobs } = await ServiceService.getRenewService(Number(serviceId));

      return res.status(OK).json({ service, jobs });
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Post('renew/:serviceId')
  @Auth({ module: Modules.SERVICES, accessLevel: AccessLevels.CREATE })
  private async addRenew(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.user as JwtPayload;
      const { serviceId } = req.params;

      const renewService = await ServiceService.createService(req.body);

      await ServiceService.updateRenewServiceStatus(Number(serviceId), renewService.id);

      await AppLogService.createAppLog(
        id,
        `Create Renewal Contract : #${renewService.id} - ${renewService.serviceTitle} From Contract ID #${serviceId}`
      );
      return res.status(OK).json(renewService);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Post('sendEmail/:serviceId')
  @Auth({ module: Modules.INVOICES, accessLevel: AccessLevels.VIEW })
  private async sendEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { serviceId } = req.params;
      const { contactEmail } = req.body;

      await ServiceService.sendEmail(Number(serviceId), contactEmail);

      return res.sendStatus(NO_CONTENT);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Get('check-jobs-inprogress/:serviceId')
  @Auth({ module: Modules.CLIENTS, accessLevel: AccessLevels.VIEW })
  private async hasJobsInprogress(req: Request, res: Response, next: NextFunction) {
    try {
      const { serviceId } = req.params;
      const hasJobsInprogress = await JobService.hasJobsInProgressByServiceId(Number(serviceId));

      return res.status(OK).json({
        hasJobsInprogress: hasJobsInprogress
      });
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Get('check-unpaid-invoices/:serviceId')
  @Auth({ module: Modules.INVOICES, accessLevel: AccessLevels.VIEW })
  private async hasUnpaidInvoices(req: Request, res: Response, next: NextFunction) {
    try {
      const { serviceId } = req.params;
      const hasUnpaidInvoices = await InvoiceService.hasUnpaidInvoicesByServiceId(Number(serviceId));

      return res.status(OK).json({
        hasUnpaidInvoices: hasUnpaidInvoices
      });
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Delete(':serviceId')
  @Auth({ module: Modules.SERVICES, accessLevel: AccessLevels.DELETE })
  private async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { serviceId } = req.params;
      const { reason } = req.body;
      const { id } = req.user as JwtPayload;

      const deletedService = await ServiceService.deleteService(Number(serviceId));
      await AppLogService.createAppLog(
        id,
        `Delete Contract : ${deletedService.serviceTitle} (#${serviceId})` + (reason ? `, reason: ${reason}` : '')
      );
      return res.sendStatus(NO_CONTENT);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }
}
