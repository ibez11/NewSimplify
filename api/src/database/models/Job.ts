import {
  DataTypes,
  Association,
  BelongsToCreateAssociationMixin,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  BelongsToManyGetAssociationsMixin,
  BelongsToManyAddAssociationMixin,
  BelongsToManyAddAssociationsMixin,
  BelongsToManyHasAssociationMixin,
  BelongsToManyHasAssociationsMixin,
  BelongsToManyCountAssociationsMixin,
  BelongsToManyCreateAssociationMixin,
  BelongsToManyRemoveAssociationMixin,
  BelongsToManyRemoveAssociationsMixin,
  BelongsToManySetAssociationsMixin,
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
import { Models } from '../typings/Models';
import UserProfile from './UserProfile';
import ServiceItem from './ServiceItem';
import Vehicle from './Vehicle';
import Service from './Service';
import JobNote from './JobNote';
import ChecklistJob from './ChecklistJob';
import JobLabel from './JobLabel';
import { ServiceItemResponseModel } from '../../typings/ResponseFormats';

export enum JobStatus {
  UNASSIGNED = 'UNASSIGNED',
  CONFIRMED = 'CONFIRMED',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  PAUSED = 'PAUSED',
  UNABLE_TO_COMPLETE = 'UNABLE_TO_COMPLETE'
}

export enum PaymentMethod {
  CASH = 'CASH',
  PAYNOW = 'PAYNOW',
  CHEQUE = 'CHEQUE'
}

export default class Job extends ModelBase {
  public id!: number;
  public startDateTime?: Date;
  public endDateTime?: Date;
  public jobStatus!: JobStatus;
  public signature?: string;
  public remarks?: string;
  public collectedAmount?: number;
  public contractBalance?: number;
  public additionalCollectedAmount?: number;
  public additionalOutstandingAmount?: number;
  public totalAdditionalCollectedAmount?: number;
  public totalAdditionalServiceAmount?: number;
  public paymentMethod?: string;
  public paymentType?: string;
  public signatureUrl?: string;
  public isLastJob?: boolean;
  public readonly assignedBy?: UserProfile;
  public readonly assignees?: UserProfile[];
  public serviceItems?: ServiceItem[];
  public readonly serviceId!: Service;
  public readonly additionalServiceId!: Service;
  public serviceItemsJob?: ServiceItemResponseModel[];
  public readonly totalServiceItem?: number;
  public readonly jobAmount?: string;
  public readonly discount?: string;
  public readonly gst?: string;
  public readonly totalAmount?: string;
  public readonly totalOutstanding?: string;
  public readonly serviceItemName?: string;
  public readonly collectedBy?: string;
  public readonly ChecklistJob?: ChecklistJob[];
  public chequeNumber?: string;
  public isSynchronize?: boolean;
  public syncId?: number;

  // timestamp
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Auto generated methods from associations
  public createAssignedBy: BelongsToCreateAssociationMixin<UserProfile>;
  public getAssignedBy: BelongsToGetAssociationMixin<UserProfile>;
  public setAssignedBy: BelongsToSetAssociationMixin<UserProfile, number>;

  public getAssignees!: BelongsToManyGetAssociationsMixin<UserProfile>;
  public addAssignee!: BelongsToManyAddAssociationMixin<UserProfile, number>;
  public addAssignees!: BelongsToManyAddAssociationsMixin<UserProfile, number>;
  public hasAssignee!: BelongsToManyHasAssociationMixin<UserProfile, number>;
  public hasAssignees!: BelongsToManyHasAssociationsMixin<UserProfile, number>;
  public countAssignee!: BelongsToManyCountAssociationsMixin;
  public createAssignee!: BelongsToManyCreateAssociationMixin<UserProfile>;
  public removeAssignee!: BelongsToManyRemoveAssociationMixin<UserProfile, number>;
  public removeAssignees!: BelongsToManyRemoveAssociationsMixin<UserProfile, number>;
  public setAssignees!: BelongsToManySetAssociationsMixin<UserProfile, number>;

  public getVehicles!: BelongsToManyGetAssociationsMixin<Vehicle>;
  public addVehicle!: BelongsToManyAddAssociationMixin<Vehicle, number>;
  public addVehicles!: BelongsToManyAddAssociationsMixin<Vehicle, number>;
  public hasVehicle!: BelongsToManyHasAssociationMixin<Vehicle, number>;
  public hasVehicles!: BelongsToManyHasAssociationsMixin<Vehicle, number>;
  public countVehicle!: BelongsToManyCountAssociationsMixin;
  public createVehicle!: BelongsToManyCreateAssociationMixin<Vehicle>;
  public removeVehicle!: BelongsToManyRemoveAssociationMixin<Vehicle, number>;
  public removeVehicles!: BelongsToManyRemoveAssociationsMixin<Vehicle, number>;
  public setVehicles!: BelongsToManySetAssociationsMixin<Vehicle, number>;

  public getServiceItems!: BelongsToManyGetAssociationsMixin<ServiceItem>;
  public addServiceItem!: BelongsToManyAddAssociationMixin<ServiceItem, number>;
  public addServiceItems!: BelongsToManyAddAssociationsMixin<ServiceItem, number>;
  public hasServiceItem!: BelongsToManyHasAssociationMixin<ServiceItem, number>;
  public hasServiceItems!: BelongsToManyHasAssociationsMixin<ServiceItem, number>;
  public countServiceItem!: BelongsToManyCountAssociationsMixin;
  public createServiceItem!: BelongsToManyCreateAssociationMixin<ServiceItem>;
  public removeServiceItem!: BelongsToManyRemoveAssociationMixin<ServiceItem, number>;
  public removeServiceItems!: BelongsToManyRemoveAssociationsMixin<ServiceItem, number>;
  public setServiceItems!: BelongsToManySetAssociationsMixin<ServiceItem, number>;

  public createServiceId: BelongsToCreateAssociationMixin<Service>;
  public getServiceId: BelongsToGetAssociationMixin<Service>;
  public setServiceId: BelongsToSetAssociationMixin<Service, number>;

  public createAdditionalServiceId: BelongsToCreateAssociationMixin<Service>;
  public getAdditionalServiceId: BelongsToGetAssociationMixin<Service>;
  public setAdditionalServiceId: BelongsToSetAssociationMixin<Service, number>;

  public getJobNotes!: HasManyGetAssociationsMixin<JobNote>;
  public addJobNote!: HasManyAddAssociationMixin<JobNote, number>;
  public addJobNotes!: HasManyAddAssociationsMixin<JobNote, number>;
  public countJobNote!: HasManyCountAssociationsMixin;
  public createJobNote!: HasManyCreateAssociationMixin<JobNote>;
  public hasJobNote!: HasManyHasAssociationMixin<JobNote, number>;
  public hasJobNotes!: HasManyHasAssociationsMixin<JobNote, number>;
  public removeJobNote!: HasManyRemoveAssociationMixin<JobNote, number>;
  public removeJobNotes!: HasManyRemoveAssociationsMixin<JobNote, number>;
  public setJobNotes!: HasManySetAssociationsMixin<JobNote, number>;

  public static associations: {
    assignedBy: Association<Job, UserProfile>;
    assignees: Association<Job, UserProfile>;
    serviceItems: Association<Job, ServiceItem>;
    serviceId: Association<Job, Service>;
    additionalServiceId: Association<Job, Service>;
    vehicleJobs: Association<Job, Vehicle>;
    jobNotes: Association<Job, JobNote>;
    checklistJobs: Association<Job, ChecklistJob>;
    jobLabel: Association<Job, JobLabel>;
  };

  public static associate(models: Models): void {
    Job.belongsTo(models.UserProfile, { foreignKey: 'assignedBy', targetKey: 'id' });
    Job.belongsToMany(models.UserProfile, { through: 'UserProfileJob', timestamps: false, foreignKey: 'jobId' });
    Job.belongsToMany(models.ServiceItem, { through: 'ServiceItemJob', timestamps: false, foreignKey: 'jobId' });
    Job.belongsTo(models.Service, { foreignKey: 'serviceId', targetKey: 'id', onDelete: 'CASCADE' });
    Job.belongsTo(models.Service, { foreignKey: 'additionalServiceId', as: 'additional', targetKey: 'id', onDelete: 'CASCADE' });
    Job.belongsToMany(models.Vehicle, { through: 'VehicleJob', timestamps: false, foreignKey: 'jobId' });
    Job.hasMany(models.JobNote, { as: 'JobNote', foreignKey: { name: 'jobId', allowNull: false }, onDelete: 'CASCADE' });
    Job.hasMany(models.ChecklistJob, { as: 'ChecklistJob', foreignKey: { name: 'jobId', allowNull: false }, onDelete: 'CASCADE' });
    Job.hasMany(models.JobLabel, { as: 'JobLabels', foreignKey: { name: 'jobId', allowNull: false }, onDelete: 'CASCADE' });
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
        startDateTime: {
          type: DataTypes.TIME,
          allowNull: true
        },
        endDateTime: {
          type: DataTypes.TIME,
          allowNull: true
        },
        jobStatus: {
          type: DataTypes.STRING,
          allowNull: false,
          defaultValue: 'UNASSIGNED'
        },
        signature: {
          type: DataTypes.STRING,
          allowNull: true
        },
        remarks: {
          type: DataTypes.STRING,
          allowNull: true
        },
        collectedAmount: {
          type: DataTypes.FLOAT,
          allowNull: true
        },
        collectedBy: {
          type: DataTypes.STRING,
          allowNull: true
        },
        paymentMethod: {
          type: DataTypes.STRING,
          allowNull: true
        },
        paymentType: {
          type: DataTypes.STRING,
          allowNull: true
        },
        additionalCollectedAmount: {
          type: DataTypes.FLOAT,
          allowNull: true
        },
        additionalOutstandingAmount: {
          type: DataTypes.FLOAT,
          allowNull: true
        },
        chequeNumber: {
          type: DataTypes.STRING,
          allowNull: true
        },
        isSynchronize: {
          type: DataTypes.BOOLEAN,
          allowNull: true,
          defaultValue: false
        },
        syncId: {
          type: DataTypes.INTEGER,
          allowNull: true
        }
      },
      {
        sequelize,
        tableName: 'Job',
        freezeTableName: true,
        comment: 'A job represent the day when the service is being delivered'
        // DON'T REMOVE COMMAND IF YOU DON'T WANT TO RESYNC/INIT DATABASE
        // schema: 'wellac'
      }
    );

    return this;
  }
}
