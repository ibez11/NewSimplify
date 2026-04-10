import { DataTypes, Sequelize, Association } from 'sequelize';

import ModelBase from './ModelBase';
import { Models } from '../typings/Models';
import JobExpenses from './JobExpenses';
import { JobExpensesItemResponseModel } from '../../typings/ResponseFormats';

export default class JobExpensesItem extends ModelBase {
  public id!: number;
  public jobExpensesId?: number;
  public itemName: string;
  public remarks: string;
  public price: number;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static associations: {
    jobExpenses: Association<JobExpensesItem, JobExpenses>;
  };

  public static associate(models: Models): void {
    JobExpensesItem.belongsTo(models.JobExpenses, { foreignKey: 'jobExpensesId', targetKey: 'id' });
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
        itemName: {
          type: DataTypes.STRING,
          allowNull: true
        },
        remarks: {
          type: DataTypes.TEXT,
          allowNull: true
        },
        price: {
          type: DataTypes.NUMBER,
          allowNull: true
        }
      },
      {
        sequelize,
        tableName: 'JobExpensesItem',
        freezeTableName: true,
        comment: 'A item for Job Expenses'
        // DON'T REMOVE COMMAND IF YOU DON'T WANT TO RESYNC/INIT DATABASE
        // schema: 'wellac'
      }
    );

    return this;
  }

  public toResponseFormat(): JobExpensesItemResponseModel {
    const { id, itemName, price, remarks, jobExpensesId } = this;

    return { id, itemName, price, remarks, jobExpensesId };
  }
}
