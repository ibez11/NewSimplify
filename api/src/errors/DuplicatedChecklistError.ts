import { BAD_REQUEST } from 'http-status-codes';

import ErrorBase from './ErrorBase';
import ErrorCodes from '../constants/ErrorCodes';

class DuplicatedChecklistError extends ErrorBase {
  public constructor() {
    super('Duplicated Checklist Template', ErrorCodes.DUPLICATED_CHECKLIST_TEMPLATE_ERROR_CODE, BAD_REQUEST);
  }
}

export default DuplicatedChecklistError;
