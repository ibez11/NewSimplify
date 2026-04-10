import ModelBase from './ModelBase';
import { Models } from '../typings/Models';
import { DataTypes, Sequelize, Association } from 'sequelize';
import { ContactPersonResponseModel } from '../../typings/ResponseFormats';

import Client from './Client';

export default class ContactPerson extends ModelBase {
  public id!: number;
  public contactPerson!: string;
  public country!: string;
  public countryCode!: string;
  public contactNumber!: string; // to cater for country code
  public contactEmail!: string;
  public description?: string;
  public isMain!: boolean;

  public static associations: {
    client: Association<ContactPerson, Client>;
  };

  public static associate(models: Models): void {
    ContactPerson.belongsTo(models.Client, { foreignKey: 'clientId', targetKey: 'id', onDelete: 'CASCADE' });
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
        contactPerson: {
          type: DataTypes.STRING,
          allowNull: false
        },
        countryCode: {
          type: DataTypes.STRING,
          allowNull: false
        },
        contactNumber: {
          type: DataTypes.STRING,
          allowNull: false
        },
        contactEmail: {
          type: DataTypes.STRING,
          allowNull: true
        },
        description: {
          type: DataTypes.STRING,
          allowNull: true
        },
        isMain: {
          type: DataTypes.BOOLEAN,
          allowNull: false
        },
        country: {
          type: DataTypes.STRING,
          allowNull: false
        }
      },
      {
        sequelize,
        tableName: 'ContactPerson',
        freezeTableName: true,
        comment: 'Client Contact Person',
        timestamps: false
        // DON'T REMOVE COMMAND IF YOU DON'T WANT TO RESYNC/INIT DATABASE
        // schema: 'wellac'
      }
    );

    return this;
  }

  public toResponseFormat(): ContactPersonResponseModel {
    const { id, contactPerson, countryCode, contactNumber, contactEmail } = this;

    return {
      id,
      contactPerson,
      countryCode,
      contactNumber,
      contactEmail
    };
  }
}
