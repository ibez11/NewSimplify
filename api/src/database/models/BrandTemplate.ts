import ModelBase from './ModelBase';
import { DataTypes, Sequelize } from 'sequelize';
import { BrandTemplateResponseModel } from '../../typings/ResponseFormats';

export default class BrandTemplate extends ModelBase {
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
        tableName: 'BrandTemplate',
        freezeTableName: true,
        comment: 'Brand template for quick selection.'
        // DON'T REMOVE COMMAND IF YOU DON'T WANT TO RESYNC/INIT DATABASE
        // schema: 'wellac'
      }
    );

    return this;
  }

  public toResponseFormat(): BrandTemplateResponseModel {
    const { id, name, description } = this;

    return {
      id,
      name,
      description
    };
  }
}
