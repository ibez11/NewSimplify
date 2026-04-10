import { BAD_REQUEST } from 'http-status-codes';

import ErrorBase from './ErrorBase';
import ErrorCodes from '../constants/ErrorCodes';

class JobLabelTemplateNotFoundError extends ErrorBase {
  public constructor(identifier: string | number) {
    super(`Job Label Template: ${identifier} is not found`, ErrorCodes.JOB_LABEL_TEMPLATE_NOT_FOUND_ERROR_CODE, BAD_REQUEST);
  }
}

export default JobLabelTemplateNotFoundError;
