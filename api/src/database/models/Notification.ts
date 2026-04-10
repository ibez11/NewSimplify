import ModelBase from './ModelBase';
import { Models } from '../typings/Models';
import { DataTypes, Sequelize, Association } from 'sequelize';
import Job from './Job';
import { NotificationResponseModel } from '../../typings/ResponseFormats';

export default class Notification extends ModelBase {
  public id!: number;
  public title!: string;
  public description: string;
  public type!: string;
  public status!: string;
  public jobId: number;
  public resolvedBy?: string;

  // timestamp
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static associations: {
    job: Association<Notification, Job>;
  };

  public static associate(models: Models): void {
    Notification.belongsTo(models.Job, { foreignKey: 'jobId', targetKey: 'id' });
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
        title: {
          type: DataTypes.STRING,
          allowNull: false
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true
        },
        type: {
          type: DataTypes.STRING,
          allowNull: false
        },
        status: {
          type: DataTypes.STRING,
          allowNull: false
        },
        resolvedBy: {
          type: DataTypes.STRING,
          allowNull: true
        }
      },
      {
        sequelize,
        tableName: 'Notification',
        freezeTableName: true,
        comment: 'Notification for quick selection.'
        // DON'T REMOVE COMMAND IF YOU DON'T WANT TO RESYNC/INIT DATABASE
        // schema: 'wellac'
      }
    );

    return this;
  }

  public toResponseFormat(): NotificationResponseModel {
    const { id, title, description, type, status, jobId, createdAt, updatedAt, resolvedBy } = this;

    return {
      id,
      title,
      description,
      type,
      status,
      jobId,
      createdAt,
      updatedAt,
      resolvedBy
    };
  }
}
