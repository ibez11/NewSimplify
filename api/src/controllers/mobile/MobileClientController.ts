import { Request, Response, NextFunction } from 'express';
import { Controller, ClassMiddleware, ClassErrorMiddleware, Put } from '../../overnightjs/core/lib/decorators';
import { NO_CONTENT } from 'http-status-codes';

import globalErrorHandler from '../../globalErrorHandler';
import { Authentication } from '../../config/passport';
import { AccessLevels, Modules } from '../../database/models/Permission';
import Logger from '../../Logger';
import { Auth } from '../../middleware/authorization';
import * as ClientService from '../../services/ClientService';
import * as AppLogService from '../../services/AppLogService';
import { JwtPayload } from '../../typings/jwtPayload';

const LOG = new Logger('ClientController.ts');

@Controller('api/mobile/clients')
@ClassErrorMiddleware(globalErrorHandler)
@ClassMiddleware(Authentication.AUTHENTICATED)
export class MobileClientController {
  // for update remarks based on client id
  @Put('update-remarks/:clienId')
  @Auth({ module: Modules.CLIENTS, accessLevel: AccessLevels.EDIT })
  private async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { clienId } = req.params;
      const { remarks } = req.body;
      const { id } = req.user as JwtPayload;

      const client = await ClientService.updateClientRemarks(Number(clienId), remarks);

      await AppLogService.createAppLog(id, `[Mobile] Edit Client Remarks: ${client.name}`);
      return res.sendStatus(NO_CONTENT);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }
}
