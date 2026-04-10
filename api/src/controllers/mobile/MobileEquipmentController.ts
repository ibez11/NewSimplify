import { Request, Response, NextFunction } from 'express';
import { Controller, ClassMiddleware, ClassErrorMiddleware, Get, Post, Put } from '../../overnightjs/core/lib/decorators';
import { OK } from 'http-status-codes';

import Logger from '../../Logger';
import { Authentication } from '../../config/passport';
import * as EquipmentService from '../../services/EquipmentService';
import * as AppLogService from '../../services/AppLogService';
import { AccessLevels, Modules } from '../../database/models/Permission';
import { Auth } from '../../middleware/authorization';
import { JwtPayload } from '../../typings/jwtPayload';
import globalErrorHandler from '../../globalErrorHandler';
import EquipmentAttributes from '../../typings/attributes/EquipmentAttributes';
import { EquipmentQueryParam } from '../../typings/params/EquipmentQueryParam';

const LOG = new Logger('MobileEquipmentController.ts');

@Controller('api/mobile/equipments')
@ClassMiddleware(Authentication.AUTHENTICATED)
@ClassErrorMiddleware(globalErrorHandler)
export class MobileEquipmentController {
  // for get all equipments
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

  // for create equipment
  @Post('')
  @Auth({ module: Modules.EQUIPMENTS, accessLevel: AccessLevels.CREATE })
  private async add(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.user as JwtPayload;
      req.body.updatedBy = id;

      const newEquipment = await EquipmentService.createEquipment(req.body);
      await AppLogService.createAppLog(id, `[Mobile] Create Equiment: ${newEquipment.brand} - ${newEquipment.serialNumber}`);
      return res.status(OK).json(newEquipment);
    } catch (err) {
      return next(err);
    }
  }

  // for update equipment based on equpment id
  @Put(':equipmentId')
  @Auth({ module: Modules.EQUIPMENTS, accessLevel: AccessLevels.EDIT })
  private async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { equipmentId } = req.params;
      const { id } = req.user as JwtPayload;
      req.body.updatedBy = id;

      const editedEquipment = await EquipmentService.editEquipment(Number(equipmentId), req.body);
      await AppLogService.createAppLog(id, `[Mobile] Edit Equipment : ${equipmentId} ${editedEquipment.brand}-${editedEquipment.serialNumber}`);
      return res.status(OK).json(editedEquipment);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  // for get equipments based on service address id
  @Get('byserviceaddress/:serviceAddressId')
  @Auth({ module: Modules.EQUIPMENTS, accessLevel: AccessLevels.VIEW })
  private async getByServiceAddressId(req: Request, res: Response, next: NextFunction) {
    try {
      const { serviceAddressId } = req.params;
      const { s, l, isActive } = req.query;
      const equipments = await EquipmentService.getEquipmentByServiceAddressId(Number(serviceAddressId), isActive, s, l);
      const result = await EquipmentAttributes.getEquipmentByServiceAddressIdMobile(equipments, isActive);

      return res.status(OK).json(result);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  // for get equipments include notes count based on service address id
  @Get('byserviceaddress/:serviceAddressId/withnotescount')
  @Auth({ module: Modules.EQUIPMENTS, accessLevel: AccessLevels.VIEW })
  private async getByServiceAddressIdWithCountNotes(req: Request, res: Response, next: NextFunction) {
    try {
      const { serviceAddressId } = req.params;
      const { s, l, isActive, type, jobId } = req.query;
      const equipments = await EquipmentService.getEquipmentByServiceAddressIdwithNotesCount(
        Number(serviceAddressId),
        type,
        Number(jobId),
        isActive,
        s,
        l
      );

      return res.status(OK).json(equipments);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }
}
