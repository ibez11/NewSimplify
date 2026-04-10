import { BAD_REQUEST } from 'http-status-codes';

import ErrorBase from './ErrorBase';
import ErrorCodes from '../constants/ErrorCodes';

class HaveUnpaidInvoicesError extends ErrorBase {
  public constructor() {
    super(`Have unpaid invoice`, ErrorCodes.HAVE_UNPAID_INVOICES_ERROR_CODE, BAD_REQUEST);
  }
}

export default HaveUnpaidInvoicesError;
