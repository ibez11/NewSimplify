import { Request, Response, NextFunction } from 'express';
import { Controller, ClassMiddleware, ClassErrorMiddleware, Get, Put, Post } from '../../../overnightjs/core/lib/decorators';
import { OK, NO_CONTENT } from 'http-status-codes';
import Logger from '../../../Logger';
import { Authentication } from '../../../config/passport';
import globalErrorHandler from '../../../globalErrorHandler';
import * as JobService from '../../../services/JobService';
import * as SettingService from '../../../services/SettingService';
import * as AppLogService from '../../../services/AppLogService';
import * as AwsService from '../../../services/AwsService';
import { AccessLevels, Modules } from '../../../database/models/Permission';
import { Auth } from '../../../middleware/authorization';
import { MobileJobResponseModel } from '../../../typings/ResponseFormats';
import { JwtPayload } from '../../../typings/jwtPayload';
import { JobQueryParams } from '../../../typings/params/JobQueryParams';
import JobAttributes from '../../../typings/attributes/JobAttributes';

const LOG = new Logger('AdminMobileJobController.ts');

@Controller('api/mobile/admin/jobs')
@ClassErrorMiddleware(globalErrorHandler)
@ClassMiddleware(Authentication.AUTHENTICATED)
export class AdminMobileJobController {
  // for get job detail based on additional service id
  @Get('additional/:id')
  @Auth({ module: Modules.JOBS, accessLevel: AccessLevels.VIEW })
  private async additional(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const job = await JobService.getJobDetailByAdditionalServiceId(Number(id));

      return res.status(OK).json(job);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  // for notif complete job based on job id
  @Get('notifcompleted/:id')
  @Auth({ module: Modules.JOBS, accessLevel: AccessLevels.VIEW })
  private async notif(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const roleId = 2;

      await JobService.notifCompletedJob(Number(id), roleId);
      return res.sendStatus(NO_CONTENT);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  //for get all jobs by parameter
  @Get('histories')
  @Auth({ module: Modules.JOBS, accessLevel: AccessLevels.VIEW })
  private async getHistories(req: Request<void, void, void, JobQueryParams>, res: Response, next: NextFunction) {
    try {
      const { id } = req.user as JwtPayload;

      req.query.j = '4';
      req.query.fb = '10';

      const { rows } = await JobService.searchJobsWithPagination(req.query, id);
      const jobs: MobileJobResponseModel[] = [];
      if (rows) {
        await Promise.all(
          rows.map(async row => {
            jobs.push({
              jobId: row.jobId,
              jobStatus: row.jobStatus,
              serviceType: row.serviceType,
              startDateTime: new Date(row.startDateTime),
              clientName: row.clientName,
              serviceAddress: row.serviceAddress,
              doneJob: row.doneJob ? Number(row.doneJob) : 0,
              totalJob: row.serviceJobCount ? row.serviceJobCount : 0,
              remarks: row.remarks ? row.remarks : '',
              JobLabels: row.jobLabels ? row.jobLabels : [],
              postalCode: row.postalCode ? row.postalCode : '',
              signature: row.signature ? row.signature : ''
            });
          })
        );
      }

      return res.status(OK).json(jobs);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  // for get last of inprogress job
  @Get('last-inprogress-job')
  private async getLastInProgressJob(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.user as JwtPayload;

      const row = await JobService.getLastInProgressJobByUserProfileId(id);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let result: any = {};
      if (row) {
        result = {
          jobId: row.jobId,
          jobStatus: row.jobStatus,
          clientName: row.clientName,
          serviceType: row.serviceType,
          startDateTime: row.startDateTime
        };
      }
      return res.status(OK).json(result);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  //for get all jobs by parameter
  @Get('')
  @Auth({ module: Modules.JOBS, accessLevel: AccessLevels.VIEW })
  private async getAll(req: Request<void, void, void, JobQueryParams>, res: Response, next: NextFunction) {
    try {
      const { id } = req.user as JwtPayload;

      const { rows } = await JobService.searchJobsWithPagination(req.query, id);
      const jobs: MobileJobResponseModel[] = [];
      if (rows) {
        await Promise.all(
          rows.map(async row => {
            jobs.push({
              jobId: row.jobId,
              jobStatus: row.jobStatus,
              serviceType: row.serviceType,
              startDateTime: new Date(row.startDateTime),
              clientName: row.clientName,
              serviceAddress: row.serviceAddress,
              doneJob: row.doneJob ? Number(row.doneJob) : 0,
              totalJob: row.serviceJobCount ? row.serviceJobCount : 0,
              remarks: row.remarks ? row.remarks : '',
              JobLabels: row.jobLabels ? row.jobLabels : [],
              postalCode: row.postalCode ? row.postalCode : '',
              signature: row.signature ? row.signature : ''
            });
          })
        );
      }

      return res.status(OK).json(jobs);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Get('previousJobsByClient')
  @Auth({ module: Modules.JOBS, accessLevel: AccessLevels.VIEW })
  private async getPreviousJobsByClient(req: Request, res: Response, next: NextFunction) {
    try {
      const jobs = await JobService.getPreviousJobsByClientId(req.query);
      const formattedJobs = await Promise.all(
        jobs.map(async job => {
          return await JobAttributes.previousJobsByClientId(job);
        })
      );
      return res.status(OK).json(formattedJobs);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  //for get job detail based on job id
  @Get(':id')
  @Auth({ module: Modules.JOBS, accessLevel: AccessLevels.VIEW })
  private async get(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const { row } = await JobService.getJobDetailById(Number(id));

      const result = await JobAttributes.toResponseAdminMobile(row);

      return res.status(OK).json(result);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  //for get service item breakdown based on job id
  @Get('price/:id')
  @Auth({ module: Modules.JOBS, accessLevel: AccessLevels.VIEW })
  private async getServiceItemBreakdown(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const { row } = await JobService.getJobDetailById(Number(id));

      const result = await JobAttributes.serviceItemPriceBreakdown(row);

      return res.status(OK).json(result);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  // for update job status, assign technicians, assign vehicles, update job schedule based on job id
  @Put(':jobId')
  @Auth({ module: Modules.JOBS, accessLevel: AccessLevels.EDIT })
  private async editJob(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.user as JwtPayload;
      const { jobId } = req.params;

      req.body.isEditCollectedAmount = false;
      if (req.body.collectedAmount && req.body.collectedAmount > 0) {
        req.body.isEditCollectedAmount = true;
      }

      const editJob = await JobService.editJob(Number(jobId), req.body, Number(id));

      const { row } = editJob;
      if (row.signature) {
        const signedImageUrl = await AwsService.s3BucketGetSignedUrl(row.signature, 'signature');

        row.signatureUrl = String(signedImageUrl);
      }
      row.startDateTimeMobile = new Date(row.startDateTime);
      row.endDateTimeMobile = new Date(row.endDateTime);
      row.startDateTime = new Date(row.startDateTime).toLocaleString();
      row.endDateTime = new Date(row.endDateTime).toLocaleString();
      row.vehicleJobs = row.vehicleJobs ? row.vehicleJobs : [];
      row.employee = row.employee ? row.employee : [];

      const priceVisibility = await SettingService.getSpecificSettings('PRICEVISIBILITY');
      row.priceVisibility = priceVisibility ? priceVisibility.isActive : false;

      await AppLogService.createAppLog(id, `[Admin Mobile] Edit Job : ${jobId}`);
      return res.sendStatus(NO_CONTENT);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  // for get url signature upload
  @Get('signature/:key')
  private async signature(req: Request, res: Response, next: NextFunction) {
    try {
      const { key } = req.params;
      let signatureUrl = '';
      if (key) {
        signatureUrl = await AwsService.s3BucketGetPutSignedUrl(key, 'signature');
      }

      return res.status(OK).json({ signatureUrl });
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  // for add job signature
  @Put('signature/:jobId')
  private async addJobSignature(req: Request, res: Response, next: NextFunction) {
    try {
      const { jobId } = req.params;
      const { signature } = req.body;
      await JobService.addJobSignature(Number(jobId), signature);
      return res.sendStatus(NO_CONTENT);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  // for update service item based on job id
  @Put('serviceitems/:jobId')
  private async updateJobServiceItems(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.user as JwtPayload;
      const { jobId } = req.params;
      const ServiceItems = req.body;

      const { row } = await JobService.updateJobServiceItems(Number(jobId), ServiceItems);
      const result = await JobAttributes.editJobServiceItem(row);
      await AppLogService.createAppLog(id, `[Admin Mobile] Edit Job Service Item : ${jobId}`);
      return res.status(OK).json(result);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }
}
