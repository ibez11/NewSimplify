import jwt from 'jsonwebtoken';

import Logger from '../Logger';
import User from '../database/models/User';
import * as UserDao from '../database/dao/UserDao';
import { verifyUserPassword } from './PasswordService';
import InvalidUserError from '../errors/InvalidUserError';
import InactiveAccount from '../errors/InactiveAccount';
import InvalidPasswordError from '../errors/InvalidPasswordError';
import RedisClient, { getRedisKey, RedisKeyType } from '../config/RedisClient';
import UserLockedError from '../errors/UserLockedError';
import { PermissionResponseModel } from '../typings/ResponseFormats';

const LOG = new Logger('AuthService.ts');

export const verifyUserCredentials = async (loginName: string, inputPassword: string): Promise<User> => {
  const user = await UserDao.getByLoginName(loginName);

  if (!user) {
    LOG.warn(`Invalid user: ${loginName} does not exist`);
    throw new InvalidUserError();
  }
  if (!user.get('active')) {
    LOG.warn(`User: ${loginName} account is inactive`);
    throw new InactiveAccount();
  }

  if (user.get('lock')) {
    LOG.warn(`User: ${loginName} account is locked`);
    throw new UserLockedError(loginName);
  }

  if (!(await verifyUserPassword(user, inputPassword))) {
    LOG.warn(`User: ${loginName} tried logging in with invalid password`);
    throw new InvalidPasswordError(user);
  }

  return user;
};

export const verifyContactNumber = async (countryCode: string, contactNumber: string): Promise<User> => {
  const user = await UserDao.getByContactNumber(countryCode, contactNumber);

  if (!user) {
    LOG.warn(`Invalid user: ${contactNumber} does not exist`);
    throw new InvalidUserError();
  }
  if (!user.get('active')) {
    LOG.warn(`User: ${contactNumber} account is inactive`);
    throw new InactiveAccount();
  }

  if (user.get('lock')) {
    LOG.warn(`User: ${contactNumber} account is locked`);
    throw new UserLockedError(contactNumber);
  }

  return user;
};

export const generateUserJwt = (user: User, permissions: PermissionResponseModel[], jwtid: string): string => {
  const body = {
    id: user.get('id'),
    tenant: user.get('TenantKey'),
    permissions
  };

  return jwt.sign(body, process.env.APP_SECRET, { jwtid, expiresIn: process.env.JWT_EXPIRE_LOGIN_TIME });
};

export const checkInvalidLoginCountsAndLock = async (user: User): Promise<void> => {
  const invalidLoginCounts = user.get('invalidLogin');
  const { NUMBER_OF_ALLOWED_INVALID_LOGINS = '6' } = process.env;

  if (invalidLoginCounts + 1 >= +NUMBER_OF_ALLOWED_INVALID_LOGINS) {
    user.set('lock', true);
  }

  user.set('invalidLogin', invalidLoginCounts + 1);

  await user.save();
};

export const createSession = async (user: User, sessionId: string): Promise<void> => {
  const userId = user.get('id');

  // Popping out the oldest session when user exceeds the number of concurrent logins
  const concurrentLoginsAllowed = user.get('concurrency');
  const authenticationListKey = getRedisKey(RedisKeyType.AUTHENTICATION_LIST, userId);
  const authenticationSetKey = getRedisKey(RedisKeyType.AUTHENTICATION_SET, userId);
  const concurrentLogins = await RedisClient.llen(authenticationListKey);

  if (concurrentLogins !== 0 && concurrentLoginsAllowed - 1 <= concurrentLogins) {
    const poppedValue = await RedisClient.lpop(authenticationListKey);
    await RedisClient.srem(authenticationSetKey, poppedValue);
  }

  // List for popping out oldest session
  // Set for fast checking existence
  await RedisClient.sadd(authenticationSetKey, sessionId);
  await RedisClient.rpush(authenticationListKey, sessionId);
};

export const resetInvalidLoginCounts = async (user: User): Promise<void> => {
  await user.update({ invalidLogin: 0 });
};

export const checkIfValidSession = async (userId: number, sessionId: string): Promise<boolean> => {
  const user = await UserDao.getById(userId);

  if (!user || !user.get('active')) {
    return false;
  }

  const isValidSession = await RedisClient.sismember(getRedisKey(RedisKeyType.AUTHENTICATION_SET, userId), sessionId);

  // casting to boolean
  return isValidSession > 0;
};

export const destroySession = async (userId: number, sessionId: string): Promise<void> => {
  const authenticationListKey = getRedisKey(RedisKeyType.AUTHENTICATION_LIST, userId);
  const authenticationSetKey = getRedisKey(RedisKeyType.AUTHENTICATION_SET, userId);

  await RedisClient.lrem(authenticationListKey, 0, sessionId);
  await RedisClient.srem(authenticationSetKey, sessionId);
};
