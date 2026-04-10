import { DataTypes, Sequelize, Association } from 'sequelize';

import ModelBase from './ModelBase';
import { Models } from '../typings/Models';
import ChecklistTemplate from './ChecklistTemplate';
import { ChecklistItemTemplateResponseModel } from '../../typings/ResponseFormats';

export default class ChecklistItemTemplate extends ModelBase {
  public id!: number;
  public name: string;
  public checklistId?: number;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static associations: {
    job: Association<ChecklistItemTemplate, ChecklistTemplate>;
  };

  public static associate(models: Models): void {
    ChecklistItemTemplate.belongsTo(models.ChecklistTemplate, { foreignKey: 'checklistId', targetKey: 'id' });
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
        }
      },
      {
        sequelize,
        tableName: 'ChecklistItemTemplate',
        freezeTableName: true,
        comment: 'A item for checklist template'
        // DON'T REMOVE COMMAND IF YOU DON'T WANT TO RESYNC/INIT DATABASE
        // schema: 'wellac'
      }
    );

    return this;
  }

  public toResponseFormat(): ChecklistItemTemplateResponseModel {
    const { id, name } = this;

    return { id, name };
  }
}
