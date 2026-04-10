interface InvoicesModel {
  id: number;
  invoiceNumber: string;
  generatedDate: Date;
  clientName?: string;
  clientId: number;
  termStart: Date;
  termEnd: Date;
  contractTitle?: string;
  contractId: number;
  invoiceAmount: number;
  collectedAmount: number;
  outstandingAmount?: number;
  invoiceStatus: string;
  paymentMethod: string;
  createdAt: Date;
  createdBy?: string;
  serviceId: number;
  remarks: string;
  totalJob?: number;
  attnTo?: string;
}
