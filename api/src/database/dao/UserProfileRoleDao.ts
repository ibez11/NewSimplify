import { sequelize } from '../../config/database';
import { getTableName } from '../models';
import TableNames from '../enums/TableNames';
import { QueryTypes, Transaction } from 'sequelize';
import { UserProfileRoleResponseModel } from '../../typings/ResponseFormats';

export const getByUserProfileId = async (userProfileId: number): Promise<UserProfileRoleResponseModel> => {
  const UserProfileRole = getTableName(TableNames.UserProfileRole);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any[] = await sequelize.query(`SELECT "roleId" FROM ${UserProfileRole} WHERE "userProfileId" = ${userProfileId} LIMIT 1`, {
    type: QueryTypes.SELECT
  });

  return result.length > 0 ? result[0] : null;
};

export const create = async (userProfileId: number, roleId: number, transaction: Transaction): Promise<[number, number]> => {
  const UserProfileRole = getTableName(TableNames.UserProfileRole);
  const currentDateTime = new Date();

  return sequelize.query(
    `INSERT INTO ${UserProfileRole} ("userProfileId", "roleId", "createdAt", "updatedAt") VALUES ($userProfileId, $roleId, $createdAt, $updatedAt)`,
    {
      type: QueryTypes.INSERT,
      bind: {
        userProfileId,
        roleId,
        createdAt: currentDateTime,
        updatedAt: currentDateTime
      },
      transaction
    }
  );
};

export const update = async (userProfileId: number, roleId: number, transaction: Transaction): Promise<void> => {
  await removeAllByUserProfileId(userProfileId, transaction);
  await create(userProfileId, roleId, transaction);
};

export const removeAllByUserProfileId = async (userProfileId: number, transaction: Transaction): Promise<void> => {
  const UserProfileRole = getTableName(TableNames.UserProfileRole);

  return sequelize.query(`DELETE FROM ${UserProfileRole} WHERE "userProfileId" = $userProfileId`, {
    type: QueryTypes.DELETE,
    bind: { userProfileId },
    transaction
  });
};
