import { DataTypes, Sequelize, Association } from 'sequelize';

import ModelBase from './ModelBase';
import { Models } from '../typings/Models';
import JobNote from './JobNote';
import { JobNoteMediaResponseModel } from '../../typings/ResponseFormats';

export default class JobNoteMedia extends ModelBase {
  public id!: number;
  public jobNoteId?: number;
  public fileName: string;
  public fileType: string;
  public imageUrl?: string;
  public preSignedUrl?: string;
  public displayName?: string;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static associations: {
    jobNote: Association<JobNoteMedia, JobNote>;
  };

  public static associate(models: Models): void {
    JobNoteMedia.belongsTo(models.JobNote, { foreignKey: 'jobNoteId', targetKey: 'id' });
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
        fileName: {
          type: DataTypes.TEXT,
          allowNull: true
        },
        fileType: {
          type: DataTypes.TEXT,
          allowNull: true
        }
      },
      {
        sequelize,
        tableName: 'JobNoteMedia',
        freezeTableName: true,
        comment: 'job note media of job note'
        // DON'T REMOVE COMMAND IF YOU DON'T WANT TO RESYNC/INIT DATABASE
        // schema: 'wellac'
      }
    );

    return this;
  }

  public toResponseFormat(): JobNoteMediaResponseModel {
    const { id, fileName, fileType, imageUrl, displayName } = this;

    return {
      id,
      fileName,
      fileType,
      imageUrl,
      displayName
    };
  }
}
