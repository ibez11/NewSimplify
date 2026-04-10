import { Request, Response, NextFunction } from 'express';
import { Controller, ClassMiddleware, ClassErrorMiddleware, Get, Post, Put, Delete } from '../overnightjs/core/lib/decorators';
import { OK, NO_CONTENT } from 'http-status-codes';
// import { ValidationChain, body } from 'express-validator';
// import ValidationHandler from './ValidationHandler';

import Logger from '../Logger';
import globalErrorHandler from '../globalErrorHandler';
import { Authentication } from '../config/passport';
import { JwtPayload } from '../typings/jwtPayload';
import * as UserService from '../services/UserService';
import * as TenantService from '../services/TenantService';
import * as AppLogService from '../services/AppLogService';
import * as SettingService from '../services/SettingService';
import * as RoleService from '../services/RoleService';
import { UserProfileWithPermissionsModel } from '../typings/UserProfileWithPermissionsModel';
import { Auth } from '../middleware/authorization';
import { Modules, AccessLevels } from '../database/models/Permission';

const LOG = new Logger('UserController.ts');

// const createUserValidator: ValidationChain[] = [
//   body('displayName', 'Display Name must not be empty')
//     .not()
//     .isEmpty(),
//   body('email', 'Email must not be empty and is correct format')
//     .not()
//     .isEmpty()
//     .isEmail(),
//   body('contactNumber', 'Contact Number must not be empty')
//     .not()
//     .isEmpty(),
//   body('roleId', 'Role must not be empty')
//     .not()
//     .isEmpty()
// ];

// const editUserValidator: ValidationChain[] = [
//   body('email', 'Invalid email format')
//     .optional()
//     .isEmail()
// ];

// const editTokenNotificationValidator: ValidationChain[] = [
//   body('token', 'Token must not be empty')
//     .not()
//     .isEmpty()
// ];

// const VerifyCurrentUserPasswordValidator: ValidationChain[] = [
//   body('password', 'Password must not be empty')
//     .not()
//     .isEmpty()
// ];

interface SearchUserQueryParams {
  s: number;
  l?: number;
  q?: string;
  role?: string;
  order?: string;
}

interface SearchTechnicianQueryParams {
  s?: string;
  postalCode?: string;
  fs?: boolean;
  fp?: boolean;
}

@Controller('api/users')
@ClassMiddleware(Authentication.AUTHENTICATED)
@ClassErrorMiddleware(globalErrorHandler)
export class UserController {
  @Get('current')
  private async current(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as JwtPayload;

      const [userProfile, tenant, jobHistoriesVisibility] = await Promise.all([
        UserService.getUserFullDetailsById(user.id),
        TenantService.getTenant(user.tenant),
        SettingService.getSpecificSettings('JOBHISTORIESVISIBILITY')
      ]);

      const userProfileWithPermissionsModel: UserProfileWithPermissionsModel = userProfile;
      userProfileWithPermissionsModel.permissions = user.permissions;
      userProfileWithPermissionsModel.tenant = tenant.name;
      userProfileWithPermissionsModel.tenantExpDate = tenant.subscriptExpDate;
      userProfileWithPermissionsModel.jobHistoryVisibility = jobHistoriesVisibility.isActive;
      userProfileWithPermissionsModel.clientEmailRemider = tenant.emailService;
      userProfileWithPermissionsModel.syncApp = tenant.syncApp;
      userProfileWithPermissionsModel.roleGrants = await RoleService.getRoleGrantByRoleId(userProfile.roleId);
      userProfileWithPermissionsModel.isBookingEnabled = tenant.isBookingEnabled;

      return res.status(OK).json(userProfileWithPermissionsModel);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Get('active')
  private async active(req: Request, res: Response, next: NextFunction) {
    try {
      const activeUsers = await UserService.getActiveUsers();

      return res.status(OK).json({
        activeUsers
      });
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Get('activeTechnician')
  private async technician(req: Request<void, void, void, SearchTechnicianQueryParams>, res: Response, next: NextFunction) {
    try {
      const { s } = req.query;

      const activeUsers = await UserService.getActiveTechnicians(s);

      return res.status(OK).json({
        activeUsers
      });
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

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

  @Get('')
  @Auth({ module: Modules.USERS, accessLevel: AccessLevels.VIEW })
  private async getAll(req: Request<void, void, void, SearchUserQueryParams>, res: Response, next: NextFunction) {
    try {
      const { s, l, q, role, order } = req.query;

      const { rows, count } = await UserService.searchUsersWithPagination(s, l, q, role, order);

      return res.status(OK).json({
        count,
        users: rows
      });
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Post('currentPassword')
  private async updatePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as JwtPayload;
      const { password } = req.body;

      const currentUser = await UserService.getVerifyCurrentPasswordUser(user.id, password);

      return res.status(OK).json(currentUser);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Post(':userId/activate')
  @Auth({ module: Modules.USERS, accessLevel: AccessLevels.EDIT })
  private async activate(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const editedUser = await UserService.getUserFullDetailsById(Number(userId));

      await UserService.activateUser(Number(userId));

      const { id } = req.user as JwtPayload;
      await AppLogService.createAppLog(id, `Activated User : ${editedUser.displayName}`);
      return res.sendStatus(NO_CONTENT);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Post(':userId/unlock')
  @Auth({ module: Modules.USERS, accessLevel: AccessLevels.EDIT })
  private async unlock(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const editedUser = await UserService.getUserFullDetailsById(Number(userId));

      await UserService.unlockUser(Number(userId));

      const { id } = req.user as JwtPayload;
      await AppLogService.createAppLog(id, `Unlock User : ${editedUser.displayName}`);
      return res.sendStatus(NO_CONTENT);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Post('')
  @Auth({ module: Modules.USERS, accessLevel: AccessLevels.CREATE })
  private async add(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenant } = req.user as JwtPayload;
      const { displayName, email, password, countryCode, contactNumber, roleId, skills, homeDistrict, homePostalCode } = req.body;

      const newUser = await UserService.createUser(
        displayName,
        email,
        password,
        countryCode,
        contactNumber,
        roleId,
        tenant,
        skills,
        homeDistrict,
        homePostalCode
      );

      const { id } = req.user as JwtPayload;
      await AppLogService.createAppLog(id, `Create User : ${displayName}`);
      return res.status(OK).json(newUser);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Put('token')
  private async token(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.body;
      const { id } = req.user as JwtPayload;

      const editedUser = await UserService.editUserTokenNotification(id, token);

      await AppLogService.createAppLog(id, `Edit User Token : ${editedUser.displayName}`);
      return res.status(OK).json(editedUser);
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

      await AppLogService.createAppLog(id, `User ${user.displayName} changed Contact Number ${oldContactNumber} to ${contactNumber}`);

      return res.status(OK).json(user);
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
      const {
        displayName,
        email,
        newPassword,
        countryCode,
        contactNumber,
        oldContactNumber,
        roleId,
        token,
        skills,
        homeDistrict,
        homePostalCode
      } = req.body;

      const editedUser = await UserService.editUser(
        Number(userId),
        displayName,
        email,
        newPassword,
        countryCode,
        contactNumber,
        oldContactNumber,
        roleId,
        token,
        skills,
        homeDistrict,
        homePostalCode
      );

      const { id } = req.user as JwtPayload;
      await AppLogService.createAppLog(id, `Edit User : ${displayName}`);
      return res.status(OK).json(editedUser);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Delete(':userId')
  @Auth({ module: Modules.USERS, accessLevel: AccessLevels.DELETE })
  private async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const editedUser = await UserService.getUserFullDetailsById(Number(userId));

      await UserService.deactivateUser(Number(userId));

      const { id } = req.user as JwtPayload;
      await AppLogService.createAppLog(id, `Deactivated User : ${editedUser.displayName}`);
      return res.sendStatus(NO_CONTENT);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }
}
