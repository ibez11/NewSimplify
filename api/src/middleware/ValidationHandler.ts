import { Request, Response, NextFunction, RequestHandler } from 'express';
import { BAD_REQUEST } from 'http-status-codes';
import ErrorCodes from '../constants/ErrorCodes';

/**
 * This middleware will handle InputValidationError
 * It must be called after any validator (express-validator)
 *
 */

export const validate = (fields: string[]): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const body = Object.keys(req.body);
    const errors: { field: string; message: string }[] = [];
    await Promise.all(
      fields.map(field => {
        if (!body.includes(field)) {
          errors.push({
            field,
            message: `${field} must not be empty`
          });
        }
      })
    );

    if (errors.length > 0) {
      return res.status(BAD_REQUEST).json({ errorCode: ErrorCodes.REQUIRED_FIELDS_ERROR_CODE, errors });
    }

    return next();
  };
};
