import { DataTypes, Sequelize } from 'sequelize';
import ModelBase from './ModelBase';
import { DistrictBody } from '../../typings/body/DistrictBody';

export default class District extends ModelBase {
  public id!: number;
  public postalDistrict: string[];
  public postalSector: string[];
  public generalLocation: string[];
  public group?: string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static initModel(sequelize: Sequelize): any {
    this.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
        postalDistrict: {
          type: DataTypes.TEXT,
          allowNull: false
        },
        postalSector: {
          type: DataTypes.TEXT,
          allowNull: false
        },
        generalLocation: {
          type: DataTypes.TEXT,
          allowNull: false
        },
        group: {
          type: DataTypes.TEXT,
          allowNull: true
        }
      },
      {
        sequelize,
        tableName: 'District',
        freezeTableName: true,
        comment: 'District fo.'
        // DON'T REMOVE COMMAND IF YOU DON'T WANT TO RESYNC/INIT DATABASE
        // schema: 'wellac'
      }
    );

    return this;
  }

  public toResponseFormat(): DistrictBody {
    const { id, postalDistrict, postalSector, generalLocation, group } = this;

    return {
      id,
      postalDistrict,
      postalSector,
      generalLocation,
      group
    };
  }
}
