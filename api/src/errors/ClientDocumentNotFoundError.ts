import { BAD_REQUEST } from 'http-status-codes';

import ErrorBase from './ErrorBase';
import ErrorCodes from '../constants/ErrorCodes';

class ClientDocumentNotFoundError extends ErrorBase {
  public constructor(identifier: string | number) {
    super(`Client documnet: ${identifier} is not found`, ErrorCodes.CLIENT_DOCUMENT_NOT_FOUND_ERROR_CODE, BAD_REQUEST);
  }
}

export default ClientDocumentNotFoundError;
