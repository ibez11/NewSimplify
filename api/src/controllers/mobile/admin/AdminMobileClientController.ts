import { Request, Response, NextFunction } from 'express';
import { Controller, ClassMiddleware, ClassErrorMiddleware, Get, Post, Middleware, Put } from '../../../overnightjs/core/lib/decorators';
import { NO_CONTENT, OK } from 'http-status-codes';

import globalErrorHandler from '../../../globalErrorHandler';
import { Authentication } from '../../../config/passport';
import { AccessLevels, Modules } from '../../../database/models/Permission';
import Logger from '../../../Logger';
import { Auth } from '../../../middleware/authorization';
import * as ClientService from '../../../services/ClientService';
import * as AppLogService from '../../../services/AppLogService';

import ClientQueryParams from '../../../typings/params/ClientQueryParams';
import AdminMobileClientAttributes from '../../../typings/attributes/mobile/admin/AdminMobileClientAttributes';
import { validate } from '../../../middleware/ValidationHandler';
import { JwtPayload } from '../../../typings/jwtPayload';

const LOG = new Logger('AdminMobileClientController.ts');

@Controller('api/mobile/admin/clients')
@ClassMiddleware(Authentication.AUTHENTICATED)
@ClassErrorMiddleware(globalErrorHandler)
export class AdminMobileClientController {
  @Get('check-name')
  @Auth({ module: Modules.CLIENTS, accessLevel: AccessLevels.VIEW })
  /**
   * GET /clients/check-name endpoint with authorization
   * Checks if a client exists in the database by their name.
   * Returns a boolean indicating whether the client exists or not.*/
  private async checkName(req: Request<void, void, void, ClientQueryParams>, res: Response, next: NextFunction) {
    try {
      const client = await ClientService.isClientExistsByClientName(req.query);

      return res.status(OK).json(client);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  /**
   * GET /clients endpoint with authorization
   * Retrieves a paginated list of clients based on query parameters.
   * Returns JSON with client data.
   * Logs and handles errors.*/
  @Get('')
  @Auth({ module: Modules.CLIENTS, accessLevel: AccessLevels.VIEW })
  private async getAll(req: Request<void, void, void, ClientQueryParams>, res: Response, next: NextFunction) {
    try {
      const { rows } = await ClientService.getAll(req.query);

      const results = await AdminMobileClientAttributes.getAll(rows);

      return res.status(OK).json(results);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Get(':id')
  @Auth({ module: Modules.CLIENTS, accessLevel: AccessLevels.VIEW })
  private async get(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const client = await ClientService.getClientById(Number(id));
      const result = AdminMobileClientAttributes.get(client);

      return res.status(OK).json(result);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  /**
   * POST /clients endpoint is used to create new client.
   * @param req body name of client
   * @param req body clientType of client
   * @param req body billingAddress of client
   * @param req body billingFloor of client
   * @param req body billingUnit of client
   * @param req body billingPostal of client
   * @param req body remarks of client
   * @param req body ServiceAddress of client
   * @param req body ContactPersons of client
   * @returns A success response status 204 with no content.
   */
  @Post('')
  @Middleware(validate(['name', 'clientType', 'ContactPersons', 'ServiceAddresses']))
  @Auth({ module: Modules.CLIENTS, accessLevel: AccessLevels.CREATE })
  private async add(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.user as JwtPayload;

      req.body.emailReminder = true;
      req.body.whatsAppReminder = true;
      req.body.emailJobReport = true;

      const newClient = await ClientService.createClient(req.body);

      await AppLogService.createAppLog(id, `[Admin Mobile] Create Client : ${newClient.name}`);
      return res.status(OK).json({ clientId: newClient.id });
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  /**
   * POST /clients endpoint is used to create new client.
   * @param req body name of client
   * @param req body clientType of client
   * @param req body billingAddress of client
   * @param req body billingFloor of client
   * @param req body billingUnit of client
   * @param req body billingPostal of client
   * @param req body remarks of client
   * @param req body ServiceAddress of client
   * @param req body ContactPersons of client
   * @returns A success response status 204 with no content.
   */
  @Put(':clientId')
  @Auth({ module: Modules.CLIENTS, accessLevel: AccessLevels.EDIT })
  private async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { clientId } = req.params;
      const { id } = req.user as JwtPayload;

      const editedClient = await ClientService.editClient(Number(clientId), req.body);

      await AppLogService.createAppLog(id, `[Admin Mobile] Edit Client : ${editedClient.name || id}`);
      return res.status(OK).json({ clientId: editedClient.id });
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  /**
   * PUT :clientId/update-remarks is used to edit remarks of each client based on client id.
   * @param req body remarks of client
   * @returns A success response status 204 with no content.
   */
  @Put(':clientId/update-remarks')
  @Auth({ module: Modules.CLIENTS, accessLevel: AccessLevels.EDIT })
  private async updateClientRemarks(req: Request, res: Response, next: NextFunction) {
    try {
      const { clientId } = req.params;
      const { remarks } = req.body;
      const { id } = req.user as JwtPayload;

      const client = await ClientService.updateClientRemarks(Number(clientId), remarks);

      await AppLogService.createAppLog(id, `[Admin Mobile] Edit Client Remarks: ${client.name}`);
      return res.sendStatus(NO_CONTENT);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }
}
