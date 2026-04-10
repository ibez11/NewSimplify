import { BAD_REQUEST } from 'http-status-codes';

import ErrorBase from './ErrorBase';
import ErrorCodes from '../constants/ErrorCodes';

class JobNoteMediaNotFoundError extends ErrorBase {
  public constructor(identifier: string | number) {
    super(`Job note media: ${identifier} is not found`, ErrorCodes.JOB_NOTE_MEDIA_NOT_FOUND_ERROR_CODE, BAD_REQUEST);
  }
}

export default JobNoteMediaNotFoundError;
