import { BAD_REQUEST } from 'http-status-codes';

import ErrorBase from './ErrorBase';
import ErrorCodes from '../constants/ErrorCodes';

class EquipmentNotFoundError extends ErrorBase {
  public constructor(identifier: string | number) {
    super(`Equipment: ${identifier} is not found`, ErrorCodes.EQUIPMENT_NOT_FOUND_ERROR_CODE, BAD_REQUEST);
  }
}

export default EquipmentNotFoundError;
