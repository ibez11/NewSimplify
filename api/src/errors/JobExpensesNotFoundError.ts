import { BAD_REQUEST } from 'http-status-codes';

import ErrorBase from './ErrorBase';
import ErrorCodes from '../constants/ErrorCodes';

class JobExpensesNotFoundError extends ErrorBase {
  public constructor(identifier: string | number) {
    super(`Job Expenses: ${identifier} is not found`, ErrorCodes.JOB_EXPENSES_NOT_FOUND_ERROR_CODE, BAD_REQUEST);
  }
}

export default JobExpensesNotFoundError;
