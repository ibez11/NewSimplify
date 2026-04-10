import { BAD_REQUEST } from 'http-status-codes';

import ErrorBase from './ErrorBase';
import ErrorCodes from '../constants/ErrorCodes';

class JobAlreadyUpdateError extends ErrorBase {
  public constructor(identifier: string | number) {
    super(`Job: ${identifier} is already updated`, ErrorCodes.JOB_ALREADY_UPDATED_ERROR_CODE, BAD_REQUEST);
  }
}

export default JobAlreadyUpdateError;
