import { DataTypes, Sequelize, Association } from 'sequelize';

import ModelBase from './ModelBase';
import { Models } from '../typings/Models';
import Job from './Job';
import UserProfile from './UserProfile';
import { JobHistoryResponseModel } from '../../typings/ResponseFormats';

export default class JobHistory extends ModelBase {
  public id!: number;
  public jobStatus: string;
  public location: string;
  public dateTime: Date;
  public jobId?: number;
  public userProfileId?: number;

  public static associations: {
    job: Association<JobHistory, Job>;
    userProfile: Association<JobHistory, UserProfile>;
  };

  public static associate(models: Models): void {
    JobHistory.belongsTo(models.Job, { foreignKey: 'jobId', targetKey: 'id' });
    JobHistory.belongsTo(models.UserProfile, { foreignKey: 'userProfileId', targetKey: 'id' });
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
        jobStatus: {
          type: DataTypes.TEXT,
          allowNull: true
        },
        location: {
          type: DataTypes.TEXT,
          allowNull: true
        },
        dateTime: {
          type: DataTypes.TIME,
          allowNull: false
        }
      },
      {
        sequelize,
        tableName: 'JobHistory',
        freezeTableName: true,
        timestamps: false,
        comment: 'A job history represent history status for job'
        // DON'T REMOVE COMMAND IF YOU DON'T WANT TO RESYNC/INIT DATABASE
        // schema: 'wellac'
      }
    );

    return this;
  }

  public toResponseFormat(): JobHistoryResponseModel {
    const { id, jobStatus, location, dateTime } = this;

    return {
      id,
      jobStatus,
      location,
      dateTime
    };
  }
}
