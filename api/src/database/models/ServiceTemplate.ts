import ModelBase from './ModelBase';
import { DataTypes, Sequelize } from 'sequelize';
import { ServiceTemplateResponseModel } from '../../typings/ResponseFormats';

export default class ServiceTemplate extends ModelBase {
  public id!: number;
  public name!: string;
  public description?: string;
  public termCondition?: string;

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
          type: DataTypes.STRING,
          allowNull: true
        },
        termCondition: {
          type: DataTypes.STRING,
          allowNull: true
        }
      },
      {
        sequelize,
        tableName: 'ServiceTemplate',
        freezeTableName: true,
        comment: 'Service template for quick selection. Can be taken catelog.'
        // DON'T REMOVE COMMAND IF YOU DON'T WANT TO RESYNC/INIT DATABASE
        // schema: 'wellac'
      }
    );

    return this;
  }

  public toResponseFormat(): ServiceTemplateResponseModel {
    const { id, name, description, termCondition } = this;

    return {
      id,
      name,
      description,
      termCondition
    };
  }
}
