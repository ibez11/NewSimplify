import { BAD_REQUEST } from 'http-status-codes';

import ErrorBase from './ErrorBase';
import ErrorCodes from '../constants/ErrorCodes';

class RoleChangeError extends ErrorBase {
  public constructor() {
    super(`Cannot change role while this user is still logged in or has an active session`, ErrorCodes.ROLE_NOT_FOUND_ERROR_CODE, BAD_REQUEST);
  }
}

export default RoleChangeError;
