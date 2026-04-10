import ModelBase from './ModelBase';
import { Association, BelongsToGetAssociationMixin, BelongsToSetAssociationMixin, DataTypes, Sequelize } from 'sequelize';
import { InvoiceHistoryResponseModel } from '../../typings/ResponseFormats';
import Invoice from './Invoice';
import { Models } from '../typings/Models';

export default class InvoiceHistory extends ModelBase {
  public id!: number;
  public invoiceId!: number;
  public label!: string;
  public description!: string;
  public updatedBy!: string;

  // timestamp
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Auto generated methods from associations
  public getInvoice: BelongsToGetAssociationMixin<Invoice>;
  public setInvoice: BelongsToSetAssociationMixin<Invoice, number>;

  public static associations: {
    Invoice: Association<InvoiceHistory, Invoice>;
  };

  public static associate(models: Models): void {
    InvoiceHistory.belongsTo(models.Invoice, { foreignKey: 'invoiceId', targetKey: 'id' });
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
        label: {
          type: DataTypes.STRING,
          allowNull: false
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: false
        },
        updatedBy: {
          type: DataTypes.STRING,
          allowNull: false
        }
      },
      {
        sequelize,
        tableName: 'InvoiceHistory',
        freezeTableName: true,
        comment: 'History of each Invoice'
        // DON'T REMOVE THIS COMMENT IF YOU DON'T WANT TO RESYNC/INIT DATABASE
        // schema: 'wellac'
      }
    );

    return this;
  }

  public toResponseFormat(): InvoiceHistoryResponseModel {
    const { id, invoiceId, label, description, updatedBy } = this;

    return {
      id,
      invoiceId,
      label,
      description,
      updatedBy
    };
  }
}
