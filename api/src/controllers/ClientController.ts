import { Request, Response, NextFunction } from 'express';
import { Controller, ClassMiddleware, ClassErrorMiddleware, Get, Post, Put, Middleware, Delete } from '../overnightjs/core/lib/decorators';
import { NO_CONTENT, OK } from 'http-status-codes';
// import { body, ValidationChain } from 'express-validator';
// import ValidationHandler from './ValidationHandler';

import globalErrorHandler from '../globalErrorHandler';
import { Authentication } from '../config/passport';
import { AccessLevels, Modules } from '../database/models/Permission';
import Logger from '../Logger';
import { Auth } from '../middleware/authorization';
import * as ClientService from '../services/ClientService';
import * as AppLogService from '../services/AppLogService';
import * as AwsService from '../services/AwsService';
import * as SettingService from '../services/SettingService';
import lodash from 'lodash';

import { JwtPayload } from '../typings/jwtPayload';
import ClientQueryParams from '../typings/params/ClientQueryParams';
import { validate } from '../middleware/ValidationHandler';
import ClientAttributes from '../typings/attributes/ClientAttributes';
import * as ServiceService from '../services/ServiceService';
import * as InvoiceService from '../services/InvoiceService';
import * as JobService from '../services/JobService';

const LOG = new Logger('ClientController.ts');

@Controller('api/clients')
@ClassMiddleware(Authentication.AUTHENTICATED)
@ClassErrorMiddleware(globalErrorHandler)
export class ClientController {
  @Get('check-name')
  @Auth({ module: Modules.CLIENTS, accessLevel: AccessLevels.VIEW })
  private async checkName(req: Request<void, void, void, ClientQueryParams>, res: Response, next: NextFunction) {
    try {
      const client = await ClientService.isClientExistsByClientName(req.query);

      return res.status(OK).json(client);
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

      if (client.ClientDocuments.length > 0) {
        const rows = client.ClientDocuments;
        await Promise.all(
          rows.map(async clientDocument => {
            let signedDocumentUrl = '';
            if (clientDocument.documentUrl) {
              signedDocumentUrl = await AwsService.s3BucketGetSignedUrl(clientDocument.documentUrl, 'documents');
            }

            clientDocument.documentUrl = signedDocumentUrl;
          })
        );
      }

      const convertClient = JSON.parse(JSON.stringify(client));
      const result = lodash.omit(convertClient, ['idQboWithGST', 'idQboWithoutGST']);

      const emailIsAcive = await SettingService.getSpecificSettings('EMAILNOTIFICATION');
      const waIsAcive = await SettingService.getSpecificSettings('WHATSAPPNOTIFICATION');

      return res.status(OK).json({
        client: result,
        emailIsActive: emailIsAcive.isActive,
        waIsActive: waIsAcive.isActive
      });
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  // get contact persons by service id
  @Get('emailClient/:id')
  @Auth({ module: Modules.CLIENTS, accessLevel: AccessLevels.VIEW })
  private async getEmailClient(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const service = await ServiceService.getServiceDetailById(Number(id));
      const client = await ClientService.getClientById(Number(service.clientId));
      const result = await ClientAttributes.getEmail(client, Number(id));

      return res.status(OK).json(result);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  // get contact persons by client id
  @Get('contactpersons/:id')
  @Auth({ module: Modules.CLIENTS, accessLevel: AccessLevels.VIEW })
  private async getContactPersonsByClientId(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const client = await ClientService.getClientById(Number(id));
      const result = client.ContactPersons;

      return res.status(OK).json({ contactPersons: result });
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Get('')
  @Auth({ module: Modules.CLIENTS, accessLevel: AccessLevels.VIEW })
  private async getAll(req: Request<void, void, void, ClientQueryParams>, res: Response, next: NextFunction) {
    try {
      const { rows, count } = await ClientService.getAll(req.query);
      const results = await ClientAttributes.getAll(rows);

      return res.status(OK).json({
        count,
        clients: results
      });
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Post('')
  @Middleware(validate(['name', 'clientType', 'ContactPersons', 'ServiceAddresses']))
  @Auth({ module: Modules.CLIENTS, accessLevel: AccessLevels.CREATE })
  private async add(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.user as JwtPayload;

      const newClient = await ClientService.createClient(req.body);

      await AppLogService.createAppLog(id, `Create Client : ${newClient.name}`);
      return res.status(OK).json(newClient);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Put(':clientId')
  // @Middleware(validate(['name', 'clientType', 'contactPerson', 'contactNumber', 'country', 'countryCode', 'ServiceAddresses']))
  @Auth({ module: Modules.CLIENTS, accessLevel: AccessLevels.EDIT })
  private async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { clientId } = req.params;
      const { id } = req.user as JwtPayload;

      const editedClient = await ClientService.editClient(Number(clientId), req.body);

      await AppLogService.createAppLog(id, `Edit Client : ${editedClient.name || id}`);
      return res.status(OK).json(editedClient);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Get('check-jobs-inprogress/:clientId')
  @Auth({ module: Modules.CLIENTS, accessLevel: AccessLevels.VIEW })
  private async hasJobsInprogress(req: Request, res: Response, next: NextFunction) {
    try {
      const { clientId } = req.params;
      const hasJobsInprogress = await JobService.hasJobsInProgressByClientId(Number(clientId));

      return res.status(OK).json({
        hasJobsInprogress: hasJobsInprogress
      });
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Get('check-unpaid-invoices/:clientId')
  @Auth({ module: Modules.INVOICES, accessLevel: AccessLevels.VIEW })
  private async hasUnpaidInvoices(req: Request, res: Response, next: NextFunction) {
    try {
      const { clientId } = req.params;
      const hasUnpaidInvoices = await InvoiceService.hasUnpaidInvoicesByClientId(Number(clientId));

      return res.status(OK).json({
        hasUnpaidInvoices: hasUnpaidInvoices
      });
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Delete(':clientId')
  @Auth({ module: Modules.CLIENTS, accessLevel: AccessLevels.DELETE })
  private async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { clientId } = req.params;
      const { reason } = req.body;
      const { name } = await ClientService.deleteClient(Number(clientId));

      const { id } = req.user as JwtPayload;
      await AppLogService.createAppLog(id, `Delete Client : ${name} (#${clientId})` + (reason ? `, reason: ${reason}` : ''));
      return res.sendStatus(NO_CONTENT);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }
}
