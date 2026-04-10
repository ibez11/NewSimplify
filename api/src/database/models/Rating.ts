import { DataTypes, Sequelize, Association } from 'sequelize';

import ModelBase from './ModelBase';
import { Models } from '../typings/Models';
import Job from './Job';
import { RatingReponseModel } from '../../typings/ResponseFormats';

export default class Rating extends ModelBase {
  public id!: number;
  public feedback: string;
  public rate: number;
  public jobId: number;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static associations: {
    job: Association<Rating, Job>;
  };

  public static associate(models: Models): void {
    Rating.belongsTo(models.Job, { foreignKey: 'jobId', targetKey: 'id' });
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
        feedback: {
          type: DataTypes.TEXT,
          allowNull: true
        },
        rate: {
          type: DataTypes.INTEGER,
          allowNull: false
        }
      },
      {
        sequelize,
        tableName: 'Rating',
        freezeTableName: true,
        comment: 'A rating represent rating company or technician'
      }
    );

    return this;
  }

  public toResponseFormat(): RatingReponseModel {
    const { id, feedback, rate } = this;

    return {
      id,
      feedback,
      rate
    };
  }
}
