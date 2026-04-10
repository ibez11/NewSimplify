import ModelBase from './ModelBase';
import { DataTypes, Sequelize } from 'sequelize';
import { SettingResponseModel } from '../../typings/ResponseFormats';

export enum BookingSettingCode {
  BUSINESS_NAME = 'BUSINESS_NAME',
  LOGO = 'LOGO',
  INSTRUCTIONS = 'INSTRUCTIONS',
  TIME_SLOTS = 'TIME_SLOTS',
  TIME_SLOTS_HOLIDAY = 'TIME_SLOTS_HOLIDAY',
  LIMIT_TIME_SLOT = 'LIMIT_TIME_SLOT',
  WORKING_DAYS = 'WORKING_DAYS',
  INCLUDE_PUBLIC_HOLIDAY = 'INCLUDE_PUBLIC_HOLIDAY'
}

export default class BookingSetting extends ModelBase {
  public id!: number;
  public label!: string;
  public code?: string;
  public value?: string;
  public isActive!: boolean;
  public logoUrl?: string;

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
        tableName: 'BookingSetting',
        freezeTableName: true,
        comment: 'Setting for manage customer Booking Website.'
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
