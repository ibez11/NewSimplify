import ModelBase from './ModelBase';
import ServiceAddress from './ServiceAddress';
import ContactPerson from './ContactPerson';
import Agent from './Agent';
import ClientDocument from './ClientDocument';

import {
  BelongsToCreateAssociationMixin,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  HasManyGetAssociationsMixin,
  HasManyAddAssociationMixin,
  HasManyAddAssociationsMixin,
  HasManyCountAssociationsMixin,
  HasManyCreateAssociationMixin,
  HasManyHasAssociationMixin,
  HasManyHasAssociationsMixin,
  HasManyRemoveAssociationMixin,
  HasManyRemoveAssociationsMixin,
  HasManySetAssociationsMixin,
  Association,
  DataTypes,
  Sequelize
} from 'sequelize';
import { Models } from '../typings/Models';
import { ClientDocumentResponseModel, ClientResponseModel, ContactPersonResponseModel } from '../../typings/ResponseFormats';
import { ServiceAddressBody } from '../../typings/body/ServiceAddressBody';

export enum ClientTypes {
  COMMERCIAL = 'COMMERCIAL',
  RESIDENTIAL = 'RESIDENTIAL'
}

export default class Client extends ModelBase {
  public id!: number;
  public name!: string;
  public clientType!: ClientTypes;
  public billingAddress!: string;
  public billingFloorNo: string;
  public billingUnitNo: string;
  public billingPostal!: string;
  public remarks?: string;
  public idQboWithGST?: number;
  public idQboWithoutGST?: number;
  public activeContract?: number;
  public expiringContract?: number;
  public expiredContract?: number;
  public totalAmount?: number;
  public firstServiceAddress?: string;
  public ServiceAddresses?: ServiceAddressBody[];
  public ClientDocuments?: ClientDocumentResponseModel[];
  public emailReminder: boolean;
  public whatsAppReminder: boolean;
  public emailJobReport: boolean;
  public readonly Agent?: Agent;
  public ContactPersons?: ContactPersonResponseModel[];
  public agentName?: string;
  public priceReportVisibility?: boolean;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Auto generated methods from associations
  public getServiceAddresses!: HasManyGetAssociationsMixin<ServiceAddress>;
  public addServiceAddress!: HasManyAddAssociationMixin<ServiceAddress, number>;
  public addServiceAddresses!: HasManyAddAssociationsMixin<ServiceAddress, number>;
  public countServiceAddress!: HasManyCountAssociationsMixin;
  public createServiceAddress!: HasManyCreateAssociationMixin<ServiceAddress>;
  public hasServiceAddress!: HasManyHasAssociationMixin<ServiceAddress, number>;
  public hasServiceAddresses!: HasManyHasAssociationsMixin<ServiceAddress, number>;
  public removeServiceAddress!: HasManyRemoveAssociationMixin<ServiceAddress, number>;
  public removeServiceAddresses!: HasManyRemoveAssociationsMixin<ServiceAddress, number>;
  public setServiceAddresses!: HasManySetAssociationsMixin<ServiceAddress, number>;

  public getContactPersons!: HasManyGetAssociationsMixin<ContactPerson>;
  public addContactPerson!: HasManyAddAssociationMixin<ContactPerson, number>;
  public addContactPersones!: HasManyAddAssociationsMixin<ContactPerson, number>;
  public countContactPerson!: HasManyCountAssociationsMixin;
  public createContactPerson!: HasManyCreateAssociationMixin<ContactPerson>;
  public hasContactPerson!: HasManyHasAssociationMixin<ContactPerson, number>;
  public hasContactPersones!: HasManyHasAssociationsMixin<ContactPerson, number>;
  public removeContactPerson!: HasManyRemoveAssociationMixin<ContactPerson, number>;
  public removeContactPersones!: HasManyRemoveAssociationsMixin<ContactPerson, number>;
  public setContactPersones!: HasManySetAssociationsMixin<ContactPerson, number>;

  public getClientDocuments!: HasManyGetAssociationsMixin<ClientDocument>;
  public addClientDocument!: HasManyAddAssociationMixin<ClientDocument, number>;
  public addClientDocuments!: HasManyAddAssociationsMixin<ClientDocument, number>;
  public countClientDocument!: HasManyCountAssociationsMixin;
  public createClientDocument!: HasManyCreateAssociationMixin<ClientDocument>;
  public hasClientDocument!: HasManyHasAssociationMixin<ClientDocument, number>;
  public hasClientDocuments!: HasManyHasAssociationsMixin<ClientDocument, number>;
  public removeClientDocument!: HasManyRemoveAssociationMixin<ClientDocument, number>;
  public removeClientDocuments!: HasManyRemoveAssociationsMixin<ClientDocument, number>;
  public setClientDocuments!: HasManySetAssociationsMixin<ClientDocument, number>;

  public createAgentId: BelongsToCreateAssociationMixin<Agent>;
  public getAgentId: BelongsToGetAssociationMixin<Agent>;
  public setAgentId: BelongsToSetAssociationMixin<Agent, number>;

  public static associations: {
    serviceAddresses: Association<Client, ServiceAddress>;
    contactPersons: Association<Client, ContactPerson>;
    agentId: Association<Client, Agent>;
    clientDocuments: Association<Client, ClientDocument>;
  };

  public static associate(models: Models): void {
    Client.hasMany(models.ServiceAddress, { foreignKey: 'clientId', onDelete: 'CASCADE' });
    Client.hasMany(models.ContactPerson, { as: 'ContactPersons', foreignKey: 'clientId', onDelete: 'CASCADE' });
    Client.hasMany(models.ClientDocument, { as: 'ClientDocuments', foreignKey: 'clientId', onDelete: 'CASCADE' });
    Client.hasMany(models.Service, { as: 'Service', foreignKey: 'clientId', onDelete: 'CASCADE' });
    Client.belongsTo(models.Agent, { foreignKey: 'agentId', targetKey: 'id', onDelete: 'SET NULL' });
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
        name: {
          type: DataTypes.STRING,
          allowNull: false
        },
        clientType: {
          type: DataTypes.STRING,
          allowNull: false
        },
        billingAddress: {
          type: DataTypes.STRING,
          allowNull: false
        },
        billingFloorNo: {
          type: DataTypes.STRING,
          allowNull: true
        },
        billingUnitNo: {
          type: DataTypes.STRING,
          allowNull: true
        },
        billingPostal: {
          type: DataTypes.STRING,
          allowNull: false
        },
        remarks: {
          type: DataTypes.STRING,
          allowNull: true
        },
        idQboWithGST: {
          type: DataTypes.INTEGER,
          allowNull: true
        },
        idQboWithoutGST: {
          type: DataTypes.INTEGER,
          allowNull: true
        },
        emailReminder: {
          type: DataTypes.BOOLEAN,
          allowNull: true
        },
        whatsAppReminder: {
          type: DataTypes.BOOLEAN,
          allowNull: true
        },
        emailJobReport: {
          type: DataTypes.BOOLEAN,
          allowNull: true
        },
        priceReportVisibility: {
          type: DataTypes.BOOLEAN,
          allowNull: true
        }
      },
      {
        sequelize,
        tableName: 'Client',
        freezeTableName: true,
        comment: 'Clients information'
        // DON'T REMOVE COMMAND IF YOU DON'T WANT TO RESYNC/INIT DATABASE
        // schema: 'wellac'
      }
    );

    return this;
  }

  public toResponseFormat(): ClientResponseModel {
    const { id, name, clientType, billingAddress } = this;

    return {
      id,
      name,
      clientType,
      billingAddress
    };
  }
}
