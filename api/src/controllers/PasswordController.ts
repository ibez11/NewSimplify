import { Request, Response, NextFunction } from 'express';
import { Controller, Middleware, ClassErrorMiddleware, Post } from '../overnightjs/core/lib/decorators';
import { OK } from 'http-status-codes';
import globalErrorHandler from '../globalErrorHandler';
// import { ValidationChain, body } from 'express-validator';
// import ValidationHandler from './ValidationHandler';

import Logger from '../Logger';
import { Authentication } from '../config/passport';
import * as PasswordService from '../services/PasswordService';
import { JwtPayload } from '../typings/jwtPayload';

const LOG = new Logger('PasswordController.ts');

// const changePassValidator: ValidationChain[] = [
//   body('newPassword', 'New password must not be empty')
//     .not()
//     .isEmpty()
// ];

// const resetPassValidator: ValidationChain[] = [
//   body('newPassword', 'New password must not be empty')
//     .not()
//     .isEmpty()
// ];

// const forgotPassValidator: ValidationChain[] = [
//   body('username', 'User name must not be empty')
//     .not()
//     .isEmpty()
// ];

@Controller('api/')
@ClassErrorMiddleware(globalErrorHandler)
export class PasswordController {
  @Post('changepassword')
  @Middleware(Authentication.AUTHENTICATED)
  private async change(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.user as JwtPayload;

      const { newPassword } = req.body;

      await PasswordService.changePassword(id, newPassword);

      return res.status(OK).json({ success: 'OK' });
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Post('forgotpassword')
  private async forgot(req: Request, res: Response, next: NextFunction) {
    try {
      const { username } = req.body;

      await PasswordService.forgotPassword(username);

      return res.status(OK).json({ success: 'OK' });
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Post('resetpassword')
  private async reset(req: Request, res: Response, next: NextFunction) {
    try {
      const { newPassword, jwtParam } = req.body;

      await PasswordService.resetPassword(newPassword, jwtParam);

      return res.status(OK).json({ success: 'OK' });
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }
}
