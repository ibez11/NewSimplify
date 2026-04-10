import { BAD_REQUEST } from 'http-status-codes';

import ErrorBase from './ErrorBase';
import ErrorCodes from '../constants/ErrorCodes';

class ServiceNotEditableError extends ErrorBase {
  public constructor(identifier: string | number) {
    super(`Contract : ${identifier} is not editable`, ErrorCodes.NOT_EDITABLE_ERROR_CODE, BAD_REQUEST);
  }
}

export default ServiceNotEditableError;
