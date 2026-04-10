import { BAD_REQUEST } from 'http-status-codes';

import ErrorBase from './ErrorBase';
import ErrorCodes from '../constants/ErrorCodes';

class ServiceHaveInProgessJobError extends ErrorBase {
  public constructor(identifier: string | number) {
    super(`Service: ${identifier} have in progress job`, ErrorCodes.EXISTING_JOB_IN_PROGRESS_ERROR_CODE, BAD_REQUEST);
  }
}

export default ServiceHaveInProgessJobError;
