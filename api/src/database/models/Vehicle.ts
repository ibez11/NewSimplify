import {
  Sequelize,
  DataTypes,
  Association,
  BelongsToCreateAssociationMixin,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  BelongsToManyGetAssociationsMixin,
  BelongsToManyAddAssociationMixin,
  BelongsToManyAddAssociationsMixin,
  BelongsToManyHasAssociationMixin,
  BelongsToManyCountAssociationsMixin,
  BelongsToManyCreateAssociationMixin,
  BelongsToManyHasAssociationsMixin,
  BelongsToManyRemoveAssociationMixin,
  BelongsToManyRemoveAssociationsMixin,
  BelongsToManySetAssociationsMixin
} from 'sequelize';

import ModelBase from './ModelBase';
import { Models } from '../typings/Models';
import UserProfile from './UserProfile';
import Job from './Job';

export default class Vehicle extends ModelBase {
  public id!: number;
  public model?: string;
  public carplateNumber: string;
  public coeExpiryDate?: Date;
  public readonly employeeInCharge?: UserProfile;
  public vehicleStatus!: boolean;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Auto generated methods from associations
  public createEmployeeInCharge: BelongsToCreateAssociationMixin<UserProfile>;
  public getEmployeeInCharge: BelongsToGetAssociationMixin<UserProfile>;
  public setEmployeeInCharge: BelongsToSetAssociationMixin<UserProfile, number>;

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
    employeeInCharge: Association<Vehicle, UserProfile>;
    jobs: Association<Vehicle, Job>;
  };

  public static associate(models: Models): void {
    Vehicle.belongsTo(models.UserProfile, { foreignKey: 'employeeInCharge', targetKey: 'id' });
    Vehicle.belongsToMany(models.Job, { through: 'VehicleJob', timestamps: false, foreignKey: 'vehicleId' });
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
        model: {
          type: DataTypes.STRING,
          allowNull: true
        },
        carplateNumber: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true
        },
        coeExpiryDate: {
          type: DataTypes.DATEONLY,
          allowNull: true
        },
        vehicleStatus: {
          type: DataTypes.BOOLEAN,
          allowNull: false
        }
      },
      {
        sequelize,
        tableName: 'Vehicle',
        freezeTableName: true,
        comment: 'Company vehicles information'
        // DON'T REMOVE COMMAND IF YOU DON'T WANT TO RESYNC/INIT DATABASE
        // schema: 'wellac'
      }
    );

    return this;
  }
}
