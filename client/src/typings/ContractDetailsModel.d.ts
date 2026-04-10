interface ContractDetailsModel {
  id: number;
  serviceTitle: string;
  serviceType: string;
  serviceNumber: string;
  description: string;
  serviceStatus: string;
  needGST: boolean;
  termStart: Date;
  termEnd: Date;
  invoiceNumber?: string;
  originalAmount: number;
  discountAmount?: number;
  gstTax?: number;
  gstAmount: number;
  totalAmount: number;
  remarks: string;
  termCondition?: string;
  isRenewed?: boolean;
  renewedServiceId?: number;
  salesPerson?: string;
  Client: {
    id: number;
    name: string;
    country: string;
    contactNumber?: string;
    billingAddress: string;
    billingFloorNo: string;
    billingUnitNo: string;
    billingPostal: string;
    needGST: boolean;
    remarks: string;
  };
  Entity: EntityModel;
  ServiceSkills: SkillsModel[];
  ServiceAddress: {
    id: number;
    contactPerson: string;
    contactNumber: string;
    address: string;
    floorNo: string;
    unitNo: string;
    country: string;
    postalCode: string;
  };
  Schedules: ScheduleModel[];
  Jobs: [
    {
      id: number;
      jobStatus: string;
      startDateTime: Date;
      endDateTime: Date;
      additionalServiceId?: number;
      ChecklistJob: ChecklistTemplateModel[];
      serviceItemsJob: ServiceItemModel[];
      JobLabels: JobLabelModel[];
    }
  ];
  Invoice?: InvoicesModel[];
}
