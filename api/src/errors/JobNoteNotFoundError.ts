import { BAD_REQUEST } from 'http-status-codes';

import ErrorBase from './ErrorBase';
import ErrorCodes from '../constants/ErrorCodes';

class JobNoteNotFoundError extends ErrorBase {
  public constructor(identifier: string | number) {
    super(`Job note: ${identifier} is not found`, ErrorCodes.JOB_NOTE_NOT_FOUND_ERROR_CODE, BAD_REQUEST);
  }
}

export default JobNoteNotFoundError;
