import { Request, Response, NextFunction } from 'express';
import { Controller, Middleware, ClassErrorMiddleware, Get, Post } from '../overnightjs/core/lib/decorators';
import { OK } from 'http-status-codes';
import Logger from '../Logger';
import { Authentication } from '../config/passport';
import * as RatingService from '../services/RatingService';
import * as AppLogService from '../services/AppLogService';
import globalErrorHandler from '../globalErrorHandler';
import { AccessLevels, Modules } from '../database/models/Permission';
import { Auth } from '../middleware/authorization';
import { JwtPayload } from '../typings/jwtPayload';

const LOG = new Logger('RatingController.ts');

interface RatingQueryParams {
  sd?: string; // start date
  ed?: string; // end date
  tc?: number; //technician id
}

@Controller('api/ratings')
@ClassErrorMiddleware(globalErrorHandler)
export class RatingController {
  @Get('feedbacks')
  @Middleware(Authentication.AUTHENTICATED)
  private async feedbacks(req: Request<void, void, void, RatingQueryParams>, res: Response, next: NextFunction) {
    try {
      const { sd, ed } = req.query;

      const feedbacks = await RatingService.getFeedbackCustomer(sd, ed);

      return res.status(OK).json(feedbacks);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Get('company-rating')
  @Middleware(Authentication.AUTHENTICATED)
  private async companyRating(req: Request<void, void, void, RatingQueryParams>, res: Response, next: NextFunction) {
    try {
      const { sd, ed } = req.query;

      const jobs = await RatingService.getCompanyRating(sd, ed);

      return res.status(OK).json(jobs);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Get('technician-rating')
  @Middleware(Authentication.AUTHENTICATED)
  private async technicianRating(req: Request<void, void, void, RatingQueryParams>, res: Response, next: NextFunction) {
    try {
      const { sd, ed, tc } = req.query;

      const technicianRating = await RatingService.getTechnicianRating(sd, ed, tc);

      return res.status(OK).json(technicianRating);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Post('')
  @Middleware(Authentication.AUTHENTICATED)
  @Auth({ module: Modules.RATINGS, accessLevel: AccessLevels.CREATE })
  private async add(req: Request, res: Response, next: NextFunction) {
    try {
      const { feedback, rate, jobId } = req.body;
      const newFeedback = await RatingService.createFeedback(feedback, rate, jobId);

      const { id } = req.user as JwtPayload;
      await AppLogService.createAppLog(id, `Create new feedback for job id: ${jobId}`);
      return res.status(OK).json(newFeedback);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }
}
