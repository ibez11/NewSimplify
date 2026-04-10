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

import Role from './Role';
import ModelBase from './ModelBase';
import { Models } from '../typings/Models';
import { UserProfileResponseModel } from '../../typings/ResponseFormats';
import Job from './Job';
import JobHistory from './JobHistory';
import UserSkill from './UserSkill';

export default class UserProfile extends ModelBase {
  public readonly id!: number; // This is a foreign key from User.id
  public displayName!: string;
  public email!: string;
  public countryCode!: string;
  public contactNumber!: string;
  public token!: string;
  public homeDistrict?: string;
  public homePostalCode?: string;
  public readonly roles?: Role[];
  public readonly jobs?: Job[];

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

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

  public getJobs!: BelongsToManyGetAssociationsMixin<Job>;
  public addJob!: BelongsToManyAddAssociationMixin<Job, number>;
  public addJobs!: BelongsToManyAddAssociationsMixin<Job, number>;
  public hasJob!: BelongsToManyHasAssociationMixin<Job, number>;
  public hasJobs!: BelongsToManyHasAssociationsMixin<Job, number>;
  public countJob!: BelongsToManyCountAssociationsMixin;
  public createJob!: BelongsToManyCreateAssociationMixin<Job>;
  public removeJob!: BelongsToManyRemoveAssociationMixin<Job, number>;
  public removeJobs!: BelongsToManyRemoveAssociationsMixin<Job, number>;
  public setJobs!: BelongsToManySetAssociationsMixin<Job, number>;

  public getSkills!: BelongsToManyGetAssociationsMixin<UserSkill>;
  public addSkill!: BelongsToManyAddAssociationMixin<UserSkill, number>;
  public addSkills!: BelongsToManyAddAssociationsMixin<UserSkill, number>;
  public hasSkill!: BelongsToManyHasAssociationMixin<UserSkill, number>;
  public hasSkills!: BelongsToManyHasAssociationsMixin<UserSkill, number>;
  public countSkill!: BelongsToManyCountAssociationsMixin;
  public createSkill!: BelongsToManyCreateAssociationMixin<UserSkill>;
  public removeSkill!: BelongsToManyRemoveAssociationMixin<UserSkill, number>;
  public removeSkills!: BelongsToManyRemoveAssociationsMixin<UserSkill, number>;
  public setSkills!: BelongsToManySetAssociationsMixin<UserSkill, number>;

  public static associations: {
    roles: Association<UserProfile, Role>;
    jobs: Association<UserProfile, Job>;
    jobHistory: Association<UserProfile, JobHistory>;
    skills: Association<UserSkill, Job>;
  };

  public static associate(models: Models): void {
    UserProfile.belongsToMany(models.Role, { through: 'UserProfileRole', foreignKey: 'userProfileId' });
    UserProfile.belongsToMany(models.Job, { through: 'UserProfileJob', timestamps: false, foreignKey: 'userProfileId' });
    UserProfile.belongsToMany(models.TimeOff, { through: 'TimeOffEmployee', timestamps: false, foreignKey: 'userId' });
    UserProfile.hasMany(models.UserSkill, { as: 'UserSkill', foreignKey: { name: 'userProfileId', allowNull: false }, onDelete: 'CASCADE' });
    UserProfile.hasMany(models.JobHistory, { as: 'JobHistory', foreignKey: { name: 'userProfileId', allowNull: false }, onDelete: 'CASCADE' });
  }

  // eslint-disable-next-line
  public static initModel(sequelize: Sequelize): any {
    this.init(
      {
        id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true
        },
        displayName: {
          type: DataTypes.STRING,
          allowNull: false
        },
        email: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            isEmail: true
          }
        },
        contactNumber: {
          type: DataTypes.STRING,
          allowNull: false
        },
        token: {
          type: DataTypes.STRING,
          allowNull: true
        },
        countryCode: {
          type: DataTypes.STRING,
          allowNull: false
        },
        homeDistrict: {
          type: DataTypes.STRING,
          allowNull: true
        },
        homePostalCode: {
          type: DataTypes.STRING,
          allowNull: true,
          defaultValue: '310000'
        }
      },
      {
        sequelize,
        tableName: 'UserProfile',
        freezeTableName: true,
        comment: 'UserProfile contains User metadata that are not related to log in'
        // DON'T REMOVE COMMAND IF YOU DON'T WANT TO RESYNC/INIT DATABASE
        // schema: 'wellac'
      }
    );

    return this;
  }

  public toResponseFormat(): UserProfileResponseModel {
    const { id, displayName, email, contactNumber, token, homeDistrict, homePostalCode } = this;

    return {
      id,
      displayName,
      email,
      contactNumber,
      token,
      homeDistrict,
      homePostalCode
    };
  }
}
