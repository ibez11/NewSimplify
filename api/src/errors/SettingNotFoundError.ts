import { BAD_REQUEST } from 'http-status-codes';

import ErrorBase from './ErrorBase';
import ErrorCodes from '../constants/ErrorCodes';

class SettingNotFoundError extends ErrorBase {
  public constructor(identifier: string | number) {
    super(`Setting : ${identifier} is not found`, ErrorCodes.SETTING_NOT_FOUND_ERROR_CODE, BAD_REQUEST);
  }
}

export default SettingNotFoundError;
