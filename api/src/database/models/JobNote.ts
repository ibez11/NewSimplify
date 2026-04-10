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

import ModelBase from './ModelBase';
import { Models } from '../typings/Models';
import Job from './Job';
import UserProfile from './UserProfile';
import Equipment from './Equipment';
import JobNoteMedia from './JobNoteMedia';
import { EquipmentResponseModel, JobNoteResponseModel } from '../../typings/ResponseFormats';

export default class JobNote extends ModelBase {
  public id!: number;
  public notes: string;
  public isHide: boolean;
  public imageUrl?: string;
  public jobNoteType: string;
  public fileType?: string;
  public imageBucket?: string;
  public jobId?: number;
  public equipmentId?: number;
  public createdBy?: number;
  public Equipment?: Equipment;
  public JobNoteMedia?: JobNoteMedia[];
  public UserProfile?: UserProfile;
  public displayName?: string;
  public Equipments?: EquipmentResponseModel[];

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public getjobNoteMedia!: HasManyGetAssociationsMixin<JobNoteMedia>;
  public addjobNoteMedia!: HasManyAddAssociationMixin<JobNoteMedia, number>;
  public addjobNoteMedias!: HasManyAddAssociationsMixin<JobNoteMedia, number>;
  public countjobNoteMedia!: HasManyCountAssociationsMixin;
  public createjobNoteMedia!: HasManyCreateAssociationMixin<JobNoteMedia>;
  public hasjobNoteMedia!: HasManyHasAssociationMixin<JobNoteMedia, number>;
  public hasjobNoteMedias!: HasManyHasAssociationsMixin<JobNoteMedia, number>;
  public removejobNoteMedia!: HasManyRemoveAssociationMixin<JobNoteMedia, number>;
  public removejobNoteMedias!: HasManyRemoveAssociationsMixin<JobNoteMedia, number>;
  public setjobNoteMedias!: HasManySetAssociationsMixin<JobNoteMedia, number>;

  public static associations: {
    job: Association<JobNote, Job>;
    equipment: Association<JobNote, Equipment>;
    userProfile: Association<JobNote, UserProfile>;
    JobNoteMedia: Association<JobNote, JobNoteMedia>;
  };

  public static associate(models: Models): void {
    JobNote.belongsTo(models.Job, { foreignKey: 'jobId', targetKey: 'id' });
    // JobNote.belongsTo(models.Equipment, { foreignKey: 'equipmentId', targetKey: 'id' });
    JobNote.belongsTo(models.UserProfile, { foreignKey: 'createdBy', targetKey: 'id' });
    JobNote.hasMany(models.JobNoteMedia, { foreignKey: 'jobNoteId', onDelete: 'CASCADE' });
    JobNote.belongsToMany(models.Equipment, {
      through: 'JobNoteEquipment',
      timestamps: false,
      foreignKey: 'jobNoteId'
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
        notes: {
          type: DataTypes.TEXT,
          allowNull: true
        },
        isHide: {
          type: DataTypes.BOOLEAN,
          allowNull: false
        },
        jobNoteType: {
          type: DataTypes.STRING,
          allowNull: true
        }
      },
      {
        sequelize,
        tableName: 'JobNote',
        freezeTableName: true,
        comment: 'A job note represent note for job'
        // DON'T REMOVE COMMAND IF YOU DON'T WANT TO RESYNC/INIT DATABASE
        // schema: 'wellac'
      }
    );

    return this;
  }

  public toResponseFormat(): JobNoteResponseModel {
    const { id, notes, fileType, jobNoteType, isHide } = this;

    return {
      id,
      notes,
      fileType,
      jobNoteType,
      isHide
    };
  }
}
