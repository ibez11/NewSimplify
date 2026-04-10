interface InvoiceJobModel {
  id: number;
  startDateTime: Date;
  serviceItemsJob: ServiceItemModel[];
  totalServiceItem: number;
  jobStatus: string;
  jobAmount: number;
  collectedAmount: number;
  collectedBy: string;
  paymentMethod: string;
  chequeNumber: string;
}
