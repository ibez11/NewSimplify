import ModelBase from './ModelBase';
import { DataTypes, Sequelize } from 'sequelize';
import { AgentResponseModel } from '../../typings/ResponseFormats';

export default class Agent extends ModelBase {
  public id!: number;
  public name!: string;
  public description: string;

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
        name: {
          type: DataTypes.STRING,
          allowNull: false
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true
        }
      },
      {
        sequelize,
        tableName: 'Agent',
        freezeTableName: true,
        comment: 'Agent stores all Agent information'
        // DON'T REMOVE THIS COMMENT IF YOU DON'T WANT TO RESYNC/INIT DATABASE
        // schema: 'wellac'
      }
    );

    return this;
  }

  public toResponseFormat(): AgentResponseModel {
    const { id, name, description } = this;

    return {
      id,
      name,
      description
    };
  }
}
