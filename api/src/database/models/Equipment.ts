import { DataTypes, Sequelize, Association } from 'sequelize';

import ModelBase from './ModelBase';
import { Models } from '../typings/Models';
import ServiceAddress from './ServiceAddress';
import UserProfile from './UserProfile';
import { EquipmentResponseModel } from '../../typings/ResponseFormats';

export default class Equipment extends ModelBase {
  public id!: number;
  public brand: string;
  public model: string;
  public serialNumber: string;
  public location: string;
  public dateWorkDone: Date;
  public remarks: string;
  public serviceAddressId!: number;
  public updatedBy: number;
  public isActive: boolean;
  public isMain: boolean;
  public mainId: number;
  public index?: number;
  public SubEquipments?: Equipment[];
  public notesCount?: number;
  public description?: string; // Optional field for additional information

  // Timestamps
  public warrantyStartDate?: Date;
  public warrantyEndDate?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static associations: {
    serviceAddress: Association<Equipment, ServiceAddress>;
    userProfile: Association<Equipment, UserProfile>;
    subEquipment: Association<Equipment, Equipment>;
  };

  public static associate(models: Models): void {
    Equipment.belongsTo(models.ServiceAddress, { foreignKey: 'serviceAddressId', targetKey: 'id' });
    Equipment.belongsTo(models.UserProfile, { foreignKey: 'updatedBy', targetKey: 'id' });
    Equipment.belongsToMany(models.ServiceItem, {
      through: 'ServiceItemEquipment',
      timestamps: false,
      foreignKey: 'equipmentId'
    });
    Equipment.hasMany(models.Equipment, {
      as: 'SubEquipments',
      foreignKey: 'mainId'
    });
    Equipment.belongsToMany(models.JobNote, {
      through: 'JobNoteEquipment',
      timestamps: false,
      foreignKey: 'equipmentId'
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
        brand: {
          type: DataTypes.STRING,
          allowNull: true
        },
        model: {
          type: DataTypes.STRING,
          allowNull: true
        },
        serialNumber: {
          type: DataTypes.STRING,
          allowNull: true
        },
        location: {
          type: DataTypes.STRING,
          allowNull: true
        },
        dateWorkDone: {
          type: DataTypes.DATE,
          allowNull: true
        },
        remarks: {
          type: DataTypes.STRING,
          allowNull: true
        },
        updatedBy: {
          type: DataTypes.STRING,
          allowNull: false
        },
        isActive: {
          type: DataTypes.BOOLEAN,
          allowNull: false
        },
        isMain: {
          type: DataTypes.BOOLEAN,
          allowNull: false
        },
        warrantyStartDate: {
          type: DataTypes.DATE,
          allowNull: true
        },
        warrantyEndDate: {
          type: DataTypes.DATE,
          allowNull: true
        },
        description: {
          type: DataTypes.STRING,
          allowNull: true
        }
      },
      {
        sequelize,
        tableName: 'Equipment',
        freezeTableName: true,
        comment: 'Equipment for client'
        // DON'T REMOVE COMMAND IF YOU DON'T WANT TO RESYNC/INIT DATABASE
        // schema: 'wellac'
      }
    );

    return this;
  }

  public toResponseFormat(): EquipmentResponseModel {
    const {
      id,
      brand,
      model,
      serialNumber,
      location,
      dateWorkDone,
      remarks,
      serviceAddressId,
      updatedBy,
      isActive,
      warrantyStartDate,
      warrantyEndDate,
      description,
      SubEquipments
    } = this;

    return {
      id,
      brand,
      model,
      serialNumber,
      location,
      dateWorkDone,
      remarks,
      serviceAddressId,
      updatedBy,
      isActive,
      warrantyStartDate,
      warrantyEndDate,
      description,
      SubEquipments
    };
  }
}
