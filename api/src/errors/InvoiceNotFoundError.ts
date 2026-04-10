import { BAD_REQUEST } from 'http-status-codes';

import ErrorBase from './ErrorBase';
import ErrorCodes from '../constants/ErrorCodes';

class InvoiceNotFoundError extends ErrorBase {
  public constructor(identifier: string | number) {
    super(`Invoice: ${identifier} is not found`, ErrorCodes.INVOICE_NOT_FOUND_ERROR_CODE, BAD_REQUEST);
  }
}

export default InvoiceNotFoundError;
