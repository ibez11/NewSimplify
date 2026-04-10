interface JobModel {
  jobId: number;
  clientId: number;
  serviceId: number;
  additionalServiceId: number;
  clientName: string;
  serviceName: string;
  invoiceNumber: string;
  serviceAddress: string;
  postalCode: string;
  jobSequence: number;
  totalJob: number;
  startDateTime: Date;
  endDateTime: Date;
  serviceType: string;
  jobAmount: number;
  collectedAmount: number;
  totalServiceAmount: number;
  paymentMethod: string;
  employees: string[];
  vehicles: string[];
  jobStatus: string;
  jobLabels: JobLabelModel[];
  ServiceItem: ServiceItemModel[];
  AdditionalServiceItem: ServiceItemModel[];
  entityName?: string;
  totalAmount?: number;
}
