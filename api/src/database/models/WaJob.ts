import ModelBase from './ModelBase';
import { DataTypes, Sequelize } from 'sequelize';
import { WAJobResponseModel } from '../../typings/ResponseFormats';

export default class WaJob extends ModelBase {
  public TenantKey!: string;
  public JobId!: number;
  public wamid!: string;
  public status!: string;

  // timestamp
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // eslint-disable-next-line
  public static initModel(sequelize: Sequelize): any {
    this.init(
      {
        wamid: {
          type: DataTypes.TEXT,
          primaryKey: true
        },
        TenantKey: {
          type: DataTypes.STRING,
          allowNull: false
        },
        JobId: {
          type: DataTypes.INTEGER,
          allowNull: false
        },
        status: {
          type: DataTypes.STRING,
          allowNull: true
        }
      },
      {
        sequelize,
        tableName: 'WaJob',
        freezeTableName: true,
        comment: 'WaJob stores all Job Id information',
        timestamps: false
        // DON'T REMOVE THIS COMMENT IF YOU DON'T WANT TO RESYNC/INIT DATABASE
        // schema: 'wellac'
      }
    );

    return this;
  }

  public toResponseFormat(): WAJobResponseModel {
    const { TenantKey, JobId, wamid, status } = this;

    return {
      TenantKey,
      JobId,
      wamid,
      status
    };
  }
}
