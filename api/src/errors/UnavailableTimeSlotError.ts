import { BAD_REQUEST } from 'http-status-codes';

import ErrorBase from './ErrorBase';
import ErrorCodes from '../constants/ErrorCodes';

class UnavailableTimeSlotError extends ErrorBase {
  public constructor($identifier: string) {
    super(`The selected time slot on ${$identifier} is unavailable.`, ErrorCodes.UNAVALABLE_TIME_SLOT_ERROR_CODE, BAD_REQUEST);
  }
}

export default UnavailableTimeSlotError;
