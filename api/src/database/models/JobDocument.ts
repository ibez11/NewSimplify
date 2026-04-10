import { DataTypes, Sequelize, Association } from 'sequelize';

import ModelBase from './ModelBase';
import { Models } from '../typings/Models';
import Job from './Job';
import { JobDocumentResponseModel } from '../../typings/ResponseFormats';

export default class JobDocument extends ModelBase {
  public id!: number;
  public notes: string;
  public documentUrl: string;
  public isHide: boolean;
  public documentBucket?: string;
  public jobId?: number;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static associations: {
    job: Association<JobDocument, Job>;
  };

  public static associate(models: Models): void {
    JobDocument.belongsTo(models.Job, { foreignKey: 'jobId', targetKey: 'id' });
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
        notes: {
          type: DataTypes.TEXT,
          allowNull: true
        },
        documentUrl: {
          type: DataTypes.TEXT,
          allowNull: true
        },
        isHide: {
          type: DataTypes.BOOLEAN,
          allowNull: false
        }
      },
      {
        sequelize,
        tableName: 'JobDocument',
        freezeTableName: true,
        comment: 'A job document represent note for job'
        // DON'T REMOVE COMMAND IF YOU DON'T WANT TO RESYNC/INIT DATABASE
        // schema: 'wellac'
      }
    );

    return this;
  }

  public toResponseFormat(): JobDocumentResponseModel {
    const { id, notes, documentUrl, isHide } = this;

    return {
      id,
      notes,
      documentUrl,
      isHide
    };
  }
}
