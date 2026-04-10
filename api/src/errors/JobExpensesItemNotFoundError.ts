import { BAD_REQUEST } from 'http-status-codes';

import ErrorBase from './ErrorBase';
import ErrorCodes from '../constants/ErrorCodes';

class JobExpensesItemNotFoundError extends ErrorBase {
  public constructor(identifier: string | number) {
    super(`Job Expenses Item: ${identifier} is not found`, ErrorCodes.JOB_EXPENSES_ITEM_NOT_FOUND_ERROR_CODE, BAD_REQUEST);
  }
}

export default JobExpensesItemNotFoundError;
