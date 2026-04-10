import { Request, Response, NextFunction } from 'express';
import { Controller, ClassMiddleware, Put, ClassErrorMiddleware, Post } from '../../overnightjs/core/lib/decorators';
import { OK, NO_CONTENT } from 'http-status-codes';
import Logger from '../../Logger';
import { Authentication } from '../../config/passport';
import * as ServiceItemService from '../../services/ServiceItemService';
import * as AppLogService from '../../services/AppLogService';
import { AccessLevels, Modules } from '../../database/models/Permission';
import { Auth } from '../../middleware/authorization';
import { JwtPayload } from '../../typings/jwtPayload';
import globalErrorHandler from '../../globalErrorHandler';
import { MobileServiceItemResponseModel } from '../../typings/ResponseFormats';

const LOG = new Logger('MobileServiceItemController.ts');

@Controller('api/mobile/serviceitems')
@ClassMiddleware(Authentication.AUTHENTICATED)
@ClassErrorMiddleware(globalErrorHandler)
export class MobileServiceItemController {
  // for create service items
  @Post('')
  @Auth({ module: Modules.SERVICES_ITEMS, accessLevel: AccessLevels.CREATE })
  private async add(req: Request, res: Response, next: NextFunction) {
    try {
      const { jobId, ServiceItem } = req.body;

      const newServiceItems = await ServiceItemService.addJobServiceItems(Number(jobId), ServiceItem);

      const serviceItems: MobileServiceItemResponseModel[] = [];
      newServiceItems.map(value => {
        serviceItems.push({
          id: value.id,
          name: value.name,
          description: value.description,
          quantity: value.quantity,
          unitPrice: Number(value.unitPrice),
          totalPrice: value.totalPrice,
          discountAmt: value.discountAmt,
          Equipments: value.Equipments
        });
      });
      return res.status(OK).json(serviceItems);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  // for update service item based on service item id
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
      await AppLogService.createAppLog(id, `[Mobile] Edit Service Item : ${editedServiceItem.name}`);
      return res.status(OK).sendStatus(NO_CONTENT);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }
}
