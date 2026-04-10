import { BAD_REQUEST } from 'http-status-codes';

import ErrorBase from './ErrorBase';
import ErrorCodes from '../constants/ErrorCodes';

class RoleNotFoundError extends ErrorBase {
  public constructor(identifier: string | number) {
    super(`Role: ${identifier} is not found`, ErrorCodes.ROLE_NOT_FOUND_ERROR_CODE, BAD_REQUEST);
  }
}

export default RoleNotFoundError;
