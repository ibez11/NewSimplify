import { Request, Response, NextFunction } from 'express';
import { Controller, Middleware, ClassErrorMiddleware, Post } from '../overnightjs/core/lib/decorators';
import { OK } from 'http-status-codes';
import uuidv4 from 'uuid/v4';

import Logger from '../Logger';
import { Authentication } from '../config/passport';
import User from '../database/models/User';
import * as AuthService from '../services/AuthService';
import * as UserService from '../services/UserService';
import * as TenantService from '../services/TenantService';
import * as SettingService from '../services/SettingService';
import * as RoleService from '../services/RoleService';
import { UserProfileWithPermissionsModel } from '../typings/UserProfileWithPermissionsModel';
import { PermissionResponseModel } from '../typings/ResponseFormats';
import globalErrorHandler from '../globalErrorHandler';
import { JwtPayload } from '../typings/jwtPayload';

const LOG = new Logger('AuthController.ts');

@Controller('api/')
@ClassErrorMiddleware(globalErrorHandler)
export class AuthController {
  @Post('login')
  @Middleware(Authentication.TO_AUTHENTICATE)
  private async login(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as User;
      const userId = user.get('id');
      const tenantKey = user.get('TenantKey');
      const sessionId: string = uuidv4();
      const [, , tenant, userProfile, permissions, jobHistoriesVisibility, waIsActive, emailIsActive] = await Promise.all([
        AuthService.resetInvalidLoginCounts(user),
        AuthService.createSession(user, sessionId),
        TenantService.getTenant(tenantKey),
        UserService.getUserFullDetailsById(userId),
        UserService.getUserPermissions(userId),
        SettingService.getSpecificSettings('JOBHISTORIESVISIBILITY'),
        SettingService.getSpecificSettings('WHATSAPPNOTIFICATION'),
        SettingService.getSpecificSettings('EMAILNOTIFICATION')
      ]);

      const userProfileWithPermissionsModel: UserProfileWithPermissionsModel = userProfile;
      const permissionsResponseModels: PermissionResponseModel[] = permissions.map(permission => permission.toResponseFormat());
      const tenantName = tenant.name;
      userProfileWithPermissionsModel.permissions = permissionsResponseModels;
      userProfileWithPermissionsModel.tenant = tenantName;
      userProfileWithPermissionsModel.tenantExpDate = tenant.subscriptExpDate;
      userProfileWithPermissionsModel.jobHistoryVisibility = jobHistoriesVisibility.isActive;
      userProfileWithPermissionsModel.clientWAReminder = waIsActive.isActive;
      userProfileWithPermissionsModel.clientEmailRemider = emailIsActive.isActive;
      userProfileWithPermissionsModel.syncApp = tenant.syncApp;
      userProfileWithPermissionsModel.roleGrants = await RoleService.getRoleGrantByRoleId(userProfile.roleId);
      userProfileWithPermissionsModel.isBookingEnabled = tenant.isBookingEnabled;

      return res.status(OK).json({
        token: AuthService.generateUserJwt(user, permissionsResponseModels, sessionId),
        currentUser: userProfileWithPermissionsModel
      });
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Post('mobile-login')
  @Middleware(Authentication.TO_MOBILE_AUTHENTICATE)
  private async mobileLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as User;
      const userId = user.get('id');
      const tenantKey = user.get('TenantKey');
      const sessionId: string = uuidv4();
      const [, , tenant, userProfile, permissions, jobHistoriesVisibility] = await Promise.all([
        AuthService.resetInvalidLoginCounts(user),
        AuthService.createSession(user, sessionId),
        TenantService.getTenant(tenantKey),
        UserService.getUserFullDetailsById(userId),
        UserService.getUserPermissions(userId),
        SettingService.getSpecificSettings('JOBHISTORIESVISIBILITY')
      ]);

      const userProfileWithPermissionsModel: UserProfileWithPermissionsModel = userProfile;
      const permissionsResponseModels: PermissionResponseModel[] = permissions.map(permission => permission.toResponseFormat());
      const tenantName = tenant.name;
      userProfileWithPermissionsModel.permissions = permissionsResponseModels;
      userProfileWithPermissionsModel.tenant = tenantName;
      userProfileWithPermissionsModel.tenantExpDate = tenant.subscriptExpDate;
      userProfileWithPermissionsModel.jobHistoryVisibility = jobHistoriesVisibility.isActive;

      return res.status(OK).json({
        token: AuthService.generateUserJwt(user, permissionsResponseModels, sessionId),
        currentUser: userProfileWithPermissionsModel
      });
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Post('logout')
  @Middleware(Authentication.AUTHENTICATED)
  private async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, jti } = req.user as JwtPayload;

      await UserService.editUserTokenNotification(id, null);
      await AuthService.destroySession(id, jti);

      return res.status(OK).json({ success: 'OK' });
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Post('checkContactNumber')
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
