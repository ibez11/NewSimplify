interface InvoiceDetailModel {
  id: number;
  invoiceNumber: string;
  invoiceStatus: string;
  invoiceAmount: number;
  invoiceRemarks: string;
  termEnd: string;
  dueDate: string;
  salesPerson: string;
  createdAt: Date;
  invoiceDate: Date;
  contractId: number;
  contractAmount: number;
  contractDiscount: number;
  gstTax: number;
  gst: number;
  totalCollectedAmount: number;
  totalOutstandingAmount: number;
  Client: ClientDetailsModel;
  Entity: EntityModel;
  Job: InvoiceJobModel[];
  InvoiceHistory: InvoiceHistoryModel[];
  attnTo?: string;
}
