import { BAD_REQUEST } from 'http-status-codes';

import ErrorBase from './ErrorBase';
import ErrorCodes from '../constants/ErrorCodes';

class ServiceAddressNotFoundError extends ErrorBase {
  public constructor(identifier: string | number) {
    super(`Service Address: ${identifier} is not found`, ErrorCodes.SERVICE_ADDRESS_NOT_FOUND_ERROR_CODE, BAD_REQUEST);
  }
}

export default ServiceAddressNotFoundError;
