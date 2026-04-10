interface CurrentUser {
  id: number;
  displayName: string;
  email: string;
  contactNumber: string;
  permissions: string[];
  tenant: string;
  tenantExpDate: string;
  role: string;
  roleId: number;
  token: string;
  clientEmailRemider: boolean;
  syncApp: boolean;
  roleGrants: RoleGrantModel[];
  isBookingEnabled: boolean;
}

interface permissions {
  module: string;
  accessLevel: string;
}

interface tenant {
  key: string;
  name: string;
  numberOfLicense: number;
  salesPerson: string;
}
