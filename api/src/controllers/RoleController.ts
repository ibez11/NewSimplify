import { Request, Response, NextFunction } from 'express';
import { Controller, ClassMiddleware, Get, Post, Put, Delete, ClassErrorMiddleware } from '../overnightjs/core/lib/decorators';

import Logger from '../Logger';
import { Authentication } from '../config/passport';
import * as RoleService from '../services/RoleService';
import * as AppLogService from '../services/AppLogService';
import { NO_CONTENT, OK } from 'http-status-codes';
import globalErrorHandler from '../globalErrorHandler';
import { JwtPayload } from '../typings/jwtPayload';

const LOG = new Logger('RoleController.ts');

@Controller('api/roles')
@ClassMiddleware(Authentication.AUTHENTICATED)
@ClassErrorMiddleware(globalErrorHandler)
export class RoleController {
  @Get('')
  private async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { count, rows } = await RoleService.searchRolesWithPagination(req.query);

      return res.status(OK).json({ count: count, roles: rows });
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Get('access-settings')
  private async getAccessSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const accessSettings = await RoleService.getAccessSettings();

      return res.status(OK).json(accessSettings);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Get(':roleId')
  private async get(req: Request, res: Response, next: NextFunction) {
    try {
      const { roleId } = req.params;
      const role = await RoleService.getRoleById(Number(roleId));

      return res.status(OK).json(role);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Post('')
  private async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.user as JwtPayload;

      const newRole = await RoleService.createRole(req.body);
      await AppLogService.createAppLog(id, `Create Role : ${newRole.name}`);
      return res.status(OK).json(newRole);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Put(':roleId')
  private async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { roleId } = req.params;
      const { id } = req.user as JwtPayload;

      const editedRole = await RoleService.editRole(Number(roleId), req.body);
      await AppLogService.createAppLog(id, `Edit Role : ${editedRole.name}`);
      return res.status(OK).json(editedRole);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Delete(':roleId')
  private async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { roleId } = req.params;
      const { id } = req.user as JwtPayload;
      const { reason } = req.body;

      const deletedRole = await RoleService.getRoleById(Number(roleId));
      await RoleService.deleteRole(Number(roleId));

      await AppLogService.createAppLog(id, `Delete Role : ${deletedRole.name} (#${roleId})` + (reason ? `, reason: ${reason}` : ''));
      return res.sendStatus(NO_CONTENT);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }
}
