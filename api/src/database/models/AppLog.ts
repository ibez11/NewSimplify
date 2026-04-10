import ModelBase from './ModelBase';
import { DataTypes, Sequelize } from 'sequelize';
import { AppLogResponseModel } from '../../typings/ResponseFormats';

export default class AppLog extends ModelBase {
  public id!: number;
  public user!: string;
  public description!: string;

  // timestamp
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // eslint-disable-next-line
  public static initModel(sequelize: Sequelize): any {
    this.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
        user: {
          type: DataTypes.STRING,
          allowNull: false
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: false
        }
      },
      {
        sequelize,
        tableName: 'AppLog',
        freezeTableName: true,
        comment: 'AppLog stores all AppLog information'
        // DON'T REMOVE THIS COMMENT IF YOU DON'T WANT TO RESYNC/INIT DATABASE
        // schema: 'wellac'
      }
    );

    return this;
  }

  public toResponseFormat(): AppLogResponseModel {
    const { id, user, description } = this;

    return {
      id,
      user,
      description
    };
  }
}
