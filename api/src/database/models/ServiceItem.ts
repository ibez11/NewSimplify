import {
  Association,
  BelongsToCreateAssociationMixin,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  DataTypes,
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
  Sequelize
} from 'sequelize';

import ModelBase from './ModelBase';
import Service, { DiscountTypes } from './Service';
import Schedule from './Schedule';
import { Models } from '../typings/Models';
import Job from './Job';
import { EquipmentResponseModel } from '../../typings/ResponseFormats';

export default class ServiceItem extends ModelBase {
  public id!: number;
  public name!: string;
  public description: string;
  public quantity!: number;
  public unitPrice!: number;
  public discountType!: DiscountTypes;
  public discountAmt!: number;
  public totalPrice!: number;
  public idQboWithGST?: number;
  public IdQboWithoutGST?: number;
  public serviceType?: string;
  public invoiceNumber?: string;
  public scheduleId?: number;
  public serviceId?: number;
  public scheduleIndex?: number;
  public isDeleted?: boolean;
  public new?: number;
  public Equipments?: EquipmentResponseModel[];
  public readonly service?: Service;
  public readonly schedule?: Schedule;
  public readonly jobs?: Job[];

  // timestamp
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Auto generated methods from associations
  public createService: BelongsToCreateAssociationMixin<Service>;
  public getService: BelongsToGetAssociationMixin<Service>;
  public setService: BelongsToSetAssociationMixin<Service, number>;

  public getJobs!: BelongsToManyGetAssociationsMixin<Job>;
  public addJob!: BelongsToManyAddAssociationMixin<Job, number>;
  public addJobs!: BelongsToManyAddAssociationsMixin<Job, number>;
  public hasJob!: BelongsToManyHasAssociationMixin<Job, number>;
  public hasJobs!: BelongsToManyHasAssociationsMixin<Job, number>;
  public countJob!: BelongsToManyCountAssociationsMixin;
  public createJob!: BelongsToManyCreateAssociationMixin<Job>;
  public removeJob!: BelongsToManyRemoveAssociationMixin<Job, number>;
  public removeJobs!: BelongsToManyRemoveAssociationsMixin<Job, number>;
  public setJobs!: BelongsToManySetAssociationsMixin<Job, number>;

  public static associations: {
    service: Association<ServiceItem, Service>;
    schedule: Association<ServiceItem, Schedule>;
    jobs: Association<ServiceItem, Job>;
  };

  public static associate(models: Models): void {
    ServiceItem.belongsTo(models.Service, { foreignKey: 'serviceId', onDelete: 'CASCADE' });
    ServiceItem.belongsTo(models.Schedule, { foreignKey: 'scheduleId', onDelete: 'CASCADE' });
    ServiceItem.belongsToMany(models.Job, {
      through: 'ServiceItemJob',
      timestamps: false,
      foreignKey: 'serviceItemId'
    });
    ServiceItem.belongsToMany(models.Equipment, {
      through: 'ServiceItemEquipment',
      timestamps: false,
      foreignKey: 'serviceItemId'
    });
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
        description: {
          type: DataTypes.STRING,
          allowNull: true
        },
        quantity: {
          type: DataTypes.FLOAT,
          allowNull: false,
          defaultValue: 0
        },
        unitPrice: {
          type: DataTypes.FLOAT,
          allowNull: false,
          defaultValue: 0
        },
        discountType: {
          type: DataTypes.STRING,
          allowNull: false,
          defaultValue: 'NA'
        },
        discountAmt: {
          type: DataTypes.FLOAT,
          allowNull: false,
          defaultValue: 0
        },
        totalPrice: {
          type: DataTypes.FLOAT,
          allowNull: false,
          defaultValue: 0
        },
        idQboWithGST: {
          type: DataTypes.INTEGER,
          allowNull: true
        },
        IdQboWithoutGST: {
          type: DataTypes.INTEGER,
          allowNull: true
        }
      },
      {
        sequelize,
        tableName: 'ServiceItem',
        freezeTableName: true,
        comment: 'Each line item in a service'
        // DON'T REMOVE COMMAND IF YOU DON'T WANT TO RESYNC/INIT DATABASE
        // schema: 'wellac'
      }
    );

    return this;
  }
}
