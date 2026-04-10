import { UserProfileResponseModel, PermissionResponseModel } from './ResponseFormats';

interface UserProfileWithPermissionsModel extends UserProfileResponseModel {
  permissions?: PermissionResponseModel[];
  tenant?: string;
  tenantExpDate?: Date;
  jobHistoryVisibility?: boolean;
  clientWAReminder?: boolean;
  clientEmailRemider?: boolean;
  syncApp?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  roleGrants?: any[];
  isBookingEnabled?: boolean;
}
