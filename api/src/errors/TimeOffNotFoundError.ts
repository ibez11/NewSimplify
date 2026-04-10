import { BAD_REQUEST } from 'http-status-codes';

import ErrorBase from './ErrorBase';
import ErrorCodes from '../constants/ErrorCodes';

class TimeOffNotFoundError extends ErrorBase {
  public constructor(identifier: string | number) {
    super(`TimeOff: ${identifier} is not found`, ErrorCodes.TIME_OFF_NOT_FOUND_ERROR_CODE, BAD_REQUEST);
  }
}

export default TimeOffNotFoundError;
