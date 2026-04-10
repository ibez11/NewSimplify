import { Request, Response, NextFunction } from 'express';
import { Controller, ClassMiddleware, ClassErrorMiddleware, Get, Post, Put, Delete } from '../overnightjs/core/lib/decorators';
import { OK, NO_CONTENT } from 'http-status-codes';
import Logger from '../Logger';
import { Authentication } from '../config/passport';
import globalErrorHandler from '../globalErrorHandler';
import * as JobService from '../services/JobService';
import * as DistrictService from '../services/DistrictService';
import * as SettingService from '../services/SettingService';
import * as AppLogService from '../services/AppLogService';
import * as AwsService from '../services/AwsService';

import { AccessLevels, Modules } from '../database/models/Permission';
import { Auth } from '../middleware/authorization';

import { JwtPayload } from '../typings/jwtPayload';
import { JobQueryParams } from '../typings/params/JobQueryParams';

import lodash from 'lodash';
import JobAttributes from '../typings/attributes/JobAttributes';

const LOG = new Logger('JobController.ts');

@Controller('api/jobs')
@ClassMiddleware(Authentication.AUTHENTICATED)
@ClassErrorMiddleware(globalErrorHandler)
export class JobController {
  @Get('')
  @Auth({ module: Modules.JOBS, accessLevel: AccessLevels.VIEW })
  private async getAll(req: Request<void, void, void, JobQueryParams>, res: Response, next: NextFunction) {
    try {
      const { id } = req.user as JwtPayload;
      const { rows, count } = await JobService.searchJobsWithPagination(req.query, id);
      const jobs = lodash.map(rows, obj => lodash.pick(obj, JobAttributes.getAll));
      return res.status(OK).json({
        count,
        jobs: jobs
      });
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Get('summarycount')
  private async summaryJobCount(req: Request, res: Response, next: NextFunction) {
    try {
      const jobCount = await JobService.summaryJobCount();

      return res.status(OK).json(jobCount);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Get('last')
  @Auth({ module: Modules.INVOICES, accessLevel: AccessLevels.VIEW })
  private async getLastJob(req: Request, res: Response, next: NextFunction) {
    try {
      const lastJob = await JobService.getLastJob();

      return res.status(OK).json(lastJob);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Get('exportCsv')
  @Auth({ module: Modules.JOBS, accessLevel: AccessLevels.VIEW })
  private async exportCsv(req: Request<void, void, void, JobQueryParams>, res: Response, next: NextFunction) {
    try {
      const rows = await JobService.exportCsv(req.query);

      return res.status(OK).json({ jobs: rows });
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Get('columnfilter')
  private async column(req: Request, res: Response, next: NextFunction) {
    try {
      const { employes, vehicles } = await JobService.searchJobsWithColumnFilter();
      const { rows } = await DistrictService.searchDistrictWithPagination(req.query);
      return res.status(OK).json({
        employes,
        vehicles,
        districts: rows
      });
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Get('infojob')
  private async infojob(
    req: Request<void, void, void, { startDate: string; endDate: string; jobStatus: string }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const jobsInfo = await JobService.jobInformation();

      return res.status(OK).json(jobsInfo);
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
      return res.status(OK).json({ jobs: formattedJobs, count: jobs.length });
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

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

  @Get(':id')
  @Auth({ module: Modules.JOBS, accessLevel: AccessLevels.VIEW })
  private async get(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const { row } = await JobService.getJobDetailById(Number(id));

      const result = JobAttributes.toResponseWeb(row);

      return res.status(OK).json({ job: result });
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Get('export/:id')
  private async export(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const result = await JobService.exportPdf(Number(id));

      res.set({ 'Content-type': 'application/pdf', 'Content-Length': result.length });
      return res.send(result);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Put(':jobId')
  @Auth({ module: Modules.JOBS, accessLevel: AccessLevels.EDIT })
  private async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.user as JwtPayload;
      const { jobId } = req.params;

      req.body.isEditCollectedAmount = false;
      if (req.body.collectedAmount && req.body.collectedAmount > 0) {
        req.body.isEditCollectedAmount = true;
      }

      const { row } = await JobService.editJob(Number(jobId), req.body, Number(id));
      const result = JobAttributes.toResponseWeb(row);

      await AppLogService.createAppLog(id, `Edit Job : ${jobId} - ${row.jobStatus}`);
      return res.status(OK).json({ job: result });
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

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

  @Delete(':jobId')
  @Auth({ module: Modules.JOBS, accessLevel: AccessLevels.DELETE })
  private async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { jobId } = req.params;
      await JobService.deleteJob(jobId.split(',').map(t => parseInt(t)));

      const { id } = req.user as JwtPayload;
      await AppLogService.createAppLog(id, `Delete Job : ${jobId}`);

      return res.sendStatus(NO_CONTENT);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Post('exportSchedule')
  private async exportSchedule(req: Request, res: Response, next: NextFunction) {
    try {
      const { scheduleDate, vi, ei, isRemarksShow, isNotesShow } = req.body;

      const result = await JobService.exportSchedule(scheduleDate, vi, ei, isRemarksShow, isNotesShow);

      const remarksSchedule = await SettingService.getSpecificSettings('REMARKSSCHEDULE');
      if (!(isRemarksShow === remarksSchedule.isActive)) {
        await SettingService.editSetting(remarksSchedule.id, '', isRemarksShow);
      }

      const noteSchedule = await SettingService.getSpecificSettings('NOTESCHEDULE');
      if (!(isNotesShow === noteSchedule.isActive)) {
        await SettingService.editSetting(noteSchedule.id, '', isNotesShow);
      }

      res.set({ 'Content-Type': 'application/pdf', 'Content-Length': result.length });

      return res.send(result);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Post('assignContract')
  private async assignContract(req: Request, res: Response, next: NextFunction) {
    try {
      await JobService.assignContract(req.body);

      return res.status(OK).json(NO_CONTENT);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Put('jobServiceItems/:jobId')
  private async updateJobServiceItems(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.user as JwtPayload;
      const { jobId } = req.params;
      const { ServiceItems } = req.body;

      const { row } = await JobService.updateJobServiceItems(Number(jobId), ServiceItems);
      const result = JobAttributes.toResponseWeb(row);

      await AppLogService.createAppLog(id, `Edit Job Service Item : ${jobId}`);
      return res.status(OK).json({ job: result });
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Put('cancelJob/:id')
  private async cancelJob(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { isRecalculate } = req.body;

      const updatedJob = await JobService.cancelJob(Number(id), isRecalculate);

      return res.status(OK).json(updatedJob);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Post('sendEmail/:jobId')
  @Auth({ module: Modules.INVOICES, accessLevel: AccessLevels.VIEW })
  private async sendEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { jobId } = req.params;
      const { contactEmail } = req.body;

      await JobService.sendEmail(Number(jobId), contactEmail);

      return res.sendStatus(NO_CONTENT);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  // @Post('previousJobsByClient')
  // @Auth({ module: Modules.JOBS, accessLevel: AccessLevels.VIEW })
  // private async getPreviousJobsByClient(req: Request, res: Response, next: NextFunction) {
  //   try {
  //     const { clientId, excludeJobId, j, s, l } = req.body;

  //     const jobs = await JobService.getPreviousJobsByClientId(clientId, excludeJobId, j);

  //     return res.status(OK).json({ jobs });
  //   } catch (err) {
  //     LOG.error(err);
  //     return next(err);
  //   }
  // }
}
