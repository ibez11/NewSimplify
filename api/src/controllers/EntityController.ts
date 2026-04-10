import { Request, Response, NextFunction } from 'express';
import { Controller, ClassMiddleware, ClassErrorMiddleware, Get, Post, Put } from '../overnightjs/core/lib/decorators';
import { OK, NO_CONTENT } from 'http-status-codes';
// import { ValidationChain, body } from 'express-validator';
// import ValidationHandler from './ValidationHandler';

import Logger from '../Logger';
import globalErrorHandler from '../globalErrorHandler';
import ImageNotFound from '../errors/ImageNotFound';
import { Authentication } from '../config/passport';
import { Auth } from '../middleware/authorization';

import * as EntityService from '../services/EntityService';
import * as AwsService from '../services/AwsService';
import * as AppLogService from '../services/AppLogService';

import { AccessLevels, Modules } from '../database/models/Permission';
import { sequelize } from '../config/database';
import { JwtPayload } from '../typings/jwtPayload';

const LOG = new Logger('EntityController.ts');

// const createEntityValidator: ValidationChain[] = [
//   body('name', 'Company Name must not be empty')
//     .not()
//     .isEmpty(),
//   body('address', 'Address must not be empty')
//     .not()
//     .isEmpty(),
//   body('contactNumber', 'Contact Number must not be empty')
//     .not()
//     .isEmpty()
// ];

// const editEntityValidator: ValidationChain[] = [
//   body('name', 'Company Name must not be empty')
//     .not()
//     .isEmpty(),
//   body('address', 'Address must not be empty')
//     .not()
//     .isEmpty(),
//   body('contactNumber', 'Contact Number must not be empty')
//     .not()
//     .isEmpty(),
//   body('email', 'Email must not be empty')
//     .not()
//     .isEmpty()
// ];

@Controller('api/entities')
@ClassMiddleware(Authentication.AUTHENTICATED)
@ClassErrorMiddleware(globalErrorHandler)
export class EntityController {
  @Get('getimage/:image')
  @Auth({ module: Modules.ENTITIES, accessLevel: AccessLevels.VIEW })
  private async get(req: Request, res: Response, next: NextFunction) {
    const { image } = req.params;

    try {
      const logo = await AwsService.s3BucketGetSignedUrl(image, 'entities');

      return res.status(OK).json({ logo });
    } catch (err) {
      LOG.error(err);
      next(new ImageNotFound(image));
    }
  }

  @Get('')
  @Auth({ module: Modules.ENTITIES, accessLevel: AccessLevels.VIEW })
  private async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { rows, count } = await EntityService.getAllEntities();

      return res.status(OK).json({
        count,
        entities: rows
      });
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Post('delete')
  @Auth({ module: Modules.ENTITIES, accessLevel: AccessLevels.DELETE })
  private async delete(req: Request, res: Response, next: NextFunction) {
    const transaction = await sequelize.transaction();
    try {
      const { entityId, imageUrl, qrImageUrl } = req.body;
      const { id } = req.user as JwtPayload;

      const deletedEntity = await EntityService.getEntitybyId(entityId);
      await AppLogService.createAppLog(id, `Delete Entity : ${deletedEntity.name}`);
      if (imageUrl === null) {
        await EntityService.deleteEntity(entityId, transaction);
        await transaction.commit();
        return res.sendStatus(NO_CONTENT);
      } else {
        await EntityService.deleteEntity(entityId, transaction);

        const deleteImage = await AwsService.s3BucketDeleteObject(imageUrl, 'assets');
        const deleteQrImage = await AwsService.s3BucketDeleteObject(qrImageUrl, 'assets');
        if (!deleteImage || !deleteQrImage) {
          await transaction.rollback();
        } else {
          await transaction.commit();
          return res.sendStatus(NO_CONTENT);
        }
      }
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Post('')
  @Auth({ module: Modules.ENTITIES, accessLevel: AccessLevels.CREATE })
  private async add(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, address, countryCode, contactNumber, email, logo, needGST, qrImage, registerNumberGST, invoiceFooter, uenNumber } = req.body;
      const { id } = req.user as JwtPayload;
      const newEntity = await EntityService.createEntity(
        name,
        address,
        logo,
        countryCode,
        contactNumber,
        email,
        needGST,
        qrImage,
        registerNumberGST,
        invoiceFooter,
        uenNumber
      );

      const imageUrl = await AwsService.s3BucketGetPutSignedUrl(logo, 'entities');
      const qrImageUrl = await AwsService.s3BucketGetPutSignedUrl(qrImage, 'entities');

      newEntity.setDataValue('logo', imageUrl);
      newEntity.setDataValue('qrImage', qrImageUrl);
      newEntity.setDataValue('imageBucket', AwsService.s3BucketStringGenerate('entities'));

      await AppLogService.createAppLog(id, `Create Entity : ${name}`);
      return res.status(OK).json(newEntity);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Put(':entityId')
  @Auth({ module: Modules.ENTITIES, accessLevel: AccessLevels.EDIT })
  private async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { entityId } = req.params;
      const { name, address, countryCode, contactNumber, logo, email, needGST, qrImage, registerNumberGST, invoiceFooter, uenNumber } = req.body;
      const editedEntity = await EntityService.editEntity(
        Number(entityId),
        name,
        address,
        logo,
        countryCode,
        contactNumber,
        email,
        needGST,
        qrImage,
        registerNumberGST,
        invoiceFooter,
        uenNumber
      );
      const { id } = req.user as JwtPayload;

      if (logo) {
        const imageUrl = await AwsService.s3BucketGetPutSignedUrl(logo, 'entities');
        const qrImageUrl = await AwsService.s3BucketGetPutSignedUrl(qrImage, 'entities');

        editedEntity.setDataValue('logo', imageUrl);
        editedEntity.setDataValue('qrImage', qrImageUrl);
        editedEntity.setDataValue('imageBucket', AwsService.s3BucketStringGenerate('entities'));
      }

      await AppLogService.createAppLog(id, `Edit Entity : ${name}`);
      return res.status(OK).json(editedEntity);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }
}
