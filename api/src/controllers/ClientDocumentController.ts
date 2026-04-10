import { Request, Response, NextFunction } from 'express';
import { Controller, ClassMiddleware, ClassErrorMiddleware, Get, Post, Put, Delete } from '../overnightjs/core/lib/decorators';

import { OK, NO_CONTENT } from 'http-status-codes';
// import { ValidationChain, body } from 'express-validator';
// import ValidationHandler from './ValidationHandler';

import ClientDocumentNotFound from '../errors/ClientDocumentNotFoundError';
import { JwtPayload } from '../typings/jwtPayload';

import Logger from '../Logger';
import globalErrorHandler from '../globalErrorHandler';
import { Authentication } from '../config/passport';
import * as ClientDocumentService from '../services/ClientDocumentService';
import * as AppLogService from '../services/AppLogService';
import * as AwsService from '../services/AwsService';

import { AccessLevels, Modules } from '../database/models/Permission';
import { Auth } from '../middleware/authorization';
import { sequelize } from '../config/database';

const LOG = new Logger('ClientDocumentController.ts');

// const createClientDocumentValidator: ValidationChain[] = [
//   body('clientId', 'Client id must not be empty')
//     .not()
//     .isEmpty()
// ];

@Controller('api/client-documents')
@ClassMiddleware(Authentication.AUTHENTICATED)
@ClassErrorMiddleware(globalErrorHandler)
export class ClientDocumentController {
  @Get('getdocument/:document')
  @Auth({ module: Modules.CLIENT_DOCUMENTS, accessLevel: AccessLevels.VIEW })
  private async getdocument(req: Request, res: Response, next: NextFunction) {
    const { document } = req.params;

    try {
      const documentUrl = await AwsService.s3BucketGetSignedUrl(document, 'documents');

      return res.status(OK).json({ documentUrl });
    } catch (err) {
      LOG.error(err);
      next(new ClientDocumentNotFound(document));
    }
  }

  @Get(':clientDocumentId')
  @Auth({ module: Modules.CLIENT_DOCUMENTS, accessLevel: AccessLevels.VIEW })
  private async get(req: Request, res: Response, next: NextFunction) {
    try {
      const { clientDocumentId } = req.params;

      const { rows } = await ClientDocumentService.getClientDocumentByClientId(Number(clientDocumentId));

      await Promise.all(
        rows.map(async row => {
          if (row.documentUrl) {
            const signedImageUrl = await AwsService.s3BucketGetSignedUrl(row.documentUrl, 'documents');

            row.setDataValue('documentUrl', String(signedImageUrl));
          }
        })
      );

      return res.status(OK).json({
        clientDocuments: rows
      });
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Post('')
  @Auth({ module: Modules.CLIENT_DOCUMENTS, accessLevel: AccessLevels.CREATE })
  private async add(req: Request, res: Response, next: NextFunction) {
    try {
      const { notes, clientId, document } = req.body;
      const { id } = req.user as JwtPayload;

      const newClientDocument = await ClientDocumentService.createClientDocument(notes, document, clientId);

      let documentUrl = '';
      if (document) {
        documentUrl = await AwsService.s3BucketGetPutSignedUrl(document, 'documents');

        newClientDocument.setDataValue('documentBucket', AwsService.s3BucketStringGenerate('documents'));
      }

      newClientDocument.setDataValue('documentUrl', String(documentUrl));

      await AppLogService.createAppLog(id, `Create Client document : ${clientId} - ${notes}`);
      return res.status(OK).json(newClientDocument);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Put(':clientDocumentId')
  @Auth({ module: Modules.CLIENT_DOCUMENTS, accessLevel: AccessLevels.EDIT })
  private async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { clientDocumentId } = req.params;
      const { notes, document, isHide } = req.body;
      const { id } = req.user as JwtPayload;

      const editedClientDocument = await ClientDocumentService.editClientDocument(Number(clientDocumentId), notes, document, isHide);

      await AppLogService.createAppLog(id, `Edit Client Document : ${editedClientDocument.clientId} - ${notes}`);
      return res.status(OK).json(editedClientDocument);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Delete(':clientDocumentId')
  @Auth({ module: Modules.CLIENT_DOCUMENTS, accessLevel: AccessLevels.EDIT })
  private async delete(req: Request, res: Response, next: NextFunction) {
    const transaction = await sequelize.transaction();
    try {
      const { clientDocumentId } = req.params;
      const { id } = req.user as JwtPayload;
      const { documentUrl, notes } = await ClientDocumentService.getClientDocumentById(Number(clientDocumentId));

      if (documentUrl) {
        await ClientDocumentService.deleteClientDocument(Number(clientDocumentId), transaction);
        await AppLogService.createAppLog(id, `Delete Client Document : ${clientDocumentId} - ${notes}`);

        const deleteFile = await AwsService.s3BucketDeleteObject(documentUrl, 'documents');
        if (!deleteFile) {
          await transaction.rollback();
        } else {
          await transaction.commit();
          return res.sendStatus(NO_CONTENT);
        }
      } else {
        await ClientDocumentService.deleteClientDocument(Number(clientDocumentId), transaction);
        await AppLogService.createAppLog(id, `Delete Client Document : ${clientDocumentId} - ${notes}`);
        await transaction.commit();
        return res.sendStatus(NO_CONTENT);
      }
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }
}
