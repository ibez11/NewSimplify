import ModelBase from './ModelBase';
import { DataTypes, Sequelize } from 'sequelize';
import { JobLabelTemplateResponseModel } from '../../typings/ResponseFormats';

export default class JobLabelTemplate extends ModelBase {
  public id!: number;
  public name!: string;
  public description: string;
  public color!: string;

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
        },
        color: {
          type: DataTypes.STRING,
          allowNull: false
        }
      },
      {
        sequelize,
        tableName: 'JobLabelTemplate',
        freezeTableName: true,
        comment: 'Job label template for quick selection.'
        // DON'T REMOVE COMMAND IF YOU DON'T WANT TO RESYNC/INIT DATABASE
        // schema: 'wellac'
      }
    );

    return this;
  }

  public toResponseFormat(): JobLabelTemplateResponseModel {
    const { id, name, description, color } = this;

    return {
      id,
      name,
      description,
      color
    };
  }
}
