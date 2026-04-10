import { Request, Response, NextFunction } from 'express';
import { Controller, ClassMiddleware, ClassErrorMiddleware, Get, Put } from '../../overnightjs/core/lib/decorators';
import { OK, NO_CONTENT } from 'http-status-codes';

import Logger from '../../Logger';
import globalErrorHandler from '../../globalErrorHandler';
import { Authentication } from '../../config/passport';
import { JwtPayload } from '../../typings/jwtPayload';
import * as UserService from '../../services/UserService';
import * as TenantService from '../../services/TenantService';
import * as AppLogService from '../../services/AppLogService';
import { MobileUserProfileResponseModel } from '../../typings/ResponseFormats';
import { Auth } from '../../middleware/authorization';
import { Modules, AccessLevels } from '../../database/models/Permission';

const LOG = new Logger('UserController.ts');

@Controller('api/mobile/users')
@ClassMiddleware(Authentication.AUTHENTICATED)
@ClassErrorMiddleware(globalErrorHandler)
export class MobileUserController {
  // for get current user
  @Get('current')
  private async current(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as JwtPayload;

      const [userProfile, tenant] = await Promise.all([UserService.getUserFullDetailsById(user.id), TenantService.getTenant(user.tenant)]);

      const mobileUserProfile = userProfile;

      const currentUser: MobileUserProfileResponseModel = {
        id: mobileUserProfile.id,
        displayName: mobileUserProfile.displayName,
        email: mobileUserProfile.email,
        contactNumber: mobileUserProfile.contactNumber,
        role: mobileUserProfile.role,
        tenant: tenant.name
      };

      return res.status(OK).json(currentUser);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  // for get user detail based on user id
  @Get(':userId')
  private async get(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;

      const user = await UserService.getUserFullDetailsById(Number(userId));

      return res.status(OK).json(user);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  // for update token user
  @Put('token')
  private async token(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.body;
      const { id } = req.user as JwtPayload;

      const editedUser = await UserService.editUserTokenNotification(id, token);

      await AppLogService.createAppLog(id, `[Mobile] Edit User Token : ${editedUser.displayName}`);
      return res.sendStatus(NO_CONTENT);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  // for update contact number of user
  @Put('update-contact')
  @Auth({ module: Modules.USERS, accessLevel: AccessLevels.EDIT })
  private async updateContactNumber(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.user as JwtPayload;
      const { countryCode, contactNumber } = req.body;

      const { user, oldContactNumber } = await UserService.updateContactNumber(id, countryCode, contactNumber);

      await AppLogService.createAppLog(id, `[Mobile] User ${user.displayName} changed Contact Number ${oldContactNumber} to ${contactNumber}`);

      return res.sendStatus(NO_CONTENT);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  // for update user detail based on user id
  @Put(':userId')
  @Auth({ module: Modules.USERS, accessLevel: AccessLevels.EDIT })
  private async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const { displayName, email, newPassword, contactNumber, oldContactNumber, roleId, token, skills } = req.body;

      await UserService.editUser(Number(userId), displayName, email, newPassword, contactNumber, oldContactNumber, roleId, token, skills);

      const { id } = req.user as JwtPayload;
      await AppLogService.createAppLog(id, `[Mobile] Edit User : ${displayName}`);
      return res.sendStatus(NO_CONTENT);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }
}
