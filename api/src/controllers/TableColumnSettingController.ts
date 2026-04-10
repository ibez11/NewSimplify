import { Request, Response, NextFunction } from 'express';
import { Controller, ClassMiddleware, Get, Post, Put, ClassErrorMiddleware } from '../overnightjs/core/lib/decorators';

import Logger from '../Logger';
import { Authentication } from '../config/passport';
import * as TableColumnSettingService from '../services/TableColumnSettingService';
import * as AppLogService from '../services/AppLogService';

import { AccessLevels, Modules } from '../database/models/Permission';
import { Auth } from '../middleware/authorization';
import { JwtPayload } from '../typings/jwtPayload';
import { OK } from 'http-status-codes';
import globalErrorHandler from '../globalErrorHandler';

const LOG = new Logger('TableColumnSettingController.ts');

@Controller('api/tableColumnSettings')
@ClassMiddleware(Authentication.AUTHENTICATED)
@ClassErrorMiddleware(globalErrorHandler)
export class TableColumnSettingController {
  @Get(':tableName')
  @Auth({ module: Modules.SETTING, accessLevel: AccessLevels.VIEW })
  private async getTableName(req: Request, res: Response, next: NextFunction) {
    try {
      const { tableName } = req.params;

      const setting = await TableColumnSettingService.getSpecificTableColumnSettings(tableName);

      return res.status(OK).json(setting);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Get('')
  @Auth({ module: Modules.SETTING, accessLevel: AccessLevels.VIEW })
  private async get(req: Request, res: Response, next: NextFunction) {
    try {
      const setting = await TableColumnSettingService.getTableColumnSettings();

      return res.status(OK).json(setting);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Post('')
  @Auth({ module: Modules.TABLECOLUMNSETTING, accessLevel: AccessLevels.CREATE })
  private async add(req: Request, res: Response, next: NextFunction) {
    try {
      const { tableName, column } = req.body;

      const newTableColumnSettings = await TableColumnSettingService.createTableCloumnSetting(tableName, column);

      const { id } = req.user as JwtPayload;
      await AppLogService.createAppLog(id, `Create Table Column Setting : ${tableName}`);
      return res.status(OK).json(newTableColumnSettings);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Put(':tableSettingId')
  @Auth({ module: Modules.TABLECOLUMNSETTING, accessLevel: AccessLevels.EDIT })
  private async edit(req: Request, res: Response, next: NextFunction) {
    try {
      const { tableSettingId } = req.params;
      const { tableName, column } = req.body;
      const editedTableColumnSetting = await TableColumnSettingService.editTableCloumnSetting(Number(tableSettingId), tableName, column);

      const { id } = req.user as JwtPayload;
      await AppLogService.createAppLog(id, `Update Table Column Setting : ${editedTableColumnSetting.tableName}`);

      return res.status(OK).json(editedTableColumnSetting);
    } catch (error) {
      LOG.error(error);
      return next(error);
    }
  }
}
