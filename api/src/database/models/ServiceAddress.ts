import ModelBase from './ModelBase';
import Client from './Client';
import { Models } from '../typings/Models';
import { DataTypes, Sequelize, Association } from 'sequelize';
import { ServiceAddressResponseModel } from '../../typings/ResponseFormats';

export default class ServiceAddress extends ModelBase {
  public id!: number;
  public country!: string;
  public address!: string;
  public floorNo: string;
  public unitNo: string;
  public postalCode!: string;
  public clientId?: number;

  public static associations: {
    serviceAddress: Association<ServiceAddress, Client>;
  };

  public static associate(models: Models): void {
    ServiceAddress.belongsTo(models.Client, { foreignKey: 'clientId', targetKey: 'id', onDelete: 'CASCADE' });
  }

  // eslint-disable-next-line
  public static initModel(sequelize: Sequelize): any {
    this.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
        country: {
          type: DataTypes.STRING,
          allowNull: false
        },
        address: {
          type: DataTypes.STRING,
          allowNull: false
        },
        floorNo: {
          type: DataTypes.STRING,
          allowNull: true
        },
        unitNo: {
          type: DataTypes.STRING,
          allowNull: true
        },
        postalCode: {
          type: DataTypes.STRING,
          allowNull: false
        }
      },
      {
        sequelize,
        tableName: 'ServiceAddress',
        freezeTableName: true,
        comment: 'Client service address',
        timestamps: false
        // DON'T REMOVE COMMAND IF YOU DON'T WANT TO RESYNC/INIT DATABASE
        // schema: 'wellac'
      }
    );

    return this;
  }

  public toResponseFormat(): ServiceAddressResponseModel {
    const { id, country, address, floorNo, unitNo, postalCode } = this;

    return {
      id,
      country,
      address,
      floorNo,
      unitNo,
      postalCode
    };
  }
}
