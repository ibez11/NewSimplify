import {
  Association,
  BelongsToManyGetAssociationsMixin,
  BelongsToManyAddAssociationMixin,
  BelongsToManyAddAssociationsMixin,
  BelongsToManyHasAssociationMixin,
  BelongsToManyCountAssociationsMixin,
  BelongsToManyCreateAssociationMixin,
  DataTypes,
  BelongsToManyHasAssociationsMixin,
  BelongsToManyRemoveAssociationMixin,
  BelongsToManyRemoveAssociationsMixin,
  BelongsToManySetAssociationsMixin,
  Sequelize
} from 'sequelize';

import ModelBase from './ModelBase';
import Role from './Role';
import { Models } from '../typings/Models';

export default class RoleGrant extends ModelBase {
  public id!: number;
  public module!: string;
  public function!: string;
  public label!: string;
  public description!: string;
  public isMain: boolean;
  public readonly roles?: Role[];

  // Auto generated methods from associations
  public getRoles!: BelongsToManyGetAssociationsMixin<Role>;
  public addRole!: BelongsToManyAddAssociationMixin<Role, number>;
  public addRoles!: BelongsToManyAddAssociationsMixin<Role, number>;
  public hasRole!: BelongsToManyHasAssociationMixin<Role, number>;
  public hasRoles!: BelongsToManyHasAssociationsMixin<Role, number>;
  public countRole!: BelongsToManyCountAssociationsMixin;
  public createRole!: BelongsToManyCreateAssociationMixin<Role>;
  public removeRole!: BelongsToManyRemoveAssociationMixin<Role, number>;
  public removeRoles!: BelongsToManyRemoveAssociationsMixin<Role, number>;
  public setRoles!: BelongsToManySetAssociationsMixin<Role, number>;

  public static associations: {
    roles: Association<RoleGrant, Role>;
  };

  public static associate(models: Models): void {
    RoleGrant.belongsToMany(models.Role, { through: 'RoleGrantPermission', timestamps: false, foreignKey: 'roleGrantId' });
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
        module: {
          type: DataTypes.STRING,
          allowNull: false
        },
        function: {
          type: DataTypes.STRING,
          allowNull: false
        },
        label: {
          type: DataTypes.STRING,
          allowNull: false
        },
        description: {
          type: DataTypes.STRING,
          allowNull: false
        }
      },
      {
        sequelize,
        tableName: 'RoleGrant',
        freezeTableName: true,
        timestamps: false,
        comment: 'Permission Grant for each role'
        // DON'T REMOVE COMMAND IF YOU DON'T WANT TO RESYNC/INIT DATABASE
        // schema: 'wellac'
      }
    );

    return this;
  }
}
