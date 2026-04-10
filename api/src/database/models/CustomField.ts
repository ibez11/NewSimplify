import {
  Association,
  BelongsToCreateAssociationMixin,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  DataTypes,
  Sequelize
} from 'sequelize';

import ModelBase from './ModelBase';
import Service from './Service';
import { Models } from '../typings/Models';

export default class CustomField extends ModelBase {
  public id!: number;
  public label!: string;
  public value!: string;
  public readonly service?: Service;

  // timestamp
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Auto generated methods from associations
  public createService: BelongsToCreateAssociationMixin<Service>;
  public getService: BelongsToGetAssociationMixin<Service>;
  public setService: BelongsToSetAssociationMixin<Service, number>;

  public static associations: {
    service: Association<CustomField, Service>;
  };

  public static associate(models: Models): void {
    CustomField.belongsTo(models.Service, { foreignKey: 'serviceId', onDelete: 'CASCADE' });
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
        label: {
          type: DataTypes.STRING,
          allowNull: false
        },
        value: {
          type: DataTypes.STRING,
          allowNull: false
        }
      },
      {
        sequelize,
        tableName: 'CustomField',
        freezeTableName: true,
        comment: 'Custom Field for each service'
        // DON'T REMOVE COMMAND IF YOU DON'T WANT TO RESYNC/INIT DATABASE
        // schema: 'wellac'
      }
    );

    return this;
  }
}
