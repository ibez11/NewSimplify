import ModelBase from './ModelBase';
import { Models } from '../typings/Models';
import UserProfile from './UserProfile';
import { Association, DataTypes, Sequelize } from 'sequelize';
import { TimeOffBody } from '../../typings/body/TimeOffBody';

export default class TimeOff extends ModelBase {
  public id!: number;
  public status!: string;
  public remarks?: string;

  // Timestamps
  public startDateTime!: string;
  public endDateTime!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public associations: {
    userProfile: Association<TimeOff, UserProfile>;
  };

  public static associate(models: Models): void {
    TimeOff.belongsToMany(models.UserProfile, { through: 'TimeOffEmployee', timestamps: false, foreignKey: 'timeOffId' });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static initModel(sequelize: Sequelize): any {
    this.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
        status: {
          type: DataTypes.STRING,
          allowNull: false
        },
        remarks: {
          type: DataTypes.STRING,
          allowNull: true
        },
        startDateTime: {
          type: DataTypes.TIME,
          allowNull: false
        },
        endDateTime: {
          type: DataTypes.TIME,
          allowNull: false
        }
      },
      {
        sequelize,
        tableName: 'TimeOff',
        freezeTableName: true,
        comment: 'TimeOff contains users that want to have on leave or medichal check up'
        // DON'T REMOVE COMMAND IF YOU DON'T WANT TO RESYNC/INIT DATABASE
        // schema: 'wellac'
      }
    );

    return this;
  }

  public toResponseFormat(): TimeOffBody {
    const { id, status, remarks, startDateTime, endDateTime } = this;

    return {
      id,
      status,
      remarks,
      startDateTime,
      endDateTime
    };
  }
}
