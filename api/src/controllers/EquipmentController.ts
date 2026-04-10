import { Request, Response, NextFunction } from 'express';
import { Controller, ClassMiddleware, ClassErrorMiddleware, Get, Post, Put, Delete } from '../overnightjs/core/lib/decorators';
import { OK, NO_CONTENT } from 'http-status-codes';

import Logger from '../Logger';
import { Authentication } from '../config/passport';
import * as EquipmentService from '../services/EquipmentService';
import * as AppLogService from '../services/AppLogService';
import { AccessLevels, Modules } from '../database/models/Permission';
import { Auth } from '../middleware/authorization';
import { JwtPayload } from '../typings/jwtPayload';
import globalErrorHandler from '../globalErrorHandler';
import EquipmentAttributes from '../typings/attributes/EquipmentAttributes';
import { EquipmentQueryParam } from '../typings/params/EquipmentQueryParam';

const LOG = new Logger('EquipmentController.ts');

@Controller('api/equipments')
@ClassMiddleware(Authentication.AUTHENTICATED)
@ClassErrorMiddleware(globalErrorHandler)
export class EquipmentController {
  @Get('')
  @Auth({ module: Modules.EQUIPMENTS, accessLevel: AccessLevels.VIEW })
  private async getAll(req: Request<void, void, void, EquipmentQueryParam>, res: Response, next: NextFunction) {
    try {
      const { rows, count } = await EquipmentService.searchEquipmentWithPagination(req.query);

      return res.status(OK).json({
        count,
        equipments: rows
      });
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Get('exportcsv')
  @Auth({ module: Modules.EQUIPMENTS, accessLevel: AccessLevels.VIEW })
  private async exportCsv(req: Request<void, void, void, EquipmentQueryParam>, res: Response, next: NextFunction) {
    try {
      const equiments = await EquipmentService.exportCsv(req.query);

      return res.status(OK).json({
        equipments: equiments
      });
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Get(':id')
  @Auth({ module: Modules.EQUIPMENTS, accessLevel: AccessLevels.VIEW })
  private async get(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const equipment = await EquipmentService.getEquipmentDetailById(Number(id));

      return res.status(OK).json({
        equipment
      });
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Post('')
  @Auth({ module: Modules.EQUIPMENTS, accessLevel: AccessLevels.CREATE })
  private async add(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.user as JwtPayload;
      req.body.updatedBy = id;

      const newEquipment = await EquipmentService.createEquipment(req.body);
      await AppLogService.createAppLog(id, `Create Equipment: ${newEquipment.brand} - ${newEquipment.serialNumber}`);
      return res.status(OK).json(newEquipment);
    } catch (err) {
      return next(err);
    }
  }

  @Post('subequipments')
  @Auth({ module: Modules.EQUIPMENTS, accessLevel: AccessLevels.CREATE })
  private async addSubEquipments(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.user as JwtPayload;

      const { mainId, SubEquipments } = req.body;
      const newEquipment = await EquipmentService.createSubEquipments(mainId, SubEquipments, id);
      await AppLogService.createAppLog(id, `Create Sub Equiment`);
      return res.status(OK).json(newEquipment);
    } catch (err) {
      return next(err);
    }
  }

  @Put(':equipmentId')
  @Auth({ module: Modules.EQUIPMENTS, accessLevel: AccessLevels.EDIT })
  private async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { equipmentId } = req.params;
      const { id } = req.user as JwtPayload;
      req.body.updatedBy = id;

      const editedEquipment = await EquipmentService.editEquipment(Number(equipmentId), req.body);
      await AppLogService.createAppLog(id, `Edit Equipment : (${equipmentId}) ${editedEquipment.brand}-${editedEquipment.serialNumber}`);
      return res.status(OK).json(editedEquipment);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Put('updateStatus/:equipmentId')
  @Auth({ module: Modules.EQUIPMENTS, accessLevel: AccessLevels.EDIT })
  private async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { equipmentId } = req.params;
      const { isActive } = req.body;
      const { id } = req.user as JwtPayload;

      const editedEquipment = await EquipmentService.editEquipmentStatus(Number(equipmentId), isActive);
      await AppLogService.createAppLog(id, `Update status Equipment : (${equipmentId}) ${editedEquipment.brand}-${editedEquipment.serialNumber}`);
      return res.status(OK).json(editedEquipment);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Delete(':equipmentId')
  @Auth({ module: Modules.EQUIPMENTS, accessLevel: AccessLevels.DELETE })
  private async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { equipmentId } = req.params;
      await EquipmentService.deleteEquipment(Number(equipmentId));

      const { id } = req.user as JwtPayload;
      await AppLogService.createAppLog(id, `Delete Equipment : ${equipmentId}`);
      return res.sendStatus(NO_CONTENT);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Get('byserviceaddress/:serviceAddressId')
  @Auth({ module: Modules.EQUIPMENTS, accessLevel: AccessLevels.VIEW })
  private async getByServiceAddressId(req: Request, res: Response, next: NextFunction) {
    try {
      const { serviceAddressId } = req.params;
      const equipments = await EquipmentService.getEquipmentByServiceAddressId(Number(serviceAddressId));
      const result = await EquipmentAttributes.getEquipmentByServiceAddressIdWeb(equipments);

      return res.status(OK).json({
        equipments: result
      });
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }
}
