import ModelBase from './ModelBase';
import { DataTypes, Sequelize } from 'sequelize';
import { TableColumnSettingResponseModel } from '../../typings/ResponseFormats';

export default class TableColumnSetting extends ModelBase {
  public id!: number;
  public tableName!: string;
  public column: JSON;

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
        tableName: {
          type: DataTypes.STRING,
          allowNull: false
        },
        column: {
          type: DataTypes.JSON,
          allowNull: false
        }
      },
      {
        sequelize,
        tableName: 'TableColumnSetting',
        freezeTableName: true,
        comment: 'Setting for manage table column.'
        // DON'T REMOVE COMMAND IF YOU DON'T WANT TO RESYNC/INIT DATABASE
        // schema: 'wellac'
      }
    );

    return this;
  }

  public toResponseFormat(): TableColumnSettingResponseModel {
    const { id, tableName, column } = this;

    return {
      id,
      tableName,
      column
    };
  }
}
