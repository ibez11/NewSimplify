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

import { ChecklistJobResponseModel } from '../../typings/ResponseFormats';
import ChecklistJobItem from './ChecklistJobItem';
import Job from './Job';

export default class ChecklistJob extends ModelBase {
  public id!: number;
  public name!: string;
  public description?: string;
  public remarks?: string;
  public jobId?: number;
  public ChecklistItems?: ChecklistJobItem[];

  // timestamp
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public getChecklistItems!: HasManyGetAssociationsMixin<ChecklistJobItem>;
  public addChecklistItem!: HasManyAddAssociationMixin<ChecklistJobItem, number>;
  public addChecklistItems!: HasManyAddAssociationsMixin<ChecklistJobItem, number>;
  public countChecklistItem!: HasManyCountAssociationsMixin;
  public createChecklistItem!: HasManyCreateAssociationMixin<ChecklistJobItem>;
  public hasChecklistItem!: HasManyHasAssociationMixin<ChecklistJobItem, number>;
  public hasChecklistItems!: HasManyHasAssociationsMixin<ChecklistJobItem, number>;
  public removeChecklistItem!: HasManyRemoveAssociationMixin<ChecklistJobItem, number>;
  public removeChecklistItems!: HasManyRemoveAssociationsMixin<ChecklistJobItem, number>;
  public setChecklistItems!: HasManySetAssociationsMixin<ChecklistJobItem, number>;

  public static associations: {
    job: Association<ChecklistJob, Job>;
    ChecklistItems: Association<ChecklistJob, ChecklistJobItem>;
  };

  public static associate(models: Models): void {
    ChecklistJob.belongsTo(models.Job, { foreignKey: 'jobId', targetKey: 'id' });
    ChecklistJob.hasMany(models.ChecklistJobItem, {
      as: 'ChecklistItems',
      foreignKey: { name: 'checklistJobId', allowNull: false },
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
        name: {
          type: DataTypes.STRING,
          allowNull: false
        },
        description: {
          type: DataTypes.STRING,
          allowNull: true
        },
        remarks: {
          type: DataTypes.TEXT,
          allowNull: true
        }
      },
      {
        sequelize,
        tableName: 'ChecklistJob',
        freezeTableName: true,
        comment: 'Checklist Job for completed by technician.'
        // DON'T REMOVE COMMAND IF YOU DON'T WANT TO RESYNC/INIT DATABASE
        // schema: 'wellac'
      }
    );

    return this;
  }

  public toResponseFormat(): ChecklistJobResponseModel {
    const { id, name, description, remarks, jobId } = this;

    return {
      id,
      name,
      description,
      remarks,
      jobId
    };
  }
}
