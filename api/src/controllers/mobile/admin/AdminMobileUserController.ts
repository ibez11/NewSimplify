import { Request, Response, NextFunction } from 'express';
import { Controller, ClassMiddleware, ClassErrorMiddleware, Get, Put } from '../../../overnightjs/core/lib/decorators';
import { NO_CONTENT, OK } from 'http-status-codes';

import Logger from '../../../Logger';
import globalErrorHandler from '../../../globalErrorHandler';
import { Authentication } from '../../../config/passport';
import * as UserService from '../../../services/UserService';
import * as TenantService from '../../../services/TenantService';
import * as AppLogService from '../../../services/AppLogService';
import { PaginationQueryParams } from '../../../typings/params/PaginationQueryParams';
import _ from 'lodash';
import { JwtPayload } from '../../../typings/jwtPayload';
import { MobileUserProfileResponseModel } from '../../../typings/ResponseFormats';
import { Modules, AccessLevels } from '../../../database/models/Permission';
import { Auth } from '../../../middleware/authorization';

const LOG = new Logger('AdminMobileUserController.ts');

@Controller('api/mobile/admin/users')
@ClassMiddleware(Authentication.AUTHENTICATED)
@ClassErrorMiddleware(globalErrorHandler)
export class AdminMobileUserController {
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
        countryCode: mobileUserProfile.countryCode,
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

  @Get('active-technician')
  private async technician(req: Request<void, void, void, PaginationQueryParams>, res: Response, next: NextFunction) {
    try {
      const activeUsers = await UserService.getActiveTechnicians();
      const result = activeUsers ? activeUsers.map(val => _.omit(val, ['UserSkills'])) : [];

      return res.status(OK).json(result);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Get('active-employee')
  private async active(req: Request<void, void, void, PaginationQueryParams>, res: Response, next: NextFunction) {
    try {
      const activeUsers = await UserService.getActiveUsers();
      const result = activeUsers ? activeUsers.map(val => _.omit(val, ['UserSkills'])) : [];

      return res.status(OK).json(result);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Put('update-contact')
  @Auth({ module: Modules.USERS, accessLevel: AccessLevels.EDIT })
  private async updateContactNumber(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.user as JwtPayload;
      const { countryCode, contactNumber } = req.body;

      const { user, oldContactNumber } = await UserService.updateContactNumber(id, countryCode, contactNumber);

      await AppLogService.createAppLog(id, `[Admin Mobile] User ${user.displayName} changed Contact Number ${oldContactNumber} to ${contactNumber}`);

      return res.sendStatus(NO_CONTENT);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Put(':userId')
  @Auth({ module: Modules.USERS, accessLevel: AccessLevels.EDIT })
  private async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const { displayName, email, newPassword, contactNumber, oldContactNumber, roleId, token, skills } = req.body;

      await UserService.editUser(Number(userId), displayName, email, newPassword, contactNumber, oldContactNumber, roleId, token, skills);

      const { id } = req.user as JwtPayload;
      await AppLogService.createAppLog(id, `[Admin Mobile] Edit User : ${displayName}`);
      return res.sendStatus(NO_CONTENT);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }
}
