import { BAD_REQUEST } from 'http-status-codes';

import ErrorBase from './ErrorBase';
import ErrorCodes from '../constants/ErrorCodes';

class JobDocumentNotFoundError extends ErrorBase {
  public constructor(identifier: string | number) {
    super(`Job documnet: ${identifier} is not found`, ErrorCodes.JOB_DOCUMENT_NOT_FOUND_ERROR_CODE, BAD_REQUEST);
  }
}

export default JobDocumentNotFoundError;
