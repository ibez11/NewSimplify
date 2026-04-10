import { BAD_REQUEST } from 'http-status-codes';

import ErrorBase from './ErrorBase';
import ErrorCodes from '../constants/ErrorCodes';

class TableColumnSettingNotFoundError extends ErrorBase {
  public constructor(identifier: string | number) {
    super(`Table Column Setting : ${identifier} is not found`, ErrorCodes.TABLE_COLUMN_SETTING_NOT_FOUND_ERROR_CODE, BAD_REQUEST);
  }
}

export default TableColumnSettingNotFoundError;
