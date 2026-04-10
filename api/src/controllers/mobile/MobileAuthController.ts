import { Request, Response, NextFunction } from 'express';
import { Controller, Middleware, ClassErrorMiddleware, Post, Get } from '../../overnightjs/core/lib/decorators';
import { NO_CONTENT, OK } from 'http-status-codes';
import uuidv4 from 'uuid/v4';

import Logger from '../../Logger';
import { Authentication } from '../../config/passport';
import User from '../../database/models/User';
import * as AuthService from '../../services/AuthService';
import * as UserService from '../../services/UserService';
import { UserProfileWithPermissionsModel } from '../../typings/UserProfileWithPermissionsModel';
import { PermissionResponseModel } from '../../typings/ResponseFormats';
import globalErrorHandler from '../../globalErrorHandler';
import { JwtPayload } from '../../typings/jwtPayload';
import * as AppLogService from '../../services/AppLogService';

const LOG = new Logger('MobileAuthController.ts');

@Controller('api/mobile')
@ClassErrorMiddleware(globalErrorHandler)
export class MobileAuthController {
  // for login on mobile apps
  @Post('login')
  @Middleware(Authentication.TO_MOBILE_AUTHENTICATE)
  private async mobileLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as User;
      const userId = user.get('id');
      const sessionId: string = uuidv4();
      const [, , userProfile, permissions] = await Promise.all([
        AuthService.resetInvalidLoginCounts(user),
        AuthService.createSession(user, sessionId),
        UserService.getUserFullDetailsById(userId),
        UserService.getUserPermissions(userId)
      ]);

      const mobileUserProfile: UserProfileWithPermissionsModel = userProfile;
      const permissionsResponseModels: PermissionResponseModel[] = permissions.map(permission => permission.toResponseFormat());
      mobileUserProfile.permissions = permissionsResponseModels;

      const { tokenNotification } = req.body;

      if (tokenNotification) {
        const editedUser = await UserService.editUserTokenNotification(mobileUserProfile.id, tokenNotification);

        await AppLogService.createAppLog(mobileUserProfile.id, `[Mobile] Edit User Token : ${editedUser.displayName}`);
      }

      return res.status(OK).json({
        token: AuthService.generateUserJwt(user, permissionsResponseModels, sessionId),
        userId: mobileUserProfile.id,
        role: userProfile.role
      });
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  // for logout on mobile apps
  @Post('logout')
  @Middleware(Authentication.AUTHENTICATED)
  private async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, jti } = req.user as JwtPayload;

      await UserService.editUserTokenNotification(id, null);
      await AuthService.destroySession(id, jti);

      return res.sendStatus(NO_CONTENT);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  // for check contact number is exist or not
  @Post('check-contact')
  private async checkContactNumber(req: Request, res: Response, next: NextFunction) {
    try {
      const { countryCode, contactNumber } = req.body;
      const user = await UserService.checkContactNumber(countryCode, contactNumber);

      return res.status(OK).json({
        isExist: user ? true : false
      });
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }
}
