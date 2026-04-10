import ModelBase from './ModelBase';
import { DataTypes, Sequelize } from 'sequelize';
import { SettingResponseModel } from '../../typings/ResponseFormats';

export enum SettingCode {
  NOTIFCOMPLETEJOBEMAIL = 'NOTIFCOMPLETEJOBEMAIL',
  COMPANY_SETTING = 'COMPANY_SETTING',
  DUPLICATECLIENT = 'DUPLICATECLIENT',
  EMAILNOTIFICATION = 'EMAILNOTIFICATION',
  WHATSAPPNOTIFICATION = 'WHATSAPPNOTIFICATION'
}

export default class Setting extends ModelBase {
  public id!: number;
  public label!: string;
  public code?: string;
  public value?: string;
  public isActive!: boolean;
  public image?: string;

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
        label: {
          type: DataTypes.STRING,
          allowNull: false
        },
        code: {
          type: DataTypes.STRING,
          allowNull: true
        },
        value: {
          type: DataTypes.STRING,
          allowNull: true
        },
        isActive: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true
        }
      },
      {
        sequelize,
        tableName: 'Setting',
        freezeTableName: true,
        comment: 'Setting for manage additional feature.'
        // DON'T REMOVE COMMAND IF YOU DON'T WANT TO RESYNC/INIT DATABASE
        // schema: 'wellac'
      }
    );

    return this;
  }

  public toResponseFormat(): SettingResponseModel {
    const { id, label, code, value, isActive } = this;

    return {
      id,
      label,
      code,
      value,
      isActive
    };
  }
}
