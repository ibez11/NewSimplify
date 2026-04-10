import { BAD_REQUEST } from 'http-status-codes';

import ErrorBase from './ErrorBase';
import ErrorCodes from '../constants/ErrorCodes';

class DuplicatedAgentError extends ErrorBase {
  public constructor() {
    super('Duplicated Equipment', ErrorCodes.DUPLICATED_EQUIPMENT_ERROR_CODE, BAD_REQUEST);
  }
}

export default DuplicatedAgentError;
