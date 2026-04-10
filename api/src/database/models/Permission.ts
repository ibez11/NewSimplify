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
import { PermissionResponseModel } from '../../typings/ResponseFormats';

export enum Modules {
  ADMINISTRATION = 'ADMINISTRATION',
  USERS = 'USERS',
  ENTITIES = 'ENTITIES',
  CLIENTS = 'CLIENTS',
  CONTRACTS = 'CONTRACTS',
  SERVICES = 'SERVICES',
  SERVICES_ITEMS = 'SERVICES_ITEMS',
  SERVICES_ADDRESSES = 'SERVICES_ADDRESSES',
  SERVICE_ITEM_TEMPLATES = 'SERVICE_ITEM_TEMPLATES',
  VEHICLES = 'VEHICLES',
  JOBS = 'JOBS',
  JOB_NOTES = 'JOB_NOTES',
  REPORTS = 'REPORTS',
  INVOICES = 'INVOICES',
  SERVICE_TEMPLATES = 'SERVICE_TEMPLATES',
  SKILL_TEMPLATES = 'SKILL_TEMPLATES',
  CHECKLIST_TEMPLATES = 'CHECKLIST_TEMPLATES',
  SETTING = 'SETTING',
  AGENT = 'AGENT',
  RATINGS = 'RATINGS',
  JOB_NOTE_TEMPLATES = 'JOB_NOTE_TEMPLATES',
  EQUIPMENTS = 'EQUIPMENTS',
  JOB_LABEL_TEMPLATES = 'JOB_LABEL_TEMPLATES',
  NOTIFICATIONS = 'NOTIFICATIONS',
  BRANDS = 'BRAND_TEMPLATES',
  CLIENT_DOCUMENTS = 'CLIENT_DOCUMENTS',
  JOB_EXPENSES = 'JOB_EXPENSES',
  TABLECOLUMNSETTING = 'TABLE_COLUMN_SETTING',
  TIMEOFF = 'TIME_OFF',
  DISTRICT = 'DISTRICT',
  PDFTEMPLATEOPTIONS = 'PDF_TEMPLATE_OPTIONS'
}

export enum AccessLevels {
  ACCESS = 'ACCESS',
  VIEW = 'VIEW',
  CREATE = 'CREATE',
  EDIT = 'EDIT',
  DELETE = 'DELETE'
}

export default class Permission extends ModelBase {
  public id!: number;
  public module!: Modules;
  public accessLevel!: AccessLevels;
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
    roles: Association<Permission, Role>;
  };

  public static associate(models: Models): void {
    Permission.belongsToMany(models.Role, { through: 'RolePermission', timestamps: false, foreignKey: 'permissionId' });
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
          unique: 'UQ_MODULE_ACCESSLEVEL',
          allowNull: false
        },
        accessLevel: {
          type: DataTypes.STRING,
          unique: 'UQ_MODULE_ACCESSLEVEL',
          allowNull: false
        }
      },
      {
        sequelize,
        tableName: 'Permission',
        freezeTableName: true,
        timestamps: false,
        comment: 'List of Permission for the whole applcation'
        // DON'T REMOVE COMMAND IF YOU DON'T WANT TO RESYNC/INIT DATABASE
        // schema: 'wellac'
      }
    );

    return this;
  }

  public toResponseFormat(): PermissionResponseModel {
    const { module, accessLevel } = this;

    return {
      module,
      accessLevel
    };
  }
}
