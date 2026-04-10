import { BAD_REQUEST } from 'http-status-codes';

import ErrorBase from './ErrorBase';
import ErrorCodes from '../constants/ErrorCodes';

export class DuplicatedInvoiceNumberError extends ErrorBase {
  public constructor() {
    super('Duplicated Invoice Number', ErrorCodes.DUPLICATED_INVOICE_ERROR_CODE, BAD_REQUEST);
  }
}

export class DuplicatedInvoiceError extends ErrorBase {
  public constructor() {
    super('Duplicate invoice: This quotation already has an associated invoice', ErrorCodes.DUPLICATED_INVOICE_ERROR_CODE, BAD_REQUEST);
  }
}
