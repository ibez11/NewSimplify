/* eslint-disable @typescript-eslint/no-explicit-any */
import Logger from '../Logger';
import * as UserDao from '../database/dao/UserDao';
import * as UserProfileDao from '../database/dao/UserProfileDao';
import * as PermissionDao from '../database/dao/PermissionDao';
import * as UserProfileRoleDao from '../database/dao/UserProfileRoleDao';
import * as UserSkillDao from '../database/dao/UserSkillDao';
import * as JobDao from '../database/dao/JobDao';
import * as TenantService from './TenantService';
import * as DistrictService from './DistrictService';

import User from '../database/models/User';
import UserProfile from '../database/models/UserProfile';
import Permission from '../database/models/Permission';

import { sequelize } from '../config/database';
import DuplicatedUserError from '../errors/DuplicatedUserError';
import UserNotFoundError from '../errors/UserNotFoundError';
import DuplicatedContactNumber from '../errors/DuplicatedContactNumber';
import InvalidCurrentPasswordError from '../errors/InvalidCurrentPasswordError';
import ExceededLicenseUsageError from '../errors/ExceededLicenseUsageError';
import FirebaseTokenError from '../errors/FirebaseTokenError';
import { verifyUserPassword, generateRandomPassword } from './PasswordService';
import * as EmailService from './EmailService';
import * as FirebaseService from './FirebaseService';
import { UserDetailsResponseModel, ActiveUserResponseModel } from '../typings/ResponseFormats';
import { hashPassword } from './PasswordService';
import { JobStatus } from '../database/models/Job';
import JobHaveOtherInProgressError from '../errors/JobHaveOtherInProgressError';
import RoleChangeError from '../errors/RoleChangeError';

const LOG = new Logger('UserService.ts');

/**
 * Search user with query and optional pagination
 *
 * @param s offset for pagination search
 * @param l limit for pagination search
 * @param q query for searching
 *
 * @returns the total counts and the data for current page
 */
export const searchUsersWithPagination = async (
  offset: number,
  limit?: number,
  q?: string,
  role?: string,
  order?: string
): Promise<{ count: number; rows: UserDetailsResponseModel[] }> => {
  LOG.debug('Searching Users with Pagination');

  const { rows, count } = await UserProfileDao.getPaginated(offset, limit, q, role, order);

  return { rows, count };
};

/**
 * Get UserProfile based on userId
 * @param userId the id of the desired UserProfile
 *
 * @returns the user profile
 */
export const getUserProfile = async (userId: number): Promise<UserProfile> => {
  LOG.debug('Getting User Profile from userId');

  const userProfile = await UserProfileDao.getById(userId);

  return userProfile;
};

/**
 * Get all distinct permission of the user
 *
 * @param userId the id of the desired user
 *
 * @returns a array of distinct permission
 */
export const getUserPermissions = async (userId: number): Promise<Permission[]> => {
  LOG.debug('Getting User Permissions from userId');

  const permissions = (await PermissionDao.getDistinctPermissionsByUserId(userId)) as Permission[];

  return permissions;
};

export const getUserFullDetailsById = async (userId: number): Promise<UserDetailsResponseModel> => {
  LOG.debug('Getting User full details from userId');

  const user = await UserProfileDao.getUserFullDetails(userId);

  return user;
};

export const getUserFullDetailsBySyncId = async (syncId: number): Promise<UserProfile> => {
  LOG.debug('Getting User full details from syncId');

  const user = await UserProfileDao.getUserFullDetailsBySyncId(syncId);

  return user;
};

/**
 * Check if a user with the same loginName exists
 * Create a new user in the system, based on current user tenancy
 *
 * @param displayName of the new user
 * @param email of the new user
 * @param contactNumber of the new user
 * @param password of the new user
 * @param roleId of the new user
 * @param tenant of the user
 *
 * @returns UserDetailsModel
 */
export const createUser = async (
  displayName: string,
  email: string,
  password: string,
  countryCode: string,
  contactNumber: string,
  roleId: number,
  tenant: string,
  skills?: [{ name: string }],
  homeDistrict?: string,
  homePostalCode?: string
): Promise<UserDetailsResponseModel> => {
  LOG.debug('Creating User');

  if (await isUserExistsByLoginName(email)) {
    throw new DuplicatedUserError();
  }

  if (await isContactNumberExists(contactNumber)) {
    throw new DuplicatedContactNumber();
  }

  if (!(await TenantService.validateLicenseLimit(tenant))) {
    throw new ExceededLicenseUsageError();
  }

  const transaction = await sequelize.transaction();

  try {
    let newPassword = password;

    if (roleId === 2) {
      newPassword = generateRandomPassword();
    }

    const user = await UserDao.createUser(email, newPassword, tenant, countryCode, contactNumber, transaction);
    const userProfile = await UserProfileDao.createUserProfile(
      user,
      displayName,
      countryCode,
      contactNumber,
      homeDistrict,
      homePostalCode,
      transaction
    );
    await UserProfileRoleDao.create(userProfile.get('id'), roleId, transaction);

    if (skills) {
      await Promise.all(
        skills.map(async skill => {
          await UserSkillDao.create(userProfile.get('id'), skill.name, transaction);
        })
      );
    }

    await EmailService.sendNewUserWelcomeEmail(
      userProfile.email,
      userProfile.displayName,
      password,
      userProfile.email,
      roleId,
      `${countryCode}${contactNumber}`
    );

    await transaction.commit();

    return await getUserFullDetailsById(user.id);
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};

/**
 *
 * @param displayName to be updated
 * @param email to be updated
 * @param contactNumber to be updated
 * @param roleId to be updated
 *
 * @returns void
 */
export const editUser = async (
  userId: number,
  displayName?: string,
  email?: string,
  newPassword?: string,
  countryCode?: string,
  contactNumber?: string,
  oldContactNumber?: string,
  roleId?: number,
  token?: string,
  skills?: [{ name: string }],
  homeDistrict?: string,
  homePostalCode?: string
): Promise<UserDetailsResponseModel> => {
  LOG.debug('Editing User');

  const user = await UserDao.getById(userId);
  const userProfile = await UserProfileDao.getById(userId);
  const currentRole = await UserProfileRoleDao.getByUserProfileId(userId);

  if (!user || !userProfile) {
    throw new UserNotFoundError(userId);
  }

  if (user.loginName !== email && (await isUserExistsByLoginName(email))) {
    throw new DuplicatedUserError();
  }

  if (contactNumber && oldContactNumber) {
    if (contactNumber !== oldContactNumber) {
      if (await isContactNumberExists(contactNumber)) {
        throw new DuplicatedContactNumber();
      }
    }
  }

  const transaction = await sequelize.transaction();

  let newHashPassword = undefined;
  if (newPassword) {
    newHashPassword = await hashPassword(newPassword);
  }

  try {
    console.log('HOME ADDRESS', homeDistrict);
    console.log('HOME POSTAL CODE', homePostalCode);
    await user.update({ loginName: email, password: newHashPassword, countryCode, contactNumber }, { transaction });
    await userProfile.update({ email, displayName, countryCode, contactNumber, token, homeDistrict, homePostalCode }, { transaction });

    if (roleId && roleId !== currentRole.roleId) {
      if (userProfile.token != null) {
        throw new RoleChangeError();
      } else {
        await UserProfileRoleDao.update(userId, roleId, transaction);
        await editUserTokenNotification(userId, null);
      }
    }

    if (skills) {
      await UserSkillDao.removeAllByUserProfileId(userProfile.get('id'), transaction);

      await Promise.all(
        skills.map(async skill => {
          await UserSkillDao.create(userProfile.get('id'), skill.name, transaction);
        })
      );
    }

    await transaction.commit();

    return await getUserFullDetailsById(user.id);
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};

/**
 * To activate (undelete) a user. Need to check for the licenses of Tenant
 *
 * @param userId of the user to be activated.
 *
 * @returns void
 */
export const activateUser = async (userId: number): Promise<User> => {
  const user = await UserDao.getById(userId);
  const tenantKey = user.get('TenantKey') as string;

  if (!(await TenantService.validateLicenseLimit(tenantKey))) {
    throw new ExceededLicenseUsageError();
  }

  return user.update({ active: true });
};

/**
 * To unlock a user (and reset failed login count)
 *
 * @param userId of the user to be unlocked.
 *
 * @returns void
 */
export const unlockUser = async (userId: number): Promise<User> => {
  const user = await UserDao.getById(userId);

  if (!user) {
    throw new UserNotFoundError(userId);
  }

  return user.update({ lock: false, invalidLogin: 0 });
};

/**
 * To deactivate (soft delete) a user
 *
 * @param userId of the user to be deactivated
 *
 * @returns void
 */
export const deactivateUser = async (userId: number): Promise<User> => {
  const user = await UserDao.getById(userId);
  const anotherInProgressJob = await JobDao.getJobsByTecnician(userId, JobStatus.IN_PROGRESS);

  if (anotherInProgressJob.length > 0) {
    throw new JobHaveOtherInProgressError();
  }

  if (!user) {
    throw new UserNotFoundError(userId);
  }

  return user.update({ active: false });
};

/**
 * Check if a user exists
 *
 * @param loginName of the required user
 *
 * @returns boolean
 */
export const isUserExistsByLoginName = async (loginName: string): Promise<boolean> => {
  return (await UserDao.countByLoginName(loginName)) > 0;
};

/**
 * Check if a contact number exists
 *
 * @param contactNumber of the required user
 *
 * @returns boolean
 */
export const isContactNumberExists = async (contactNumber: string): Promise<boolean> => {
  return (await UserDao.countByContactNumber(contactNumber)) > 0;
};

/**
 * get all active users
 */
export const getActiveUsers = async (): Promise<ActiveUserResponseModel[]> => {
  LOG.debug('Getting all active users ');

  const activeUsers = await UserProfileDao.getActiveUsers();

  return activeUsers;
};

/**
 * get all active admin
 */
export const getActiveAdmins = async (): Promise<ActiveUserResponseModel[]> => {
  LOG.debug('Getting all active users ');

  const activeUsers = await UserProfileDao.getActiveAdmins();

  return activeUsers;
};

/**
 * get all active technicians
 */
export const getActiveTechnicians = async (skills?: string): Promise<ActiveUserResponseModel[]> => {
  LOG.debug('Getting all active technicians ');

  const [technicians, adminTechnicians] = await Promise.all([UserProfileDao.getActiveTechnicians(), UserProfileDao.getActiveAdminTechnicians()]);

  // merge and dedupe by id (admins + technicians)
  const mergedMap = new Map<number, ActiveUserResponseModel>();
  [...technicians, ...adminTechnicians].forEach(t => {
    mergedMap.set(t.id, t);
  });

  let activeTechnicians = Array.from(mergedMap.values());

  if (skills) {
    const requiredSkills = skills.split(',');
    activeTechnicians.forEach(technician => {
      technician.matchNumber = 0;
      if (technician.UserSkills) {
        // eslint-disable-next-line
        const match = technician.UserSkills.filter((skill: any) => requiredSkills.includes(skill));
        technician.matchSkills = match;
        technician.matchNumber = match.length;
      }
    });

    activeTechnicians = activeTechnicians.sort((cur, next) => next.matchNumber - cur.matchNumber);
  }

  return activeTechnicians;
};

/**
 *
 * @param displayName to be updated
 * @param email to be updated
 * @param contactNumber to be updated
 * @param roleId to be updated
 *
 * @returns void
 */
export const editUserTokenNotification = async (userId: number, token: string): Promise<UserProfile> => {
  LOG.debug('Editing User Token Notification');

  const user = await UserDao.getById(userId);
  const userProfile = await UserProfileDao.getById(userId);

  if (!user || !userProfile) {
    throw new UserNotFoundError(userId);
  }

  try {
    return await userProfile.update({ token });
  } catch (err) {
    throw err;
  }
};

/**
 * Get User based on id and password
 * @param id the id of the desired id
 * @param password the password of the desired password
 *
 * @returns the user
 */
export const getVerifyCurrentPasswordUser = async (id: number, password: string): Promise<User> => {
  LOG.debug('Verify Current Password User from userId');

  const userProfile = await getUserProfile(id);
  const currentUser = await UserDao.getByLoginName(userProfile.getDataValue('email'));

  if (!(await verifyUserPassword(currentUser, password))) {
    throw new InvalidCurrentPasswordError(currentUser);
  }

  return currentUser;
};

export const updateContactNumber = async (
  userId: number,
  countryCode: string,
  contactNumber: string
): Promise<{ user: UserProfile; oldContactNumber: string }> => {
  LOG.debug('Changing current user contact number');

  const user = await UserDao.getById(userId);
  const userProfile = await UserProfileDao.getById(userId);
  if (!user) {
    throw new UserNotFoundError(userId);
  }

  const checking = await UserDao.getByContactNumber(countryCode, contactNumber);
  if (checking) {
    throw new DuplicatedContactNumber();
  }

  const oldContactNumber = user.contactNumber;

  // validate tokenFirebase
  // const verifyUid = await FirebaseService.verifyIdToken(tokenFirebase);
  // if (!verifyUid) {
  //   LOG.warn(`User : ${oldContactNumber} try change contact number with not verified firebase token`);
  //   throw new FirebaseTokenError(tokenFirebase, 'not verified firebase token');
  // }

  // // validate firebase user with current contact
  // const firebaseUser = await FirebaseService.retriveUserId(verifyUid);
  // if (firebaseUser.phoneNumber !== `+65${oldContactNumber}`) {
  //   LOG.warn(`User : ${contactNumber} try change contact number with not valid phone on firebase`);
  //   throw new FirebaseTokenError('', `+65${contactNumber} not valid phone on firebase ${firebaseUser.phoneNumber}`);
  // }

  try {
    await user.update({ countryCode, contactNumber });
    await userProfile.update({ countryCode, contactNumber });
    // await FirebaseService.deleteUserId(verifyUid);

    return { user: userProfile, oldContactNumber };
  } catch (err) {
    throw err;
  }
};

export const checkContactNumber = async (countryCode: string, contactNumber: string): Promise<User> => {
  LOG.debug('Checking contact number');
  try {
    const user = await UserDao.getByContactNumber(countryCode, contactNumber);
    return user;
  } catch (err) {
    throw err;
  }
};
