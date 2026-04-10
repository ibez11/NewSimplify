import { DataTypes, Sequelize, Association } from 'sequelize';

import ModelBase from './ModelBase';
import { Models } from '../typings/Models';
import UserProfile from './UserProfile';
import { UserSkillResponseModel } from '../../typings/ResponseFormats';

export default class UserSkill extends ModelBase {
  public id!: number;
  public skill: string;
  public userProfileId?: number;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static associations: {
    job: Association<UserSkill, UserProfile>;
  };

  public static associate(models: Models): void {
    UserSkill.belongsTo(models.UserProfile, { foreignKey: 'userProfileId', targetKey: 'id' });
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
        skill: {
          type: DataTypes.TEXT,
          allowNull: true
        }
      },
      {
        sequelize,
        tableName: 'UserSkill',
        freezeTableName: true,
        comment: 'A user skills represent skills of user'
        // DON'T REMOVE COMMAND IF YOU DON'T WANT TO RESYNC/INIT DATABASE
        // schema: 'wellac'
      }
    );

    return this;
  }

  public toResponseFormat(): UserSkillResponseModel {
    const { id, skill } = this;

    return {
      id,
      skill
    };
  }
}
