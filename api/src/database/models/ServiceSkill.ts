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

export default class ServiceSkill extends ModelBase {
  public id!: number;
  public skill!: string;
  public readonly service?: Service;

  // timestamp
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Auto generated methods from associations
  public createService: BelongsToCreateAssociationMixin<Service>;
  public getService: BelongsToGetAssociationMixin<Service>;
  public setService: BelongsToSetAssociationMixin<Service, number>;

  public static associations: {
    service: Association<ServiceSkill, Service>;
  };

  public static associate(models: Models): void {
    ServiceSkill.belongsTo(models.Service, { foreignKey: 'serviceId', onDelete: 'CASCADE' });
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
        skill: {
          type: DataTypes.STRING,
          allowNull: false
        }
      },
      {
        sequelize,
        tableName: 'ServiceSkill',
        freezeTableName: true,
        comment: 'Each line required skills in a service'
        // DON'T REMOVE COMMAND IF YOU DON'T WANT TO RESYNC/INIT DATABASE
        // schema: 'wellac'
      }
    );

    return this;
  }
}
