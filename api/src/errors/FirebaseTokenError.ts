import { BAD_REQUEST } from 'http-status-codes';

import ErrorBase from './ErrorBase';
import ErrorCodes from '../constants/ErrorCodes';

class FirebaseTokenError extends ErrorBase {
  public constructor(identifier?: string | number, message?: string) {
    super(`Firebase Token Error : ${identifier} ${message}`, ErrorCodes.TOKEN_FIREBASE_ERROR_CODE, BAD_REQUEST);
  }
}

export default FirebaseTokenError;
