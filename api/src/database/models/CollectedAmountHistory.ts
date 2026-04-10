import ModelBase from './ModelBase';
import { Association, BelongsToGetAssociationMixin, BelongsToSetAssociationMixin, DataTypes, Sequelize } from 'sequelize';
import { CollectedAmountHistoryResponseModel } from '../../typings/ResponseFormats';
import Service from './Service';
import { Models } from '../typings/Models';
import Invoice from './Invoice';
import Job from './Job';

export default class CollectedAmountHistory extends ModelBase {
  public id!: number;
  public serviceId!: number;
  public collectedBy!: string;
  public collectedAmount!: number;
  public paymentMethod?: string;
  public isDeleted?: boolean;
  public invoiceId?: number;
  public jobId?: number;

  // timestamp
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Auto generated methods from associations
  public getService: BelongsToGetAssociationMixin<Service>;
  public setService: BelongsToSetAssociationMixin<Service, number>;

  public static associations: {
    Service: Association<CollectedAmountHistory, Service>;
    Invoice: Association<CollectedAmountHistory, Invoice>;
    Job: Association<CollectedAmountHistory, Job>;
  };

  public static associate(models: Models): void {
    CollectedAmountHistory.belongsTo(models.Service, { foreignKey: 'serviceId', targetKey: 'id' });
    CollectedAmountHistory.belongsTo(models.Invoice, { foreignKey: 'invoiceId', targetKey: 'id' });
    CollectedAmountHistory.belongsTo(models.Job, { foreignKey: 'jobId', targetKey: 'id' });
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
        collectedBy: {
          type: DataTypes.STRING,
          allowNull: false
        },
        collectedAmount: {
          type: DataTypes.INTEGER,
          allowNull: false
        },
        paymentMethod: {
          type: DataTypes.STRING,
          allowNull: true
        },
        isDeleted: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false
        }
      },
      {
        sequelize,
        tableName: 'CollectedAmountHistory',
        freezeTableName: true,
        comment: 'Collected Amount History of each Service'
        // DON'T REMOVE THIS COMMENT IF YOU DON'T WANT TO RESYNC/INIT DATABASE
        // schema: 'wellac'
      }
    );

    return this;
  }

  public toResponseFormat(): CollectedAmountHistoryResponseModel {
    const { id, serviceId, collectedBy, collectedAmount } = this;

    return {
      id,
      serviceId,
      collectedBy,
      collectedAmount
    };
  }
}
