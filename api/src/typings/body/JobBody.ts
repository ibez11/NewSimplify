import {
  ChecklistJobResponseModel,
  JobHistoryResponseModel,
  ServiceItemResponseModel,
  JobDocumentResponseModel,
  JobNoteResponseModel,
  JobLabelResponseModel,
  JobExpensesResponseModel,
  Select,
  MobileServiceItemPriceBreakdown,
  ActiveUserResponseModel,
  VehicleResponseModel
} from '../ResponseFormats';

export interface JobBody {
  id?: number;
  startDateTime?: Date | string;
  endDateTime?: Date | string;
  jobStatus?: string;
  needGST?: boolean;
  signature?: string;
  signatureUrl?: string;
  remarks?: string;
  vehicleJobs?: [];
  employee?: [];
  employeeId?: number[];
  collectedAmount?: number;
  paymentMethod?: string;
  paymentType?: string;
  location?: string;
  subtaskRemarks?: string;
  ChecklistJob?: [];
  ChecklistJobs?: ChecklistJobResponseModel[];
  JobLabels?: JobLabelResponseModel[];
  serviceId?: number;
  clientId?: number;
  clientName?: string;
  clientRemarks?: string;
  jobId?: number;
  serviceName?: string;
  serviceType?: string;
  serviceStatus?: string;
  contactPerson?: string;
  contactNumber?: string;
  contactEmail?: string;
  jobLabel?: string[];
  Skills?: string[];
  jobRemarks?: string;
  serviceAddressId?: number;
  serviceAddress?: string;
  postalCode?: string;
  ServiceItems?: ServiceItemResponseModel[];
  AdditionalServiceItems?: ServiceItemResponseModel[];
  JobChecklist?: ChecklistJobResponseModel[];
  JobHistories?: JobHistoryResponseModel[];
  JobDocuments?: JobDocumentResponseModel[];
  JobNotes?: JobNoteResponseModel[];
  employees?: string[];
  Employees?: ActiveUserResponseModel[];
  selectedEmployees?: Select[];
  vehicles?: string[];
  Vehicles?: VehicleResponseModel[];
  selectedVehicles?: Select[];
  JobExpenses?: JobExpensesResponseModel[];
  expensesCount?: number;
  jobAmount?: number;
  contractAmount?: number;
  contractDiscount?: number;
  gstTax?: number;
  defaultGst?: number;
  gstAmount?: number;
  jobDiscountAmount?: number;
  totalAmount?: number;
  jobCollectedAmount?: number;
  contractCollectedAmount?: number;
  contractOutstandingAmount?: number;
  additionalServiceId?: number;
  additionalServiceTitle?: string;
  additionalJobAmount?: number;
  additionalDiscountAmount?: number;
  additionalGstTax?: number;
  additionalGstAmount?: number;
  additionalTotalAmount?: number;
  additionalCollectedAmount?: number;
  additionalOutstandingAmount?: number;
  invoiceId?: number;
  invoiceNumber?: string;
  invoiceStatus?: string;
  priceVisibility?: boolean;
  entityName?: string;
  entityAddress?: string;
  entityContactNumber?: string;
  entityEmail?: string;
  paynowQrcode?: string;
  discountAmount?: number;
  additionalAmount?: number;
  outstandingContract?: number;
  ServiceSkills?: string[];
  vehicleNumbers?: string[];
  equipmentsCount?: number;
  ContactPersons?: ContactPerson[];
  generalNotesCount?: number;
  equipmentNotesCount?: number;
  CurrentContract?: MobileServiceItemPriceBreakdown;
  SeparateContract?: MobileServiceItemPriceBreakdown;
  totalJob?: number;
  jobSequence?: number;
  collectedBy?: string;
  isReplacement?: boolean;
  isAssignFirstJob?: boolean;
  isEditCollectedAmount?: boolean;
  chequeNumber?: string;
  currentNotesCount?: number;
  previousNotesCount?: number;
  doneJob?: number;
  callClientPermission?: boolean;
}

export interface ContactPerson {
  contactPerson: string;
  contactNumber: string;
  contactEmail: string;
  description?: string;
  isDefault?: boolean;
}

export interface SyncJobBody {
  id: string;
  jobId: number;
  firstName: string;
  lastName: string;
  contactNumber: string;
  contactEmail: string;
  jobStatus: string;
  startDateTime: Date | string;
  endDateTime: Date | string;
  ServiceItems: ServiceItemResponseModel[];
  employeeId: number[];
  employeeSyncId: number[];
  syncId: number;
  remarks: string;
}
