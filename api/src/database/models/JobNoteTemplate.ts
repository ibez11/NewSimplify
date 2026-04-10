import ModelBase from './ModelBase';
import { DataTypes, Sequelize } from 'sequelize';
import { JobNoteTemplateResponseModel } from '../../typings/ResponseFormats';

export default class JobNoteTemplate extends ModelBase {
  public id!: number;
  public notes!: string;

  // timestamp
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

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
          allowNull: false
        }
      },
      {
        sequelize,
        tableName: 'JobNoteTemplate',
        freezeTableName: true,
        comment: 'Job note template for quick selection.'
        // DON'T REMOVE COMMAND IF YOU DON'T WANT TO RESYNC/INIT DATABASE
        // schema: 'wellac'
      }
    );

    return this;
  }

  public toResponseFormat(): JobNoteTemplateResponseModel {
    const { id, notes } = this;

    return {
      id,
      notes
    };
  }
}
