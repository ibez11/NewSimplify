import { NextFunction, Request, RequestHandler, Response } from 'express';

import { PermissionResponseModel } from '../typings/ResponseFormats';
import InsufficientPermissionError from '../errors/InsufficientPermissionError';

export const createAuthorizer = (required: PermissionResponseModel): RequestHandler => (req, res, next) => {
  const { permissions } = req.user as { permissions: PermissionResponseModel[] };

  const hasPermission =
    permissions.filter(permission => permission.module === required.module && permission.accessLevel === required.accessLevel).length > 0;

  if (!hasPermission) {
    return next(new InsufficientPermissionError());
  }

  return next();
};

export const Auth = (required: PermissionResponseModel) => (
  target: unknown,
  propertyKey: string,
  descriptor: PropertyDescriptor
): PropertyDescriptor => {
  const originalMethod = descriptor.value;

  descriptor.value = async function(req: Request, res: Response, next: NextFunction) {
    const { permissions } = req.user as { permissions: PermissionResponseModel[] };

    const hasPermission =
      permissions.filter(permission => permission.module === required.module && permission.accessLevel === required.accessLevel).length > 0;

    if (!hasPermission) {
      return next(new InsufficientPermissionError());
    }

    // Going back to the controller
    await originalMethod.apply(this, [req, res, next]);
  };

  return descriptor;
};
