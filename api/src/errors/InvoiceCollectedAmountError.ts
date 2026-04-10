import { BAD_REQUEST } from 'http-status-codes';

import ErrorBase from './ErrorBase';
import ErrorCodes from '../constants/ErrorCodes';

class InvoiceCollectedAmountError extends ErrorBase {
  public constructor(identifier: string | number) {
    super(
      `Invoice ${identifier} Collected amount is more than Total Job Collected Amount`,
      ErrorCodes.INVOICE_COLLECTED_AMOUNT_ERROR_CODE,
      BAD_REQUEST
    );
  }
}

export default InvoiceCollectedAmountError;
