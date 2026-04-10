import {
  Association,
  BelongsToCreateAssociationMixin,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  DataTypes,
  Sequelize
} from 'sequelize';

import ModelBase from './ModelBase';
import Service, { repeatEndType } from './Service';
import ServiceItem from './ServiceItem';
import { Models } from '../typings/Models';

export enum RepeatType {
  ADDITIONAL = 'Additional',
  ADHOC = 'ADHOC',
  DAILY = 'Daily',
  WEEKLY = 'Weekly',
  MONTHLY = 'Monthly',
  YEARLY = 'Yearly'
}

export default class Schedule extends ModelBase {
  public id!: number;
  public startDateTime?: Date;
  public endDateTime?: Date;
  public repeatType: string;
  public repeatEvery: number;
  public repeatOnDate: number;
  public repeatOnDay: string;
  public repeatOnWeek: number;
  public repeatOnMonth: number;
  public repeatEndType: repeatEndType;
  public repeatEndAfter: number;
  public repeatEndOnDate: Date;
  public serviceId?: number;
  public ServiceItems?: ServiceItem[];
  public readonly service?: Service;

  // timestamp
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Auto generated methods from associations
  public createService: BelongsToCreateAssociationMixin<Service>;
  public getService: BelongsToGetAssociationMixin<Service>;
  public setService: BelongsToSetAssociationMixin<Service, number>;

  public static associations: {
    service: Association<Schedule, Service>;
    serviceItems: Association<Schedule, ServiceItem>;
  };

  public static associate(models: Models): void {
    Schedule.belongsTo(models.Service, { foreignKey: 'serviceId', onDelete: 'CASCADE' });
    Schedule.hasMany(models.ServiceItem, { foreignKey: 'scheduleId', onDelete: 'CASCADE' });
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
          type: DataTypes.DATE,
          allowNull: true
        },
        endDateTime: {
          type: DataTypes.DATE,
          allowNull: true
        },
        repeatType: {
          type: DataTypes.STRING,
          allowNull: true
        },
        repeatEvery: {
          type: DataTypes.NUMBER,
          allowNull: true
        },
        repeatOnDate: {
          type: DataTypes.NUMBER,
          allowNull: true
        },
        repeatOnDay: {
          type: DataTypes.STRING,
          allowNull: true
        },
        repeatOnWeek: {
          type: DataTypes.INTEGER,
          allowNull: true
        },
        repeatOnMonth: {
          type: DataTypes.INTEGER,
          allowNull: true
        },
        repeatEndType: {
          type: DataTypes.STRING,
          allowNull: true
        },
        repeatEndAfter: {
          type: DataTypes.NUMBER,
          allowNull: true
        },
        repeatEndOnDate: {
          type: DataTypes.DATE,
          allowNull: true
        }
      },
      {
        sequelize,
        tableName: 'Schedule',
        freezeTableName: true,
        comment: 'Schedules for a service'
        // DON'T REMOVE COMMAND IF YOU DON'T WANT TO RESYNC/INIT DATABASE
        // schema: 'wellac'
      }
    );

    return this;
  }
}
