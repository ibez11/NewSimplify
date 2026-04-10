import { BAD_REQUEST } from 'http-status-codes';

import ErrorBase from './ErrorBase';
import ErrorCodes from '../constants/ErrorCodes';

class EmptyClientDataCreationError extends ErrorBase {
  public constructor() {
    super(`Client name can not be empty`, ErrorCodes.CLIENT_NAME_CAN_NOT_EMPTY, BAD_REQUEST);
  }
}

export default EmptyClientDataCreationError;
