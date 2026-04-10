import { dummyRoleGrants } from 'constants/dummy';

export const isUserAuthenticated = (currentUser?: CurrentUser): boolean => {
  return currentUser ? true : false;
};

export const getCurrentUserDisplayName = (currentUser?: CurrentUser): string => {
  return currentUser ? currentUser.displayName : '';
};

export const getCurrentUserAvatarName = (currentUser?: CurrentUser): string => {
  return currentUser ? currentUser.displayName[0].toUpperCase() : '';
};

export const getCurrentCompanyName = (currentUser?: CurrentUser): string => {
  return currentUser ? currentUser.tenant : '';
};

export const getCurrentUserId = (currentUser?: CurrentUser): number => {
  return currentUser ? currentUser.id : 0;
};

export const getCurrentExpiredDate = (currentUser?: CurrentUser): string => {
  return currentUser ? currentUser.tenantExpDate : '';
};

export const getCurrentNotifToken = (currentUser?: CurrentUser): string => {
  return currentUser ? currentUser.token : '';
};

export const getCurrentClientEmailReminder = (currentUser?: CurrentUser): boolean => {
  return currentUser ? currentUser.clientEmailRemider : false;
};

export const getCurrentSyncApp = (currentUser?: CurrentUser): boolean => {
  return currentUser ? currentUser.syncApp : false;
};

export const getCurrentRoleGrants = (currentUser?: CurrentUser): RoleGrantModel[] => {
  return currentUser ? currentUser.roleGrants : dummyRoleGrants;
};

export const getCurrentCustomerBooking = (currentUser?: CurrentUser): boolean => {
  return currentUser ? currentUser.isBookingEnabled : false;
};
