import { Request, Response, NextFunction } from 'express';
import { Controller, ClassMiddleware, Get, Post, Put, Delete, ClassErrorMiddleware } from '../overnightjs/core/lib/decorators';
import { OK, NO_CONTENT } from 'http-status-codes';

import Logger from '../Logger';
import { Authentication } from '../config/passport';
import * as InvoiceService from '../services/InvoiceService';
import * as ServiceService from '../services/ServiceService';
import * as ServiceItemService from '../services/ServiceItemService';
import * as JobService from '../services/JobService';
import * as AppLogService from '../services/AppLogService';
import { ServiceTypes } from '../database/models/Service';
import { AccessLevels, Modules } from '../database/models/Permission';
import { Auth } from '../middleware/authorization';
import { ServiceItemResponseModel, InvoiceReponseModel } from '../typings/ResponseFormats';
import { JwtPayload } from '../typings/jwtPayload';
import globalErrorHandler from '../globalErrorHandler';

const LOG = new Logger('InvoiceController.ts');

interface SearchInvoiceQueryParams {
  s: number;
  l?: number;
  q?: string;
  startDate?: Date;
  endDate?: Date;
  isSynchronize?: boolean;
  needGST?: boolean;
  is?: string | []; // Invoice Status value
  orderBy?: string;
}

// const createInvoiceValidator: ValidationChain[] = [
//   body('invoiceNumber', 'Invoice number must not be empty')
//     .not()
//     .isEmpty(),
//   body('termStart', 'Term start must not be empty')
//     .not()
//     .isEmpty(),
//   body('termEnd', 'Term end must not be empty')
//     .not()
//     .isEmpty(),
//   body('invoiceAmount', 'Invoice amount must not be empty')
//     .not()
//     .isEmpty(),
//   body('serviceId', 'Service id must not be empty')
//     .not()
//     .isEmpty()
// ];

// const editInvoiceValidator: ValidationChain[] = [
//   body('invoiceNumber', 'Invoice number must not be empty')
//     .not()
//     .isEmpty()
// ];

// const exportInvoiceValidator: ValidationChain[] = [
//   body('id', 'Invoice ID must not be empty')
//     .not()
//     .isEmpty(),
//   body('Jobs', 'Jobs must not be empty')
//     .not()
//     .isEmpty(),
//   body('ServiceItem', 'Service items must not be empty')
//     .not()
//     .isEmpty()
// ];

@Controller('api/invoices')
@ClassMiddleware(Authentication.AUTHENTICATED)
@ClassErrorMiddleware(globalErrorHandler)
export class InvoiceController {
  @Get('')
  @Auth({ module: Modules.INVOICES, accessLevel: AccessLevels.VIEW })
  private async getAll(req: Request<void, void, void, SearchInvoiceQueryParams>, res: Response, next: NextFunction) {
    try {
      const { s, l, q, startDate, endDate, isSynchronize, needGST, is, orderBy } = req.query;

      const { rows, count } = await InvoiceService.searchInvoiceWithPagination(s, l, q, startDate, endDate, isSynchronize, needGST, is, orderBy);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result: InvoiceReponseModel[] = [];
      if (rows) {
        await Promise.all(
          rows.map(async row => {
            const service = await ServiceService.getServiceDetailById(row.serviceId);
            const serviceTypes = service.getDataValue('serviceType');

            const serviceItemJobs: ServiceItemResponseModel[] = [];

            if (serviceTypes === ServiceTypes.ADDITIONAL) {
              const additionalItem = await JobService.getJobDetailByAdditionalServiceId(service.id);

              const serviceItems = additionalItem.AdditionalServiceItem;
              if (serviceItems) {
                serviceItems.map(currentItem => {
                  serviceItemJobs.push(currentItem);
                });
              }
            } else {
              const { Jobs } = service;
              await Promise.all(
                Jobs.map(async job => {
                  const currentJobItems = await ServiceItemService.getServiceItemByJobId(job.getDataValue('id'));
                  currentJobItems.map(currentItem => {
                    serviceItemJobs.push(currentItem);
                  });
                })
              );
            }

            if (service.needGST) {
              service.setDataValue('gstTax', service.gstTax);
            }

            service.setDataValue('serviceItemsJobs', serviceItemJobs);
            row.setDataValue('Service', service);
            result.push({
              id: row.id,
              invoiceNumber: row.invoiceNumber,
              generatedDate: row.createdAt,
              clientName: row.Service.Client.name,
              clientId: row.Service.Client.id,
              termStart: row.termStart,
              termEnd: row.termEnd,
              dueDate: row.dueDate,
              contractTitle: row.Service.serviceTitle,
              contractId: row.Service.id,
              invoiceAmount: row.invoiceAmount,
              collectedAmount: row.collectedAmount,
              outstandingAmount: row.invoiceAmount - row.collectedAmount,
              totalJob: service.totalJob,
              remarks: row.remarks,
              invoiceStatus: row.invoiceStatus,
              createdBy: row.createdBy,
              attnTo: row.attnTo
            });
          })
        );
      }

      return res.status(OK).json({
        count,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        invoices: result.sort((a, b) => b.id - a.id)
      });
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Get('invoice-zapier')
  @Auth({ module: Modules.INVOICES, accessLevel: AccessLevels.VIEW })
  private async getInvoiceZapier(req: Request<void, void, void, SearchInvoiceQueryParams>, res: Response, next: NextFunction) {
    try {
      const { s, l, q, isSynchronize, needGST, orderBy } = req.query;

      const rows = await InvoiceService.invoiceZapier(s, l, q, isSynchronize, needGST, orderBy);

      return res.status(OK).json({
        invoices: rows
      });
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Get('last')
  @Auth({ module: Modules.INVOICES, accessLevel: AccessLevels.VIEW })
  private async getLastInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const lastInvoice = await InvoiceService.getLastInvoice();

      return res.status(OK).json(lastInvoice);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Get('exportCsv')
  @Auth({ module: Modules.INVOICES, accessLevel: AccessLevels.VIEW })
  private async exportCsv(req: Request<void, void, void, SearchInvoiceQueryParams>, res: Response, next: NextFunction) {
    try {
      const { s, l, q, startDate, endDate, isSynchronize, needGST, is, orderBy } = req.query;

      const rows = await InvoiceService.exportCsv(s, l, q, startDate, endDate, isSynchronize, needGST, is, orderBy);

      return res.status(OK).json({
        invoices: rows
      });
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Get('info')
  @Auth({ module: Modules.INVOICES, accessLevel: AccessLevels.VIEW })
  private async info(req: Request, res: Response, next: NextFunction) {
    try {
      const invoiceInfo = await InvoiceService.getInvoiceInformation();

      return res.status(OK).json(invoiceInfo);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Get(':invoiceId')
  @Auth({ module: Modules.INVOICES, accessLevel: AccessLevels.VIEW })
  private async getDetail(req: Request, res: Response, next: NextFunction) {
    try {
      const { invoiceId } = req.params;

      const invoice = await InvoiceService.getFullDetailById(Number(invoiceId));

      return res.status(OK).json(invoice);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Post('sendEmail/:invoiceId')
  @Auth({ module: Modules.INVOICES, accessLevel: AccessLevels.VIEW })
  private async sendEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.user as JwtPayload;
      const { invoiceId } = req.params;
      const { contactEmail } = req.body;

      await InvoiceService.sendEmail(Number(invoiceId), id, contactEmail);

      return res.sendStatus(NO_CONTENT);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Get('export/:id')
  private async export(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const result = await InvoiceService.exportPdf(Number(id));

      res.set({ 'Content-Type': 'application/pdf', 'Content-Length': result.length });
      return res.send(result);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Post('')
  @Auth({ module: Modules.INVOICES, accessLevel: AccessLevels.CREATE })
  private async add(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.user as JwtPayload;
      const { invoiceNumber, serviceId, invoiceDate, attnTo } = req.body;
      const newInvoice = await InvoiceService.createInvoice(invoiceNumber, serviceId, invoiceDate, id, attnTo);

      await AppLogService.createAppLog(id, `Create Invoice : ${invoiceNumber}`);
      return res.status(OK).json(newInvoice);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Put(':invoiceId')
  @Auth({ module: Modules.INVOICES, accessLevel: AccessLevels.EDIT })
  private async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { invoiceId } = req.params;
      const { id } = req.user as JwtPayload;
      const {
        invoiceNumber,
        collectedAmount,
        chargeAmount,
        paymentMethod,
        invoiceStatus,
        isSynchronize,
        remarks,
        isUpdateCollectedAmount,
        isUpdateInvoiceNumber,
        termEnd,
        dueDate,
        chequeNumber,
        invoiceDate,
        attnTo
      } = req.body;

      const editedInvoice = await InvoiceService.editInvoice(
        Number(invoiceId),
        invoiceNumber,
        collectedAmount,
        chargeAmount,
        paymentMethod,
        invoiceStatus,
        isSynchronize,
        remarks,
        isUpdateCollectedAmount,
        isUpdateInvoiceNumber,
        id,
        termEnd,
        dueDate,
        chequeNumber,
        invoiceDate,
        attnTo
      );

      await AppLogService.createAppLog(id, `Edit Invoice : ${invoiceNumber}`);
      return res.status(OK).json(editedInvoice);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Put('sync-invoice/:invoiceId')
  @Auth({ module: Modules.INVOICES, accessLevel: AccessLevels.EDIT })
  private async syncInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const { invoiceId } = req.params;
      const { id } = req.user as JwtPayload;
      const { invoiceNumber, isSynchronize } = req.body;
      const editedInvoice = await InvoiceService.syncingInvoice(Number(invoiceId), isSynchronize, id);

      await AppLogService.createAppLog(id, `Edit Invoice : ${invoiceNumber}`);
      return res.status(OK).json(editedInvoice);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Put('sync-invoice-update/:invoiceId')
  @Auth({ module: Modules.INVOICES, accessLevel: AccessLevels.EDIT })
  private async syncInvoiceUpdate(req: Request, res: Response, next: NextFunction) {
    try {
      const { invoiceId } = req.params;
      const { id } = req.user as JwtPayload;
      const { invoiceNumber, isSynchronize } = req.body;
      const editedInvoice = await InvoiceService.syncingInvoice(Number(invoiceId), isSynchronize, id);

      await AppLogService.createAppLog(id, `Edit Invoice : ${invoiceNumber}`);
      return res.status(OK).json(editedInvoice);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Delete(':invoiceId')
  @Auth({ module: Modules.INVOICES, accessLevel: AccessLevels.DELETE })
  private async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { invoiceId } = req.params;
      const { reason } = req.body;
      const { invoiceNumber } = await InvoiceService.deleteInvoice(Number(invoiceId));

      const { id } = req.user as JwtPayload;
      await AppLogService.createAppLog(id, `Delete Invoice : ${invoiceNumber}` + (reason ? `, reason: ${reason}` : ''));
      return res.sendStatus(NO_CONTENT);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }
}
