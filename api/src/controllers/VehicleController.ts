import { Request, Response, NextFunction } from 'express';
import { Controller, ClassMiddleware, Get, Post, Put, Delete, ClassErrorMiddleware } from '../overnightjs/core/lib/decorators';
import { OK, NO_CONTENT } from 'http-status-codes';
// import { ValidationChain, body } from 'express-validator';
// import ValidationHandler from './ValidationHandler';

import Logger from '../Logger';
import { Authentication } from '../config/passport';
import * as VehicleService from '../services/VehicleService';
import * as AppLogService from '../services/AppLogService';
import { AccessLevels, Modules } from '../database/models/Permission';
import { Auth } from '../middleware/authorization';
import { JwtPayload } from '../typings/jwtPayload';
import globalErrorHandler from '../globalErrorHandler';

const LOG = new Logger('VehicleController.ts');

interface VehicleQueryParams {
  s: number;
  l?: number;
  q?: string;
}

// const vehicleValidator: ValidationChain[] = [
//   body('carplateNumber', 'Vehicle number must not be empty')
//     .not()
//     .isEmpty()
// ];

@Controller('api/vehicles')
@ClassMiddleware(Authentication.AUTHENTICATED)
@ClassErrorMiddleware(globalErrorHandler)
export class VehicleController {
  @Get('active')
  @Auth({ module: Modules.VEHICLES, accessLevel: AccessLevels.VIEW })
  private async get(req: Request, res: Response, next: NextFunction) {
    try {
      const vehicles = await VehicleService.getActiveVehicle();

      return res.status(OK).json({
        vehicles
      });
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Post(':vehicleId/activate')
  @Auth({ module: Modules.VEHICLES, accessLevel: AccessLevels.EDIT })
  private async active(req: Request, res: Response, next: NextFunction) {
    try {
      const { vehicleId } = req.params;
      const editedVehicle = await VehicleService.getVehicleFullDetailsById(Number(vehicleId));

      await VehicleService.activateVehicle(Number(vehicleId));

      const { id } = req.user as JwtPayload;
      await AppLogService.createAppLog(id, `Activated Vehicle : ${editedVehicle.carplateNumber}`);
      return res.sendStatus(NO_CONTENT);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Post(':vehicleId/deactivate')
  @Auth({ module: Modules.VEHICLES, accessLevel: AccessLevels.EDIT })
  private async deactive(req: Request, res: Response, next: NextFunction) {
    try {
      const { vehicleId } = req.params;
      const editedVehicle = await VehicleService.getVehicleFullDetailsById(Number(vehicleId));

      await VehicleService.deactivateVehicle(Number(vehicleId));

      const { id } = req.user as JwtPayload;
      await AppLogService.createAppLog(id, `Dectivated Vehicle : ${editedVehicle.carplateNumber}`);
      return res.sendStatus(NO_CONTENT);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Get(':vehicleId')
  @Auth({ module: Modules.VEHICLES, accessLevel: AccessLevels.VIEW })
  private async getActive(req: Request, res: Response, next: NextFunction) {
    try {
      const { vehicleId } = req.params;
      const vehicle = await VehicleService.getVehicleFullDetailsById(Number(vehicleId));

      return res.status(OK).json({
        vehicle
      });
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Get('')
  @Auth({ module: Modules.VEHICLES, accessLevel: AccessLevels.VIEW })
  private async getAll(req: Request<void, void, void, VehicleQueryParams>, res: Response, next: NextFunction) {
    try {
      const { s, l, q } = req.query;

      const { rows, count } = await VehicleService.searchVehiclesWithPagination(s, l, q);

      return res.status(OK).json({
        count,
        vehicles: rows
      });
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Post('')
  @Auth({ module: Modules.VEHICLES, accessLevel: AccessLevels.CREATE })
  private async add(req: Request, res: Response, next: NextFunction) {
    try {
      const { model, carplateNumber, coeExpiryDate, vehicleStatus, employeeId } = req.body;
      const newVehicle = await VehicleService.createVehicle(model, carplateNumber, coeExpiryDate, vehicleStatus, employeeId);

      const { id } = req.user as JwtPayload;
      await AppLogService.createAppLog(id, `Create Vehicle : ${carplateNumber}`);
      return res.status(OK).json(newVehicle);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Put(':vehicleId')
  @Auth({ module: Modules.VEHICLES, accessLevel: AccessLevels.EDIT })
  private async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { vehicleId } = req.params;
      const { model, carplateNumber, coeExpiryDate, vehicleStatus, employeeId } = req.body;
      const editedVehicle = await VehicleService.editVehicle(Number(vehicleId), model, carplateNumber, coeExpiryDate, vehicleStatus, employeeId);

      const { id } = req.user as JwtPayload;
      await AppLogService.createAppLog(id, `Edit Vehicle : ${carplateNumber}`);
      return res.status(OK).json(editedVehicle);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Delete(':vehicleId')
  @Auth({ module: Modules.VEHICLES, accessLevel: AccessLevels.DELETE })
  private async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { vehicleId } = req.params;
      const deletedVehicle = await VehicleService.getVehicleFullDetailsById(Number(vehicleId));

      await VehicleService.deleteVehicle(Number(vehicleId));

      const { id } = req.user as JwtPayload;
      await AppLogService.createAppLog(id, `Delete Vehicle : ${deletedVehicle.carplateNumber}`);
      return res.sendStatus(NO_CONTENT);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }
}
