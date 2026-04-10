import { BAD_REQUEST } from 'http-status-codes';

import ErrorBase from './ErrorBase';
import ErrorCodes from '../constants/ErrorCodes';

class JobHaveOtherInProgressError extends ErrorBase {
  public constructor() {
    super(`Have other job in progress`, ErrorCodes.OTHER_JOB_IN_PROGRESS_ERROR_CODE, BAD_REQUEST);
  }
}

export default JobHaveOtherInProgressError;
