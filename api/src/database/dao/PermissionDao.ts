import { getTableName, getPermissionModel } from '../models';
// eslint-disable-next-line
import Permission from '../models/Permission';
import { sequelize } from '../../config/database';
import TableNames from '../enums/TableNames';
import { QueryTypes } from 'sequelize';

export const getDistinctPermissionsByUserId = async (userId: number): Promise<Permission[]> => {
  const model = getPermissionModel();

  const UserProfile = getTableName(TableNames.UserProfile);
  const UserProfileRole = getTableName(TableNames.UserProfileRole);
  const RolePermission = getTableName(TableNames.RolePermission);
  const Permission = getTableName(TableNames.Permission);

  return sequelize.query<Permission>(
    `SELECT DISTINCT p.*
        FROM ${UserProfile} up
           JOIN ${UserProfileRole} upr ON up.id = upr."userProfileId"
           JOIN ${RolePermission} rp ON rp."roleId" = upr."roleId"
           JOIN ${Permission} p ON p.id = rp."permissionId"
        WHERE upr."userProfileId" = $userId;`,
    {
      type: QueryTypes.SELECT,
      bind: {
        userId
      },
      mapToModel: true,
      model
    }
  );
};

export const getAllPermission = async (): Promise<Permission[]> => {
  const model = getPermissionModel();

  return model.findAll<Permission>();
};
