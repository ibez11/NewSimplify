import { Request, Response, NextFunction } from 'express';
import { Controller, Middleware, ClassErrorMiddleware, Get } from '../overnightjs/core/lib/decorators';
import { OK } from 'http-status-codes';

import Logger from '../Logger';
import { Authentication } from '../config/passport';
import globalErrorHandler from '../globalErrorHandler';
import * as ReportService from '../services/ReportService';

const LOG = new Logger('ReportController.ts');

interface ReportQueryParams {
  sd?: string; // start date
  ed?: string; // end date
  js?: string; // jobStatus
  tc?: number; // selected technician
  vh?: number; // selected vehicle
  cp?: number; // is comparation or not
}

@Controller('api/reports')
@ClassErrorMiddleware(globalErrorHandler)
export class ReportController {
  @Get('jobs')
  @Middleware(Authentication.AUTHENTICATED)
  private async jobs(req: Request<void, void, void, ReportQueryParams>, res: Response, next: NextFunction) {
    try {
      const { sd, ed, tc, vh, js, cp } = req.query;

      const jobs = await ReportService.getJobsReports(sd, ed, tc, vh, js, cp);

      return res.status(OK).json(jobs);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Get('value-jobs')
  @Middleware(Authentication.AUTHENTICATED)
  private async valueJobs(req: Request<void, void, void, ReportQueryParams>, res: Response, next: NextFunction) {
    try {
      const { sd, ed, tc, vh, js, cp } = req.query;

      const jobs = await ReportService.getValueJobsReports(sd, ed, tc, vh, js, cp);

      return res.status(OK).json(jobs);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Get('revenue')
  @Middleware(Authentication.AUTHENTICATED)
  private async revenue(req: Request<void, void, void, ReportQueryParams>, res: Response, next: NextFunction) {
    try {
      const { sd, ed, cp } = req.query;

      const revenue = await ReportService.getRevenueReports(sd, ed, cp);

      return res.status(OK).json(revenue);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Get('renewal')
  @Middleware(Authentication.AUTHENTICATED)
  private async renewal(req: Request<void, void, void, ReportQueryParams>, res: Response, next: NextFunction) {
    try {
      return res.status(OK).json({});
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Get('popular-contracts')
  @Middleware(Authentication.AUTHENTICATED)
  private async contracts(req: Request<void, void, void, ReportQueryParams>, res: Response, next: NextFunction) {
    try {
      const { sd, ed } = req.query;

      const contracts = await ReportService.getPopularContractsReports(sd, ed);

      return res.status(OK).json(contracts);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Get('popular-items')
  @Middleware(Authentication.AUTHENTICATED)
  private async items(req: Request<void, void, void, ReportQueryParams>, res: Response, next: NextFunction) {
    try {
      const { sd, ed } = req.query;

      const serviceItems = await ReportService.getPopularServiceItemsReports(sd, ed);

      return res.status(OK).json(serviceItems);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Get('overview')
  @Middleware(Authentication.AUTHENTICATED)
  private async overview(req: Request<void, void, void, ReportQueryParams>, res: Response, next: NextFunction) {
    try {
      const { sd } = req.query;

      const overview = await ReportService.getOverviewReports(sd);

      return res.status(OK).json(overview);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }
}
