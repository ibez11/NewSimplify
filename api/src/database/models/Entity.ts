import ModelBase from './ModelBase';
import { DataTypes, Sequelize } from 'sequelize';
import { EntityResponseModel } from '../../typings/ResponseFormats';

export default class Entity extends ModelBase {
  public id!: number;
  public name!: string;
  public address!: string;
  public logo!: string;
  public countryCode!: string;
  public contactNumber!: string;
  public email!: string;
  public needGST!: boolean;
  public qrImage!: string;
  public registerNumberGST: string;
  public imageBucket?: string;
  public invoiceFooter?: string;
  public uenNumber?: string;
  public gstTax?: number;

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
        address: {
          type: DataTypes.STRING,
          allowNull: false
        },
        logo: {
          type: DataTypes.STRING,
          allowNull: true
        },
        countryCode: {
          type: DataTypes.STRING,
          allowNull: false
        },
        contactNumber: {
          type: DataTypes.STRING,
          allowNull: false
        },
        email: {
          type: DataTypes.STRING,
          allowNull: false
        },
        needGST: {
          type: DataTypes.BOOLEAN,
          allowNull: false
        },
        qrImage: {
          type: DataTypes.STRING,
          allowNull: true
        },
        registerNumberGST: {
          type: DataTypes.STRING,
          allowNull: true
        },
        invoiceFooter: {
          type: DataTypes.STRING,
          allowNull: true
        },
        uenNumber: {
          type: DataTypes.STRING,
          allowNull: true
        }
      },
      {
        sequelize,
        tableName: 'Entity',
        freezeTableName: true,
        comment: 'Entity for quick selection. Can be taken catalog.'
        // DON'T REMOVE COMMAND IF YOU DON'T WANT TO RESYNC/INIT DATABASE
        // schema: 'wellac'
      }
    );

    return this;
  }

  public toResponseFormat(): EntityResponseModel {
    const { id, name, address, logo, countryCode, contactNumber, email, needGST, qrImage, registerNumberGST, invoiceFooter, uenNumber } = this;

    return {
      id,
      name,
      address,
      logo,
      countryCode,
      contactNumber,
      email,
      needGST,
      qrImage,
      registerNumberGST,
      invoiceFooter,
      uenNumber
    };
  }
}
