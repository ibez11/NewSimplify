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

import { ChecklistTemplateResponseModel } from '../../typings/ResponseFormats';
import ChecklistItemTemplate from './ChecklistItemTemplate';

export default class ChecklistTemplate extends ModelBase {
  public id!: number;
  public name!: string;
  public description?: string;
  public ChecklistItems?: ChecklistItemTemplate[];

  // timestamp
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public getChecklistItems!: HasManyGetAssociationsMixin<ChecklistItemTemplate>;
  public addChecklistItem!: HasManyAddAssociationMixin<ChecklistItemTemplate, number>;
  public addChecklistItems!: HasManyAddAssociationsMixin<ChecklistItemTemplate, number>;
  public countChecklistItem!: HasManyCountAssociationsMixin;
  public createChecklistItem!: HasManyCreateAssociationMixin<ChecklistItemTemplate>;
  public hasChecklistItem!: HasManyHasAssociationMixin<ChecklistItemTemplate, number>;
  public hasChecklistItems!: HasManyHasAssociationsMixin<ChecklistItemTemplate, number>;
  public removeChecklistItem!: HasManyRemoveAssociationMixin<ChecklistItemTemplate, number>;
  public removeChecklistItems!: HasManyRemoveAssociationsMixin<ChecklistItemTemplate, number>;
  public setChecklistItems!: HasManySetAssociationsMixin<ChecklistItemTemplate, number>;

  public static associations: {
    ChecklistItems: Association<ChecklistTemplate, ChecklistItemTemplate>;
  };

  public static associate(models: Models): void {
    ChecklistTemplate.hasMany(models.ChecklistItemTemplate, {
      as: 'ChecklistItems',
      foreignKey: { name: 'checklistId', allowNull: false },
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
        }
      },
      {
        sequelize,
        tableName: 'ChecklistTemplate',
        freezeTableName: true,
        comment: 'Checklist service template for quick selection.'
        // DON'T REMOVE COMMAND IF YOU DON'T WANT TO RESYNC/INIT DATABASE
        // schema: 'wellac'
      }
    );

    return this;
  }

  public toResponseFormat(): ChecklistTemplateResponseModel {
    const { id, name, description } = this;

    return {
      id,
      name,
      description
    };
  }
}
