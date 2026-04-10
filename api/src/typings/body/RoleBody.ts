import { RoleGrantResponseModel } from '../ResponseFormats';

export interface RoleBody {
  name: string;
  description?: string;
  isEdited: boolean;
  roleGrants: RoleGrantResponseModel[];
}
