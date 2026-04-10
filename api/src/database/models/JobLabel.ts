import ModelBase from './ModelBase';
import { Models } from '../typings/Models';
import { DataTypes, Sequelize, Association } from 'sequelize';
import Job from './Job';
import { JobLabelResponseModel } from '../../typings/ResponseFormats';

export default class JobLabel extends ModelBase {
  public id!: number;
  public name!: string;
  public description: string;
  public color!: string;
  public jobId: number;

  // timestamp
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static associations: {
    job: Association<JobLabel, Job>;
  };

  public static associate(models: Models): void {
    JobLabel.belongsTo(models.Job, { foreignKey: 'jobId', targetKey: 'id' });
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
          type: DataTypes.TEXT,
          allowNull: true
        },
        color: {
          type: DataTypes.STRING,
          allowNull: false
        }
      },
      {
        sequelize,
        tableName: 'JobLabel',
        freezeTableName: true,
        comment: 'Job label for quick selection.'
        // DON'T REMOVE COMMAND IF YOU DON'T WANT TO RESYNC/INIT DATABASE
        // schema: 'wellac'
      }
    );

    return this;
  }

  public toResponseFormat(): JobLabelResponseModel {
    const { id, name, description, color, jobId } = this;

    return {
      id,
      name,
      description,
      color,
      jobId
    };
  }
}
