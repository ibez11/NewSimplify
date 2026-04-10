import { BAD_REQUEST } from 'http-status-codes';

import ErrorBase from './ErrorBase';
import ErrorCodes from '../constants/ErrorCodes';

class AgentNotFoundError extends ErrorBase {
  public constructor(identifier: string | number) {
    super(`Agent Template: ${identifier} is not found`, ErrorCodes.AGENT_NOT_FOUND_ERROR_CODE, BAD_REQUEST);
  }
}

export default AgentNotFoundError;
