import { UNAUTHORIZED } from 'http-status-codes';

import ErrorBase from './ErrorBase';
import ErrorCodes from '../constants/ErrorCodes';

class InactiveAccount extends ErrorBase {
  public constructor() {
    super(`Account is inactive.`, ErrorCodes.INACTIVE_ACCOUNT, UNAUTHORIZED);
  }
}

export default InactiveAccount;
