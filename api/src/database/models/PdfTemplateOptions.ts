import ModelBase from './ModelBase';
import { Models } from '../typings/Models';
import { DataTypes, Sequelize, Association } from 'sequelize';

export default class PdfTemplateOptions extends ModelBase {
  public id!: number;
  public fileName!: string;
  public headerOptionId: number;
  public clientInfoOptionId!: number;
  public tableOptionId!: number;
  public tncOptionId: number;
  public signatureOptionId: number;

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
          type: DataTypes.STRING,
          allowNull: false
        },
        headerOptionId: {
          type: DataTypes.INTEGER,
          allowNull: true
        },
        clientInfoOptionId: {
          type: DataTypes.INTEGER,
          allowNull: false
        },
        tableOptionId: {
          type: DataTypes.INTEGER,
          allowNull: false
        },
        tncOptionId: {
          type: DataTypes.INTEGER,
          allowNull: false
        },
        signatureOptionId: {
          type: DataTypes.INTEGER,
          allowNull: false
        }
      },
      {
        sequelize,
        tableName: 'PdfTemplateOptions',
        freezeTableName: true,
        timestamps: false,
        comment: 'Dynamic pdf template options.'
        // DON'T REMOVE COMMAND IF YOU DON'T WANT TO RESYNC/INIT DATABASE
        // schema: 'wellac'
      }
    );

    return this;
  }
}
