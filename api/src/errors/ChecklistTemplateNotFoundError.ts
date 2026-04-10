import { BAD_REQUEST } from 'http-status-codes';

import ErrorBase from './ErrorBase';
import ErrorCodes from '../constants/ErrorCodes';

class ChecklistTemplateNotFoundError extends ErrorBase {
  public constructor(identifier: string | number) {
    super(`Checklist Template: ${identifier} is not found`, ErrorCodes.CHECKLIST_TEMPLATE_NOT_FOUND_ERROR_CODE, BAD_REQUEST);
  }
}

export default ChecklistTemplateNotFoundError;
