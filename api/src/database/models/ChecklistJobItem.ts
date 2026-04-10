import { DataTypes, Sequelize, Association } from 'sequelize';

import ModelBase from './ModelBase';
import { Models } from '../typings/Models';
import ChecklistJob from './ChecklistJob';
import { ChecklistJobItemResponseModel } from '../../typings/ResponseFormats';

export default class ChecklistJobItem extends ModelBase {
  public id!: number;
  public name: string;
  public remarks: string;
  public status: boolean;
  public checklistJobId?: number;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static associations: {
    checklistJob: Association<ChecklistJobItem, ChecklistJob>;
  };

  public static associate(models: Models): void {
    ChecklistJobItem.belongsTo(models.ChecklistJob, { foreignKey: 'checklistJobId', targetKey: 'id' });
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
          type: DataTypes.TEXT,
          allowNull: true
        },
        remarks: {
          type: DataTypes.TEXT,
          allowNull: true
        },
        status: {
          type: DataTypes.BOOLEAN,
          allowNull: true
        }
      },
      {
        sequelize,
        tableName: 'ChecklistJobItem',
        freezeTableName: true,
        comment: 'A item for checklist Job'
        // DON'T REMOVE COMMAND IF YOU DON'T WANT TO RESYNC/INIT DATABASE
        // schema: 'wellac'
      }
    );

    return this;
  }

  public toResponseFormat(): ChecklistJobItemResponseModel {
    const { id, name, status, remarks, checklistJobId } = this;

    return { id, name, status, remarks, checklistJobId };
  }
}
