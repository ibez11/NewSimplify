import { Transaction, QueryTypes } from 'sequelize';

import { getUserProfileModel, getTableName } from '../models';
import User from '../models/User';
import TableNames from '../enums/TableNames';
import { sequelize } from '../../config/database';
import { UserDetailsResponseModel, ActiveUserResponseModel, UserTokenResponseModel } from '../../typings/ResponseFormats';
import UserNotFoundError from '../../errors/UserNotFoundError';
import UserProfile from '../models/UserProfile';

export const createUserProfile = async (
  user: User,
  displayName: string,
  countryCode: string,
  contactNumber: string,
  homeDistrict: string,
  homePostalCode: string,
  transaction: Transaction
): Promise<UserProfile> => {
  const model = getUserProfileModel();

  return model.create<UserProfile>(
    {
      id: user.get('id'),
      displayName,
      email: user.get('loginName'),
      countryCode,
      contactNumber,
      homeDistrict,
      homePostalCode
    },
    { transaction }
  );
};

export const getById = async (id: number): Promise<UserProfile> => {
  const model = getUserProfileModel();

  return model.findByPk<UserProfile>(id);
};

export const getPaginated = async (
  offset: number,
  limit: number,
  q?: string,
  role?: string,
  order?: string
): Promise<{ count: number; rows: UserDetailsResponseModel[] }> => {
  const [count, rows] = await Promise.all([getCount(q, role), get(offset, limit, q, role, order)]);

  return { count, rows };
};

export const getUserFullDetails = async (userId: number): Promise<UserDetailsResponseModel> => {
  const User = getTableName(TableNames.User);
  const UserProfile = getTableName(TableNames.UserProfile);
  const UserProfileRole = getTableName(TableNames.UserProfileRole);
  const Role = getTableName(TableNames.Role);
  const Skill = getTableName(TableNames.UserSkill);

  const result: UserDetailsResponseModel[] = await sequelize.query(
    `SELECT u.id, u.active, u.lock, up."displayName", up.email, up."countryCode", up."contactNumber", up."homeDistrict", up."homePostalCode", r."name" as role, r.id as "roleId", up."token",
      (SELECT json_agg(sk.*) FROM ${Skill} as sk WHERE sk."userProfileId" = $userId) AS "userSkills"
    FROM ${User} u
      INNER JOIN ${UserProfile} up ON u.id = up.id
      INNER JOIN ${UserProfileRole} upr ON up.id = upr."userProfileId"
      INNER JOIN ${Role} r ON upr."roleId" = r.id WHERE up.id = $userId`,
    {
      type: QueryTypes.SELECT,
      bind: {
        userId
      }
    }
  );

  if (!result.length) {
    throw new UserNotFoundError(userId);
  }

  return result[0];
};

export const get = async (offset: number, limit: number, q?: string, role?: string, order?: string): Promise<UserDetailsResponseModel[]> => {
  const User = getTableName(TableNames.User);
  const UserProfile = getTableName(TableNames.UserProfile);
  const UserProfileRole = getTableName(TableNames.UserProfileRole);
  const Role = getTableName(TableNames.Role);
  const Skill = getTableName(TableNames.UserSkill);
  const where = generateWhereQuery(q, role);
  const offsetAndLimit = generateOffsetAndLimit(offset, limit);

  let orderData = 'up."displayName"';

  if (order) {
    orderData = 'up."id"';
  }

  const result: UserDetailsResponseModel[] = await sequelize.query(
    `SELECT u.id, u.active, u.lock, up."displayName", up.email, up."countryCode", up."contactNumber", up."homeDistrict", up."homePostalCode", up."token", r."name" as role, r.id as "roleId",
      (SELECT json_agg(sk.*) FROM ${Skill} as sk WHERE sk."userProfileId" = up.id) AS "userSkills"
      FROM ${User} u
        INNER JOIN ${UserProfile} up ON u.id = up.id
        INNER JOIN ${UserProfileRole} upr ON up.id = upr."userProfileId"
        INNER JOIN ${Role} r ON upr."roleId" = r.id
        ${where} ORDER BY ${orderData} ${offsetAndLimit}`,
    {
      type: QueryTypes.SELECT
    }
  );

  return result;
};

export const getCount = async (q?: string, role?: string): Promise<number> => {
  const UserProfile = getTableName(TableNames.UserProfile);
  const UserProfileRole = getTableName(TableNames.UserProfileRole);
  const where = generateWhereQuery(q, role);

  const result: CountQueryReturn = await sequelize.query(
    `SELECT count(*)
      FROM ${UserProfile} up
        INNER JOIN ${UserProfileRole} upr ON up.id = upr."userProfileId"
      ${where}`,
    {
      type: QueryTypes.SELECT
    }
  );

  return +result[0].count;
};

const generateWhereQuery = (q?: string, role?: string): string => {
  const conditions: string[] = [];

  if (!q && !role) {
    return '';
  }

  if (q) {
    conditions.push(`(up."displayName" ILIKE '%${q}%' OR up."email" ILIKE '%${q}%' OR up."contactNumber" ILIKE '%${q}%')`);
  }

  if (role) {
    conditions.push(`upr."roleId" = ${escape(role)}`);
  }

  return `WHERE ${conditions.join(' AND ')}`;
};

const generateOffsetAndLimit = (offset?: number, limit?: number): string => {
  if (offset === undefined) {
    return '';
  }

  let offsetAndLimit = `OFFSET ${offset}`;

  if (limit !== undefined) {
    offsetAndLimit += ` LIMIT ${limit}`;
  }

  return offsetAndLimit;
};

export const getActiveUsers = async (): Promise<ActiveUserResponseModel[]> => {
  const User = getTableName(TableNames.User);
  const UserProfile = getTableName(TableNames.UserProfile);

  const result: ActiveUserResponseModel[] = await sequelize.query(
    `SELECT up.id, up."displayName", up."countryCode", up."contactNumber"
        FROM ${UserProfile} up
        INNER JOIN ${User} u ON up.id = u.id
        WHERE u.active = true
        ORDER BY up."displayName"`,
    {
      type: QueryTypes.SELECT
    }
  );

  return result;
};

export const getActiveTechnicians = async (): Promise<ActiveUserResponseModel[]> => {
  const User = getTableName(TableNames.User);
  const UserProfile = getTableName(TableNames.UserProfile);
  const UserProfileRole = getTableName(TableNames.UserProfileRole);
  const UserSkill = getTableName(TableNames.UserSkill);

  const result: ActiveUserResponseModel[] = await sequelize.query(
    `SELECT
        up.id,
        up."displayName",
        up."countryCode",
        up."contactNumber",
        up."homeDistrict",
        up."homePostalCode",
        (SELECT json_agg(us.skill) FROM ${UserSkill} as us WHERE us."userProfileId" = up."id") AS "UserSkills"
      FROM ${UserProfile} up
      INNER JOIN ${User} u ON up.id = u.id
      INNER JOIN ${UserProfileRole} upr ON up.id = upr."userProfileId"
      WHERE u.active = true AND  upr."roleId" != 1
      ORDER BY up."displayName"
    `,
    {
      type: QueryTypes.SELECT
    }
  );

  return result;
};

export const getActiveAdmins = async (): Promise<ActiveUserResponseModel[]> => {
  const User = getTableName(TableNames.User);
  const UserProfile = getTableName(TableNames.UserProfile);
  const UserProfileRole = getTableName(TableNames.UserProfileRole);
  const UserSkill = getTableName(TableNames.UserSkill);

  const result: ActiveUserResponseModel[] = await sequelize.query(
    `SELECT
        up.id,
        up."displayName",
        up."token",
        (SELECT json_agg(us.skill) FROM ${UserSkill} as us WHERE us."userProfileId" = up."id") AS "UserSkills"
      FROM ${UserProfile} up
      INNER JOIN ${User} u ON up.id = u.id
      INNER JOIN ${UserProfileRole} upr ON up.id = upr."userProfileId"
      WHERE u.active = true AND  upr."roleId" = 1
      ORDER BY up."displayName"
    `,
    {
      type: QueryTypes.SELECT
    }
  );

  return result;
};

export const getActiveAdminTechnicians = async (): Promise<ActiveUserResponseModel[]> => {
  const User = getTableName(TableNames.User);
  const UserProfile = getTableName(TableNames.UserProfile);
  const UserProfileRole = getTableName(TableNames.UserProfileRole);
  const UserSkill = getTableName(TableNames.UserSkill);
  const UserProfileJob = getTableName(TableNames.UserProfileJob);

  const result: ActiveUserResponseModel[] = await sequelize.query(
    `SELECT
        up.id,
        up."displayName",
        up."countryCode",
        up."contactNumber",
        up."homeDistrict",
        up."homePostalCode",
        (SELECT json_agg(us.skill) FROM ${UserSkill} as us WHERE us."userProfileId" = up."id") AS "UserSkills"
      FROM ${UserProfile} up
      INNER JOIN ${User} u ON up.id = u.id
      INNER JOIN ${UserProfileRole} upr ON up.id = upr."userProfileId"
      INNER JOIN ${UserProfileJob} upj ON up.id = upj."userProfileId"
      WHERE u.active = true AND upr."roleId" = 1
      ORDER BY up."displayName"
    `,
    {
      type: QueryTypes.SELECT
    }
  );

  return result;
};

export const getAdminTokens = async (tenantKey: string): Promise<UserTokenResponseModel[]> => {
  const result: UserTokenResponseModel[] = await sequelize.query(
    `SELECT up.id, up."displayName", up."token"
    FROM "${tenantKey}"."UserProfile" up
    INNER JOIN "${tenantKey}"."UserProfileRole" upr ON up.id = upr."userProfileId"
    WHERE upr."roleId" = 1
    ORDER BY up."id" `,
    {
      type: QueryTypes.SELECT
    }
  );

  return result;
};

export const getUserFullDetailsBySyncId = async (syncId: number): Promise<UserProfile> => {
  const User = getUserProfileModel();

  return User.findOne<UserProfile>({ where: { syncId } });
};
