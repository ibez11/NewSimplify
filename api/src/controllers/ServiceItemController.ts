import { Request, Response, NextFunction } from 'express';
import { Controller, ClassMiddleware, Get, Put, Delete, ClassErrorMiddleware, Post } from '../overnightjs/core/lib/decorators';
import { OK, NO_CONTENT } from 'http-status-codes';
import Logger from '../Logger';
import { Authentication } from '../config/passport';
import * as ServiceItemService from '../services/ServiceItemService';
import * as AppLogService from '../services/AppLogService';
import { AccessLevels, Modules } from '../database/models/Permission';
import { Auth } from '../middleware/authorization';
import { JwtPayload } from '../typings/jwtPayload';
import globalErrorHandler from '../globalErrorHandler';

const LOG = new Logger('ServiceItemController.ts');

@Controller('api/serviceitems')
@ClassMiddleware(Authentication.AUTHENTICATED)
@ClassErrorMiddleware(globalErrorHandler)
export class ServiceItemController {
  @Get(':serviceItemId')
  @Auth({ module: Modules.SERVICES_ITEMS, accessLevel: AccessLevels.VIEW })
  private async get(req: Request, res: Response, next: NextFunction) {
    try {
      const { serviceItemId } = req.params;

      const serviceItems = await ServiceItemService.getServiceItemByJobId(Number(serviceItemId));

      return res.status(OK).json({
        serviceItems
      });
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Post('')
  @Auth({ module: Modules.SERVICES_ITEMS, accessLevel: AccessLevels.CREATE })
  private async add(req: Request, res: Response, next: NextFunction) {
    try {
      const { jobId, ServiceItem } = req.body;

      const newServiceItems = await ServiceItemService.addJobServiceItems(Number(jobId), ServiceItem);

      return res.status(OK).json(newServiceItems);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Put(':serviceItemId')
  @Auth({ module: Modules.SERVICES_ITEMS, accessLevel: AccessLevels.EDIT })
  private async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { serviceItemId } = req.params;
      const { name, description, quantity, unitPrice, discountAmt, Equipments } = req.body;

      const editedServiceItem = await ServiceItemService.editServiceItem(
        Number(serviceItemId),
        name,
        description,
        quantity,
        unitPrice,
        discountAmt,
        Equipments
      );

      const { id } = req.user as JwtPayload;
      await AppLogService.createAppLog(id, `Edit Service Item : ${editedServiceItem.name}`);
      return res.status(OK).json(editedServiceItem);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Delete(':serviceItemId')
  @Auth({ module: Modules.SERVICES_ITEMS, accessLevel: AccessLevels.DELETE })
  private async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { serviceItemId, serviceId } = req.params;
      await ServiceItemService.deleteServiceItem(Number(serviceItemId));

      const { id } = req.user as JwtPayload;
      await AppLogService.createAppLog(id, `Delete Service Item from Service id: ${serviceId}`);
      return res.sendStatus(NO_CONTENT);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }
}
