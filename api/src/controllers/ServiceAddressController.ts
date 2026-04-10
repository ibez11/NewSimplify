import { Request, Response, NextFunction } from 'express';
import { Controller, ClassMiddleware, Get, Post, Put, Delete, ClassErrorMiddleware } from '../overnightjs/core/lib/decorators';
import { OK, NO_CONTENT } from 'http-status-codes';
import Logger from '../Logger';
// import { body, ValidationChain } from 'express-validator';
// import ValidationHandler from './ValidationHandler';

import * as ServiceAddressService from '../services/ServiceAddressService';
import * as ServiceService from '../services/ServiceService';
import * as AppLogService from '../services/AppLogService';
import { JwtPayload } from '../typings/jwtPayload';
import { Authentication } from '../config/passport';
import { Auth } from '../middleware/authorization';
import { AccessLevels, Modules } from '../database/models/Permission';
import globalErrorHandler from '../globalErrorHandler';

const LOG = new Logger('ServiceAddressController.ts');

@Controller('api/serviceaddresses')
@ClassMiddleware(Authentication.AUTHENTICATED)
@ClassErrorMiddleware(globalErrorHandler)
export class ServiceAddressController {
  @Get(':serviceAddressId')
  @Auth({ module: Modules.SERVICES_ADDRESSES, accessLevel: AccessLevels.VIEW })
  private async get(req: Request, res: Response, next: NextFunction) {
    try {
      const { serviceAddressId } = req.params;
      const { rows, count } = await ServiceAddressService.getServiceAddressesByClientId(Number(serviceAddressId));

      return res.status(OK).json({ count, serviceAddresses: rows.map(row => row.toResponseFormat()) });
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Get('check-attach-service/:serviceAddressId')
  @Auth({ module: Modules.INVOICES, accessLevel: AccessLevels.VIEW })
  private async checkAttachService(req: Request, res: Response, next: NextFunction) {
    try {
      const { serviceAddressId } = req.params;
      const hasAttachService = await ServiceService.getByServiceAddressId(Number(serviceAddressId));

      return res.status(OK).json({ hasAttachService: hasAttachService.length > 0 });
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }
}
