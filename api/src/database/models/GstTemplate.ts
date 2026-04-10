import ModelBase from './ModelBase';
import { DataTypes, Sequelize } from 'sequelize';
import { GstTemplateResponseModel } from '../../typings/ResponseFormats';

export default class GstTemplate extends ModelBase {
  public id!: number;
  public name!: string;
  public description?: string;
  public tax!: number;
  public isDefault: boolean;
  public isActive: boolean;

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
        tax: {
          type: DataTypes.INTEGER,
          allowNull: false
        },
        isDefault: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true
        },
        isActive: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false
        }
      },
      {
        sequelize,
        tableName: 'GstTemplate',
        freezeTableName: true,
        comment: 'Gst template for quick selection. Can be taken catelog.'
        // DON'T REMOVE COMMAND IF YOU DON'T WANT TO RESYNC/INIT DATABASE
        // schema: 'wellac'
      }
    );

    return this;
  }

  public toResponseFormat(): GstTemplateResponseModel {
    const { id, name, description, tax, isDefault, isActive } = this;

    return {
      id,
      name,
      description,
      tax,
      isDefault,
      isActive
    };
  }
}
