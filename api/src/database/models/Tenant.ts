import { DataTypes, Sequelize } from 'sequelize';

import ModelBase from './ModelBase';
import { TenantResponseModel } from '../../typings/ResponseFormats';

export default class Tenant extends ModelBase {
  public key!: string;
  public name!: string;
  public numberOfLicense: number;
  public salesPerson!: string;
  public subscriptExpDate!: Date;
  public planType!: string;
  public whatsappService: boolean;
  public emailService: boolean;
  public syncApp: boolean;
  public isBookingEnabled?: boolean;
  public messageTemplate?: string;
  public domain?: string;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // eslint-disable-next-line
  public static initModel(sequelize: Sequelize): any {
    this.init(
      {
        key: {
          type: DataTypes.STRING,
          primaryKey: true
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false
        },
        numberOfLicense: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0
        },
        salesPerson: {
          type: DataTypes.STRING,
          allowNull: false
        },
        subscriptExpDate: {
          type: DataTypes.DATE,
          allowNull: false
        },
        planType: {
          type: DataTypes.STRING,
          allowNull: false
        },
        whatsappService: {
          type: DataTypes.BOOLEAN,
          allowNull: false
        },
        emailService: {
          type: DataTypes.BOOLEAN,
          allowNull: false
        },
        syncApp: {
          type: DataTypes.BOOLEAN,
          allowNull: false
        },
        isBookingEnabled: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false
        },
        messageTemplate: {
          type: DataTypes.STRING,
          allowNull: true
        },
        domain: {
          type: DataTypes.STRING,
          allowNull: true
        }
      },
      {
        sequelize,
        tableName: 'Tenant',
        freezeTableName: true,
        comment: 'Store tenant information'
        // DON'T REMOVE COMMAND IF YOU DON'T WANT TO RESYNC/INIT DATABASE
        // schema: 'shared'
      }
    );

    return this;
  }

  public toResponseFormat(): TenantResponseModel {
    const { key, name, numberOfLicense, salesPerson, subscriptExpDate, planType, whatsappService, emailService, syncApp } = this;

    return {
      key,
      name,
      numberOfLicense,
      salesPerson,
      subscriptExpDate,
      planType,
      whatsappService,
      emailService,
      syncApp
    };
  }
}
