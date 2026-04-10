import { BAD_REQUEST } from 'http-status-codes';

import ErrorBase from './ErrorBase';
import ErrorCodes from '../constants/ErrorCodes';

class ServiceItemNotFoundError extends ErrorBase {
  public constructor(identifier: string | number) {
    super(`Service Item : ${identifier} is not found`, ErrorCodes.SERVICE_ITEM_NOT_FOUND_ERROR_CODE, BAD_REQUEST);
  }
}

export default ServiceItemNotFoundError;
