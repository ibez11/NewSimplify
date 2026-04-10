import {
  DataTypes,
  Association,
  BelongsToManyGetAssociationsMixin,
  BelongsToManyAddAssociationMixin,
  BelongsToManyAddAssociationsMixin,
  BelongsToManyHasAssociationMixin,
  BelongsToManyCountAssociationsMixin,
  BelongsToManyCreateAssociationMixin,
  BelongsToManyHasAssociationsMixin,
  BelongsToManyRemoveAssociationMixin,
  BelongsToManyRemoveAssociationsMixin,
  BelongsToManySetAssociationsMixin,
  Sequelize
} from 'sequelize';

import UserProfile from './UserProfile';
import ModelBase from './ModelBase';
import Permission from './Permission';
import RoleGrant from './RoleGrant';
import { Models } from '../typings/Models';
import { RoleResponseModel } from '../../typings/ResponseFormats';

export default class Role extends ModelBase {
  public id!: number;
  public name!: string;
  public description?: string;
  public isEdited?: boolean;
  public readonly userProfiles?: UserProfile[];
  public readonly permission?: Permission[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public roleGrants?: any[];

  // timestamp
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Auto generated methods from associations
  public getUserProfiles!: BelongsToManyGetAssociationsMixin<UserProfile>;
  public addUserProfile!: BelongsToManyAddAssociationMixin<UserProfile, number>;
  public addUserProfiles!: BelongsToManyAddAssociationsMixin<UserProfile, number>;
  public hasUserProfile!: BelongsToManyHasAssociationMixin<UserProfile, number>;
  public hasUserProfiles!: BelongsToManyHasAssociationsMixin<UserProfile, number>;
  public countUserProfile!: BelongsToManyCountAssociationsMixin;
  public createUserProfile!: BelongsToManyCreateAssociationMixin<UserProfile>;
  public removeUserProfile!: BelongsToManyRemoveAssociationMixin<UserProfile, number>;
  public removeUserProfiles!: BelongsToManyRemoveAssociationsMixin<UserProfile, number>;
  public setUserProfiles!: BelongsToManySetAssociationsMixin<UserProfile, number>;

  // Auto generated methods for Permission
  public getPermissions!: BelongsToManyGetAssociationsMixin<Permission>;
  public addPermission!: BelongsToManyAddAssociationMixin<Permission, number>;
  public addPermissions!: BelongsToManyAddAssociationsMixin<Permission, number>;
  public hasPermission!: BelongsToManyHasAssociationMixin<Permission, number>;
  public hasPermissions!: BelongsToManyHasAssociationsMixin<Permission, number>;
  public countPermission!: BelongsToManyCountAssociationsMixin;
  public createPermission!: BelongsToManyCreateAssociationMixin<Permission>;
  public removePermission!: BelongsToManyRemoveAssociationMixin<Permission, number>;
  public removePermissions!: BelongsToManyRemoveAssociationsMixin<Permission, number>;
  public setPermissions!: BelongsToManySetAssociationsMixin<Permission, number>;

  // Auto generated methods for Permission
  public getRoleGrants!: BelongsToManyGetAssociationsMixin<RoleGrant>;
  public addRoleGrant!: BelongsToManyAddAssociationMixin<RoleGrant, number>;
  public addRoleGrants!: BelongsToManyAddAssociationsMixin<RoleGrant, number>;
  public hasRoleGrant!: BelongsToManyHasAssociationMixin<RoleGrant, number>;
  public hasRoleGrants!: BelongsToManyHasAssociationsMixin<RoleGrant, number>;
  public countRoleGrant!: BelongsToManyCountAssociationsMixin;
  public createRoleGrant!: BelongsToManyCreateAssociationMixin<RoleGrant>;
  public removeRoleGrant!: BelongsToManyRemoveAssociationMixin<RoleGrant, number>;
  public removeRoleGrants!: BelongsToManyRemoveAssociationsMixin<RoleGrant, number>;
  public setRoleGrants!: BelongsToManySetAssociationsMixin<RoleGrant, number>;

  public static associations: {
    userProfiles: Association<Role, UserProfile>;
    permissions: Association<Role, Permission>;
    roleGrants: Association<Role, RoleGrant>;
  };

  public static associate(models: Models): void {
    Role.belongsToMany(models.UserProfile, { through: 'UserProfileRole', foreignKey: 'roleId' });
    Role.belongsToMany(models.Permission, { through: 'RolePermission', timestamps: false, foreignKey: 'roleId' });
    Role.belongsToMany(models.RoleGrant, { through: 'RoleGrantPermission', timestamps: false, foreignKey: 'roleId' });
  }

  // eslint-disable-next-line
  public static initModel(sequelize: Sequelize): any {
    this.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true
        },
        isEdited: {
          type: DataTypes.BOOLEAN,
          allowNull: true
        }
      },
      {
        sequelize,
        tableName: 'Role',
        freezeTableName: true,
        comment: 'User role, which contains a group of permission'
        // DON'T REMOVE COMMAND IF YOU DON'T WANT TO RESYNC/INIT DATABASE
        // schema: 'wellac'
      }
    );

    return this;
  }

  public toResponseFormat(): RoleResponseModel {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      isEdited: this.isEdited
    };
  }
}
