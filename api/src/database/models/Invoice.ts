import { Association, DataTypes, BelongsToGetAssociationMixin, BelongsToSetAssociationMixin, Sequelize } from 'sequelize';

import ModelBase from './ModelBase';
import { Models } from '../typings/Models';
import Service from './Service';

export enum InvoiceStatus {
  UNPAID = 'UNPAID',
  PARTIAL_PAID = 'PARTIALLY PAID',
  FULLY_PAID = 'FULLY PAID',
  VOID = 'VOID'
}

export default class Invoice extends ModelBase {
  public id!: number;
  public invoiceNumber!: string;
  public termStart!: Date;
  public termEnd!: Date;
  public invoiceAmount!: number;
  public collectedAmount!: number;
  public chargeAmount: number;
  public paymentMethod: string;
  public invoiceStatus: InvoiceStatus;
  public isSynchronize!: boolean;
  public remarks: string;
  public serviceId?: number;
  public Service?: Service;
  public createdBy: string;
  public dueDate?: string;
  public chequeNumber?: string;
  public attnTo?: string;
  // Timestamps
  public newInvoice!: Date;
  public updateInvoice!: Date;
  public invoiceDate!: Date;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Auto generated methods from associations
  public getService: BelongsToGetAssociationMixin<Service>;
  public setService: BelongsToSetAssociationMixin<Service, number>;

  public static associations: {
    service: Association<Service, Invoice>;
  };

  public static associate(models: Models): void {
    Invoice.belongsTo(models.Service, { foreignKey: 'serviceId', targetKey: 'id' });
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
        invoiceNumber: {
          type: DataTypes.STRING,
          allowNull: true
        },
        termStart: {
          type: DataTypes.DATEONLY,
          allowNull: false
        },
        termEnd: {
          type: DataTypes.DATEONLY,
          allowNull: false
        },
        invoiceAmount: {
          type: DataTypes.FLOAT,
          allowNull: false,
          defaultValue: 0
        },
        collectedAmount: {
          type: DataTypes.FLOAT,
          allowNull: false,
          defaultValue: 0
        },
        chargeAmount: {
          type: DataTypes.FLOAT,
          allowNull: true,
          defaultValue: 0
        },
        paymentMethod: {
          type: DataTypes.STRING,
          allowNull: true
        },
        invoiceStatus: {
          type: DataTypes.STRING,
          allowNull: true
        },
        isSynchronize: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false
        },
        remarks: {
          type: DataTypes.TEXT,
          allowNull: true
        },
        createdBy: {
          type: DataTypes.STRING,
          allowNull: true
        },
        newInvoice: {
          type: DataTypes.DATE,
          allowNull: true,
          defaultValue: null
        },
        updateInvoice: {
          type: DataTypes.DATE,
          allowNull: true,
          defaultValue: null
        },
        dueDate: {
          type: DataTypes.STRING,
          allowNull: true
        },
        chequeNumber: {
          type: DataTypes.STRING,
          allowNull: true
        },
        invoiceDate: {
          type: DataTypes.DATE,
          allowNull: false
        },
        attnTo: {
          type: DataTypes.STRING,
          allowNull: true
        }
      },
      {
        sequelize,
        tableName: 'Invoice',
        freezeTableName: true,
        comment: 'Company invoice information'
        // DON'T REMOVE COMMAND IF YOU DON'T WANT TO RESYNC/INIT DATABASE
        // schema: 'wellac'
      }
    );

    return this;
  }
}
