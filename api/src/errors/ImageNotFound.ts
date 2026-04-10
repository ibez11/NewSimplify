import { BAD_REQUEST } from 'http-status-codes';

import ErrorBase from './ErrorBase';
import ErrorCodes from '../constants/ErrorCodes';

class ImageNotFound extends ErrorBase {
  public constructor(identifier: string | number) {
    super(`Image: ${identifier} is not found`, ErrorCodes.IMAGE_NOT_FOUND_ERROR_CODE, BAD_REQUEST);
  }
}

export default ImageNotFound;
