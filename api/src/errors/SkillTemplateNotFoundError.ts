import { BAD_REQUEST } from 'http-status-codes';

import ErrorBase from './ErrorBase';
import ErrorCodes from '../constants/ErrorCodes';

class SkillTemplateNotFoundError extends ErrorBase {
  public constructor(identifier: string | number) {
    super(`Skill Template: ${identifier} is not found`, ErrorCodes.SKILL_TEMPLATE_NOT_FOUND_ERROR_CODE, BAD_REQUEST);
  }
}

export default SkillTemplateNotFoundError;
