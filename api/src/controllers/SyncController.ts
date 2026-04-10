import { Request, Response, NextFunction } from 'express';
import { Controller, ClassMiddleware, ClassErrorMiddleware, Get, Post, Put } from '../overnightjs/core/lib/decorators';
import { OK } from 'http-status-codes';
import Logger from '../Logger';
import { Authentication } from '../config/passport';
import globalErrorHandler from '../globalErrorHandler';

import * as JobService from '../services/JobService';
import * as ClientService from '../services/ClientService';
import * as EntityService from '../services/EntityService';
import * as UserService from '../services/UserService';
import * as ServiceItemTemplateService from '../services/ServiceItemTemplateService';
import * as ServiceService from '../services/ServiceService';
import * as AppLogService from '../services/AppLogService';

import { AccessLevels, Modules } from '../database/models/Permission';
import { Auth } from '../middleware/authorization';

import { JwtPayload } from '../typings/jwtPayload';
import { JobQueryParams } from '../typings/params/JobQueryParams';
import ClientQueryParams from '../typings/params/ClientQueryParams';

import lodash from 'lodash';
import JobAttributes from '../typings/attributes/JobAttributes';
import ClientAttributes from '../typings/attributes/ClientAttributes';
import { dummyService } from '../constants/Dummy';
import { parse } from 'date-fns';

const LOG = new Logger('SyncController.ts');

@Controller('api/sync')
@ClassMiddleware(Authentication.AUTHENTICATED)
@ClassErrorMiddleware(globalErrorHandler)
export class SyncController {
  @Get('jobs')
  @Auth({ module: Modules.JOBS, accessLevel: AccessLevels.VIEW })
  private async getJobs(req: Request<void, void, void, JobQueryParams>, res: Response, next: NextFunction) {
    try {
      const { id } = req.user as JwtPayload;
      const { rows } = await JobService.searchJobsWithPagination(req.query, id);

      const jobs = await Promise.all(lodash.map(rows, obj => JobAttributes.sycnJob(obj)));

      return res.status(OK).json({
        jobs: jobs
      });
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Get('job/:syncId')
  @Auth({ module: Modules.JOBS, accessLevel: AccessLevels.VIEW })
  private async getJob(req: Request, res: Response, next: NextFunction) {
    try {
      const { syncId } = req.params;
      const job = await JobService.getJobBySyncId(Number(syncId));

      return res.status(OK).json(job);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Get('clients')
  @Auth({ module: Modules.CLIENTS, accessLevel: AccessLevels.VIEW })
  private async getClients(req: Request<void, void, void, ClientQueryParams>, res: Response, next: NextFunction) {
    try {
      const { rows } = await ClientService.getAll(req.query);
      const clients = await Promise.all(lodash.map(rows, obj => ClientAttributes.syncClient(obj)));

      return res.status(OK).json({
        clients: clients
      });
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Post('create-service')
  @Auth({ module: Modules.JOBS, accessLevel: AccessLevels.VIEW })
  private async createService(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.user as JwtPayload;
      const { clientName, contactNumber, employeeSyncId, serviceTitle, serviceItemSyncId, price, date, time, endTime, notes, syncId } = req.body;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let client: any = null;

      // 1. Try to find by contact number first
      if (contactNumber) {
        client = await ClientService.getClientByContactPersonNumber(contactNumber);
        if (client) {
          console.log('Client found by contact:', client.name);
        }
      }

      // 2. If not found, fallback to search by client name
      if (!client && clientName) {
        client = await ClientService.getClientByName(clientName);
        if (client) {
          console.log('Client found by name:', client.name);
        }
      }

      // 3. If still not found, handle error (you can adjust this as you like)
      if (!client) {
        console.log('Client not found by contact or name');
        return res.status(400).json({ message: 'Client not found by contact or name' });
      }

      const entity = await EntityService.getLastEntity();
      const userProfile = await UserService.getUserFullDetailsBySyncId(employeeSyncId);
      const serviceItem = await ServiceItemTemplateService.getServiceItemTemplateBySyncId(serviceItemSyncId.toString());

      const startDateTime = parse(`${date} ${time}`, 'MMMM d, yyyy hh:mma', new Date());
      const endDateTime = parse(`${date} ${endTime}`, 'MMMM d, yyyy hh:mma', new Date());

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const service: any = {
        ...dummyService,
        clientId: client.id,
        serviceTitle,
        contractAmount: price,
        totalAmount: price,
        serviceAddressId: client?.ServiceAddresses?.[0]?.id || null,
        serviceAddress: client?.ServiceAddresses?.[0]?.address || '',
        entityId: entity.id,
        entityName: entity.name,
        remarks: notes,
        Schedules: [
          {
            repeatType: 'ADHOC',
            repeatEvery: 1,
            repeatOnDate: 1,
            repeatOnDay: '',
            repeatOnWeek: 0,
            repeatOnMonth: 1,
            repeatEndType: 'AFTER',
            repeatEndAfter: 1,
            repeatEndOnDate: new Date(),
            startDateTime: new Date(startDateTime),
            endDateTime: new Date(endDateTime),
            ServiceItems: [
              {
                ...(dummyService.Schedules?.[0]?.ServiceItems?.[0] || {}),
                id: serviceItem.id,
                name: serviceItem.name,
                description: serviceItem.description,
                quantity: 1,
                unitPrice: serviceItem.unitPrice,
                totalPrice: serviceItem.unitPrice
              }
            ]
          }
        ],
        selectedEmployees: [{ id: userProfile.id }]
      };

      const newService = await ServiceService.createService(service);
      const jobIds = newService.Jobs.map(job => job.id);
      await JobService.updateSyncStatus(jobIds, syncId);

      await AppLogService.createAppLog(id, `Create Quotation from Sync : ${newService.serviceTitle} (#${newService.id})`);
      return res.status(OK).json(newService);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Put('update-job/:jobId')
  @Auth({ module: Modules.JOBS, accessLevel: AccessLevels.VIEW })
  private async updateJob(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.user as JwtPayload;
      const { jobId } = req.params;
      const { syncId, jobStatus, date, time, endTime } = req.body;

      let startDateTime: Date;
      let endDateTime: Date;

      if (date && time && endTime) {
        startDateTime = parse(`${date} ${time}`, 'MMMM d, yyyy hh:mma', new Date());
        endDateTime = parse(`${date} ${endTime}`, 'MMMM d, yyyy hh:mma', new Date());
      }

      await JobService.updateSyncStatus([Number(jobId)], Number(syncId), startDateTime, endDateTime, jobStatus);
      const job = await JobService.getJobBySyncId(Number(syncId));
      await AppLogService.createAppLog(id, `Update Job from Sync : ${jobId} `);
      return res.status(OK).json(job);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }
}
