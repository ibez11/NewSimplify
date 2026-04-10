import { BAD_REQUEST } from 'http-status-codes';

import ErrorBase from './ErrorBase';
import ErrorCodes from '../constants/ErrorCodes';

class EmailServiceNotActiveError extends ErrorBase {
  public constructor() {
    super(`Email reminder not active please contact Admin Support`, ErrorCodes.EMAIL_REMINDER_ERROR_CODE, BAD_REQUEST);
  }
}

export default EmailServiceNotActiveError;
