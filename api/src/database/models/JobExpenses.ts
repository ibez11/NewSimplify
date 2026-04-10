import ModelBase from './ModelBase';
import { Models } from '../typings/Models';
import {
  Association,
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
  DataTypes,
  Sequelize
} from 'sequelize';

import { JobExpensesResponseModel } from '../../typings/ResponseFormats';
import JobExpensesItem from './JobExpensesItem';
import Job from './Job';

export default class JobExpenses extends ModelBase {
  public id!: number;
  public header!: string;
  public remarks?: string;
  public jobId?: number;
  public serviceId?: number;
  public totalExpenses: number;
  public JobExpensesItems?: JobExpensesItem[];

  // timestamp
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public getExpensesItems!: HasManyGetAssociationsMixin<JobExpensesItem>;
  public addExpensesItem!: HasManyAddAssociationMixin<JobExpensesItem, number>;
  public addExpensesItems!: HasManyAddAssociationsMixin<JobExpensesItem, number>;
  public countExpensesItem!: HasManyCountAssociationsMixin;
  public createExpensesItem!: HasManyCreateAssociationMixin<JobExpensesItem>;
  public hasExpensesItem!: HasManyHasAssociationMixin<JobExpensesItem, number>;
  public hasExpensesItems!: HasManyHasAssociationsMixin<JobExpensesItem, number>;
  public removeExpensesItem!: HasManyRemoveAssociationMixin<JobExpensesItem, number>;
  public removeExpensesItems!: HasManyRemoveAssociationsMixin<JobExpensesItem, number>;
  public setExpensesItems!: HasManySetAssociationsMixin<JobExpensesItem, number>;

  public static associations: {
    job: Association<JobExpenses, Job>;
    ExpensesItems: Association<JobExpenses, JobExpensesItem>;
  };

  public static associate(models: Models): void {
    JobExpenses.belongsTo(models.Job, { foreignKey: 'jobId', targetKey: 'id' });
    JobExpenses.belongsTo(models.Service, { foreignKey: 'serviceId', targetKey: 'id' });
    JobExpenses.hasMany(models.JobExpensesItem, {
      as: 'JobExpensesItems',
      foreignKey: { name: 'jobExpensesId', allowNull: false },
      onDelete: 'CASCADE'
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
        header: {
          type: DataTypes.STRING,
          allowNull: false
        },
        remarks: {
          type: DataTypes.TEXT,
          allowNull: true
        },
        totalExpenses: {
          type: DataTypes.NUMBER,
          allowNull: true
        }
      },
      {
        sequelize,
        tableName: 'JobExpenses',
        freezeTableName: true,
        comment: 'Expenses for each Job.'
        // DON'T REMOVE COMMAND IF YOU DON'T WANT TO RESYNC/INIT DATABASE
        // schema: 'wellac'
      }
    );

    return this;
  }

  public toResponseFormat(): JobExpensesResponseModel {
    const { id, header, remarks, jobId, serviceId, totalExpenses } = this;

    return {
      id,
      header,
      remarks,
      jobId,
      serviceId,
      totalExpenses
    };
  }
}
