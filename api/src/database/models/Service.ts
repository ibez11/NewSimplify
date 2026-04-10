import {
  Association,
  BelongsToCreateAssociationMixin,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  DataTypes,
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
  Sequelize
} from 'sequelize';

import ModelBase from './ModelBase';
import Client from './Client';
import { Models } from '../typings/Models';
import ServiceAddress from './ServiceAddress';
import ServiceItem from './ServiceItem';
import Entity from './Entity';
import Job from './Job';
import ServiceSkill from './ServiceSkill';
import Schedule from './Schedule';
import Invoice from './Invoice';
import { ContactPersonResponseModel, ServiceItemResponseModel } from '../../typings/ResponseFormats';
import CustomField from './CustomField';

export enum ServiceTypes {
  ADHOC = 'ADHOC',
  CONTRACT = 'CONTRACT',
  ADDITIONAL = 'ADDITIONAL'
}

export enum DiscountTypes {
  FIXED = 'FIXED',
  PERCENT = 'PERCENT',
  NA = 'NA'
}

export enum ServiceStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  ACTIVE = 'Active',
  EXPIRING = 'Expiring',
  EXPIRED = 'Expired',
  COMPLETED = 'Completed'
}

export enum repeatEndType {
  AFTER = 'AFTER',
  ONADATE = 'ONADATE'
}

export default class Service extends ModelBase {
  public id!: number;
  public serviceType!: ServiceTypes;
  public serviceNumber!: string;
  public serviceTitle!: string;
  public description!: string;
  public serviceStatus!: ServiceStatus;
  public needGST!: boolean;
  public termStart!: Date;
  public termEnd!: Date;
  public originalAmount!: number;
  public discountType!: DiscountTypes;
  public discountAmount!: number;
  public gstTax!: number;
  public gstAmount!: number;
  public totalAmount!: number;
  public totalJob!: number;
  public remarks?: string;
  public termCondition?: string;
  public isJobCompleted!: boolean;
  public isRenewed?: boolean;
  public renewedServiceId?: number;
  public salesPerson?: string;
  public Schedules?: Schedule[];
  public ServiceItem?: ServiceItem[];
  public serviceItemsJobs?: ServiceItemResponseModel[];
  public readonly clientId?: number;
  public readonly serviceAddressId?: number;
  public readonly entityId?: number;
  public readonly Client?: Client;
  public readonly ServiceAddress?: ServiceAddress;
  public readonly Entity?: Entity;
  public Jobs?: Job[];
  public ServiceSkills?: ServiceSkill[];
  public CustomFields?: CustomField[];
  public readonly Invoice?: Invoice[];
  public ContactPersons?: ContactPersonResponseModel[];
  public contractSign?: string;

  // timestamp
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public issueDate?: Date;
  public expiryDate?: Date;

  // Auto generated methods from associations
  public createClient: BelongsToCreateAssociationMixin<Client>;
  public getClient: BelongsToGetAssociationMixin<Client>;
  public setClient: BelongsToSetAssociationMixin<Client, number>;

  public createServiceAddress: BelongsToCreateAssociationMixin<ServiceAddress>;
  public getServiceAddress: BelongsToGetAssociationMixin<ServiceAddress>;
  public setServiceAddress: BelongsToSetAssociationMixin<ServiceAddress, number>;

  public getServiceItems!: HasManyGetAssociationsMixin<ServiceItem>;
  public addServiceItem!: HasManyAddAssociationMixin<ServiceItem, number>;
  public addServiceItems!: HasManyAddAssociationsMixin<ServiceItem, number>;
  public countServiceItem!: HasManyCountAssociationsMixin;
  public createServiceItem!: HasManyCreateAssociationMixin<ServiceItem>;
  public hasServiceItem!: HasManyHasAssociationMixin<ServiceItem, number>;
  public hasServiceItems!: HasManyHasAssociationsMixin<ServiceItem, number>;
  public removeServiceItem!: HasManyRemoveAssociationMixin<ServiceItem, number>;
  public removeServiceItems!: HasManyRemoveAssociationsMixin<ServiceItem, number>;
  public setServiceItems!: HasManySetAssociationsMixin<ServiceItem, number>;

  public createEntity: BelongsToCreateAssociationMixin<Entity>;
  public getEntity: BelongsToGetAssociationMixin<Entity>;
  public setEntity: BelongsToSetAssociationMixin<Entity, number>;

  public static associations: {
    client: Association<Service, Client>;
    serviceAddress: Association<Service, ServiceAddress>;
    serviceItems: Association<Service, ServiceItem>;
    entity: Association<Service, Entity>;
    job: Association<Service, Job>;
    serviceSkill: Association<Service, ServiceSkill>;
    schedule: Association<Service, Schedule>;
    invoice: Association<Service, Invoice>;
    customField: Association<Service, CustomField>;
  };

  public static associate(models: Models): void {
    Service.belongsTo(models.Client, { foreignKey: 'clientId', targetKey: 'id', onDelete: 'CASCADE' });
    Service.belongsTo(models.ServiceAddress, { foreignKey: 'serviceAddressId', targetKey: 'id' });
    Service.hasMany(models.ServiceItem, { as: 'ServiceItem', foreignKey: 'serviceId', onDelete: 'CASCADE' });
    Service.hasMany(models.Job, { foreignKey: 'serviceId', onDelete: 'CASCADE' });
    Service.hasMany(models.ServiceSkill, { foreignKey: 'serviceId', onDelete: 'CASCADE' });
    Service.hasMany(models.Schedule, { foreignKey: 'serviceId', onDelete: 'CASCADE' });
    Service.belongsTo(models.Entity, { foreignKey: 'entityId', targetKey: 'id' });
    Service.hasMany(models.Invoice, { as: 'Invoice', foreignKey: 'serviceId', onDelete: 'CASCADE' });
    Service.hasMany(models.CustomField, { foreignKey: 'serviceId', onDelete: 'CASCADE' });
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
        serviceType: {
          type: DataTypes.STRING,
          allowNull: false
        },
        serviceNumber: {
          type: DataTypes.STRING,
          allowNull: false
        },
        serviceTitle: {
          type: DataTypes.STRING,
          allowNull: false
        },
        description: {
          type: DataTypes.STRING,
          allowNull: true
        },
        serviceStatus: {
          type: DataTypes.STRING,
          allowNull: false
        },
        needGST: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true
        },
        termStart: {
          type: DataTypes.DATEONLY,
          allowNull: false
        },
        termEnd: {
          type: DataTypes.DATEONLY,
          allowNull: false
        },
        originalAmount: {
          type: DataTypes.FLOAT,
          allowNull: false,
          defaultValue: 0
        },
        discountType: {
          type: DataTypes.STRING,
          allowNull: true,
          defaultValue: 'NA'
        },
        discountAmount: {
          type: DataTypes.FLOAT,
          allowNull: true,
          defaultValue: 0
        },
        gstAmount: {
          type: DataTypes.FLOAT,
          allowNull: false,
          defaultValue: 0
        },
        totalAmount: {
          type: DataTypes.FLOAT,
          allowNull: false,
          defaultValue: 0
        },
        totalJob: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0
        },
        isJobCompleted: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false
        },
        remarks: {
          type: DataTypes.STRING,
          allowNull: true
        },
        termCondition: {
          type: DataTypes.STRING,
          allowNull: true
        },
        isRenewed: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false
        },
        renewedServiceId: {
          type: DataTypes.INTEGER,
          allowNull: true
        },
        gstTax: {
          type: DataTypes.INTEGER,
          allowNull: false
        },
        salesPerson: {
          type: DataTypes.STRING,
          allowNull: true
        },
        issueDate: {
          type: DataTypes.DATE,
          allowNull: true
        },
        expiryDate: {
          type: DataTypes.DATE,
          allowNull: true
        },
        contactPerson: {
          type: DataTypes.ARRAY(DataTypes.STRING),
          allowNull: true
        },
        contractSign: {
          type: DataTypes.STRING,
          allowNull: true
        }
      },
      {
        sequelize,
        tableName: 'Service',
        freezeTableName: true,
        comment: 'A group of service item. Can be taken as contract'
        // DON'T REMOVE COMMAND IF YOU DON'T WANT TO RESYNC/INIT DATABASE
        // schema: 'wellac'
      }
    );

    return this;
  }
}
