import { Modules, AccessLevels } from '../database/models/Permission';
import { ClientTypes } from '../database/models/Client';
import ServiceItem from '../database/models/ServiceItem';
import Job from '../database/models/Job';
import Equipment from '../database/models/Equipment';

export interface Select {
  id: number;
  name: string;
}

export interface UserProfileResponseModel {
  id: number;
  displayName: string;
  email: string;
  contactNumber: string;
  token: string;
  role?: string;
  countryCode?: string;
  homeDistrict?: string;
  homePostalCode?: string;
}

export interface UserDetailsResponseModel extends UserProfileResponseModel {
  roleId: number;
  role: string;
  active: boolean;
  lock: boolean;
  token: string;
  skills?: UserSkillResponseModel[];
}

export interface TenantResponseModel {
  key: string;
  name: string;
  numberOfLicense: number;
  salesPerson: string;
  subscriptExpDate: Date;
  planType: string;
  whatsappService: boolean;
  emailService: boolean;
  syncApp: boolean;
}

export interface PermissionResponseModel {
  module: Modules;
  accessLevel: AccessLevels;
}

export interface RoleResponseModel {
  id: number;
  name: string;
  description?: string;
  isEdited?: boolean;
}

export interface ClientResponseModel {
  id: number;
  name: string;
  clientType: ClientTypes;
  billingAddress: string;
  billingFloorNo?: string;
  billingUnitNo?: string;
  billingPostal?: string;
  activeContract?: number;
  totalAmount?: number;
}

export interface ServiceItemResponseModel {
  id: number;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number | string;
  totalPrice: number | string;
  discountType?: number;
  discountAmt?: number;
  serviceId?: number;
  idQboWithGST?: string;
  IdQboWithoutGST?: string;
  serviceType?: string;
  invoiceNumber?: string;
  ServiceItems?: ServiceItemResponseModel[];
  scheduleId?: number;
  scheduleIndex?: number;
  isDeleted?: boolean;
  Equipments?: EquipmentResponseModel[];
  isDiscountVisible?: boolean;
  new?: boolean;
}

export interface MobileServiceItemResponseModel {
  id: number;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number | string;
  discountAmt?: number;
  Equipments?: EquipmentResponseModel[];
}

export interface ServiceItemTemplateResponseModel {
  id: number;
  name: string;
  description?: string;
  unitPrice: number;
  idQboWithGST?: string;
  IdQboWithoutGST?: string;
}

export interface ServiceTemplateResponseModel {
  id: number;
  name: string;
  description?: string;
  termCondition?: string;
}

export interface ServiceSkillResponseModel {
  serviceId: number;
  skill: string;
}

export interface SkillTemplateResponseModel {
  id: number;
  name: string;
  description?: string;
}

export interface VehicleResponseModel {
  id: number;
  model?: string;
  carplateNumber: string;
  coeExpiryDate?: Date;
  employeeInCharge?: number;
  vehicleStatus?: boolean;
  displayName?: string;
}

export interface ActiveUserResponseModel {
  id: number;
  displayName: string;
  token?: string;
  UserSkills?: UserSkillResponseModel[];
  matchSkills?: UserSkillResponseModel[];
  matchNumber?: number;
  contactNumber?: string;
  countryCode?: string;
  homeDistrict?: string;
  homePostalCode?: string;
  proximityScore?: number;
  skillsetScore?: number;
  finalScore?: number;
}

export interface ServiceResponseModel {
  id: number;
  contractId: string;
  clientId: number;
  clientName: string;
  contactNumber: string;
  contractTitle: string;
  contractType: string;
  contractStatus: string;
  startDate: Date;
  endDate: Date;
  createdDate: Date;
  invoiceId?: number;
  invoiceNo: string;
  invoiceCollectedAmount?: number;
  amount: number;
  entityId: number;
  entity: string;
  completed: number;
  cancelledJob?: number;
  additionalCompleted?: number;
  additionalTotalJob?: number;
  totalJob: number;
  invoiceStatus?: string;
  isRenewed?: boolean;
  collectedAmount?: number;
  outstandingAmount?: number;
  countryCode?: string;
  serviceAddress?: string;
  postalCode?: string;
  ServiceItems?: ServiceItemResponseModel[];
  ContactPersons?: ContactPersonResponseModel[];
  JobLabels?: JobLabelResponseModel[];
  CustomFields?: CustomFieldResponseModel[];
}

export interface ScheduleResponseModel {
  serviceId: number;
  repeatType: string;
  repeatEvery: string;
  selectedDay: string;
  selectedWeek: string;
  selectedMonth: string;
  repeatEndType: string;
  repeatEndAfter: Date;
  repeatEndOnDate: Date;
}

export interface NewScheduleResponseModel {
  serviceId: number;
  startDateTime?: Date;
  endDateTime?: Date;
  repeatType: string;
  repeatEvery: number;
  repeatOnDate: number;
  repeatOnDay: string;
  repeatOnWeek: number;
  repeatOnMonth: number;
  repeatEndType: string;
  repeatEndAfter: number;
  repeatEndOnDate?: Date;
}

export interface ServiceAddressResponseModel {
  id: number;
  country: string;
  address: string;
  floorNo: string;
  unitNo: string;
  postalCode: string;
  clientId?: number;
}

export interface ContactPersonResponseModel {
  id?: number;
  contactPerson: string;
  countryCode?: string;
  contactNumber: string;
  contactEmail: string;
  clientId?: number;
  description?: string;
  isMain?: boolean;
  isDefault?: boolean;
  isDeleted?: boolean;
  country?: string;
}

export interface JobResponseModel {
  id: number;
  jobStatus: string;
  jobId: number;
  clientId: number;
  clientName: string;
  clientRemarks?: string;
  serviceType?: string;
  serviceStatus?: string;
  serviceNumber?: string;
  serviceName: string;
  serviceAddressId: number;
  serviceAddress: string;
  serviceFloorNo?: string;
  serviceUnitNo?: string;
  postalCode?: string;
  createdDate: Date;
  startDateTime: string;
  endDateTime: string;
  startDateTimeMobile?: Date;
  endDateTimeMobile?: Date;
  vehicleId: number;
  vehicleNo: string;
  employee?: UserProfileResponseModel[];
  employeeId?: number[];
  employeeSyncId?: number[];
  syncId?: number;
  vehicleJobs?: VehicleResponseModel[];
  serviceId: number;
  type: string;
  needGST: boolean;
  gstTax: number;
  contactPerson?: string;
  countryCode?: string;
  contactNumber?: string;
  contactEmail?: string;
  secondaryContactPerson?: string;
  secondaryContactNumber?: string;
  secondaryContactEmail?: string;
  thirdContactPerson?: string;
  thirdContactNumber?: string;
  thirdContactEmail?: string;
  fourthContactPerson?: string;
  fourthContactNumber?: string;
  fourthContactEmail?: string;
  signature?: string;
  remarks?: string;
  entityId?: number;
  entityName?: string;
  entityAddress?: string;
  entityCountryCode?: string;
  entityContactNumber?: string;
  entityLogo?: string;
  entityEmail?: string;
  entityQrImage?: string;
  registerNumberGST?: string;
  uenNumber?: string;
  discountAmount?: number;
  gstAmountService?: number;
  originalAmountService?: number;
  totalAmountService?: number;
  jobAmount?: number;
  jobDiscountAmount?: number;
  jobGstAmount?: number;
  jobTotalAmount?: number;
  jobAmountBeforeGst?: number;
  collectedAmount?: number;
  totalCollectedAmountContract?: number;
  outstandingContract?: number;
  paymentMethod?: string;
  contractBalance?: number;
  invoiceId?: number;
  invoiceNumber?: string;
  invoiceStatus?: string;
  additionalInvoiceNumber?: string;
  additionalInvoiceStatus?: string;
  signatureUrl?: string;
  paynowQrcode?: string;
  isLastJob?: boolean;
  additionalServiceId?: number;
  additionalServiceTitle?: string;
  additionalAmount?: number;
  additionalGstAmount?: number;
  additionalDiscountAmount?: number;
  additionalTotalAmount?: number;
  additionalCollectedAmount?: number;
  additionalTotalCollectedAmount?: number;
  additionalOutstandingAmount?: number;
  AdditionalServiceItem?: ServiceItemResponseModel[];
  ServiceItem?: ServiceItemResponseModel[];
  jobNotes?: JobNoteResponseModel[];
  jobDocuments?: JobDocumentResponseModel[];
  jobLabels?: JobLabelResponseModel[];
  jobHistories?: JobHistoryResponseModel[];
  ContactPerson?: ContactPersonResponseModel[];
  ContactPersons?: ContactPersonResponseModel[];
  ChecklistJob?: ChecklistJobResponseModel[];
  priceVisibility?: boolean;
  employees?: string[];
  vehicles?: string[];
  doneJob?: number;
  totalJob?: number;
  totalAmount?: number;
  serviceJobCount?: number;
  defaultGst?: number;
  serviceGstTax?: number;
  additionalGstTax?: number;
  emailJobReport?: boolean;
  JobExpenses?: JobExpensesResponseModel[];
  expensesItems?: JobExpensesItemResponseModel[];
  ServiceSkills?: ServiceSkillResponseModel[];
  jobSequence?: number;
  ServiceContract?: MobileServiceItemPriceBreakdown;
  SeparateContract?: MobileServiceItemPriceBreakdown;
  CustomFields?: CustomFieldResponseModel[];
  chequeNumber?: string;
  callClientPermission?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface JobCsvResponseModel {
  id: number;
  jobId: number;
  serviceId: number;
  clientName: string;
  serviceName: string;
  serviceAddress: string;
  createdDate: Date;
  startDateTime: string;
  endDateTime: string;
  actualStart: Date;
  actualEnd: Date;
  employees?: string[];
  employeeName?: string;
  vehicles?: string[];
  vehicleNo: string;
  jobStatus: string;
  serviceType?: string;
  invoiceNumber?: string;
  invoiceStatus?: string;
  additionalInvoiceNumber?: string;
  additionalInvoiceStatus?: string;
  contractAmount: number;
  discountAmount?: number;
  jobAmount: number;
  jobDiscountAmount: number;
  jobCollectedAmount: number;
  additionalServiceItemAmount: number;
  totalJobAmount: number;
  serviceItemsName: string;
  serviceItemsDescription: string;
  serviceItemsQty: string;
  serviceItemsPrice: string;
  additionalServiceId?: number;
  additionalServiceItemsName: string;
  additionalServiceItemsDescription: string;
  additionalServiceItemsQty: string;
  additionalServiceItemsPrice: string;
  totalCompletedJob: number;
  contractNumber: number;
  jobGstAmount?: number;
  jobTotalAmount?: number;
  totalServiceAmount: number;
  needGST: boolean;
  serviceGstTax?: number;
  paymentMethod?: string;
  ServiceItem?: ServiceItemResponseModel[];
  AdditionalServiceItem: ServiceItemResponseModel[];
  jobHistories?: JobHistoryResponseModel[];
  additionalTotalAmount?: number;
  additionalCollectedAmount?: number;
  additionalAmount?: number;
  additionalDiscountAmount?: number;
  JobExpenses?: JobExpensesResponseModel[];
  expensesItems?: string;
  actualStartTime?: string;
  actualEndTime?: string;
  doneJob?: number;
  totalJob?: number;
  salesPerson?: string;
  agentName?: string;
  entityName?: string;
  CustomFields?: CustomFieldResponseModel[];
  contactPerson?: string;
  contactCountryCode?: string;
  contactNumber?: string;
  contactEmail?: string;
  billingAddress?: string;
}

export interface JobCsvData {
  jobId: number;
  clientName: string;
  serviceName: string;
  jobStatus: string;
  jobType: string;
  jobDate: string;
  startTime: string;
  endTime: string;
  actualStartTime: string;
  actualEndTime: string;
  serviceAddress: string;
  assignedVehicle: string;
  assignedEmployee: string;
  serviceType: string;
  invoiceNumber: string;
  invoiceStatus: string;
  additionalInvoiceNumber: string;
  additionalInvoiceStatus: string;
  collectedAmount: number;
  totalServiceAmount: number;
  jobAmount: number;
  jobDiscountAmount: number;
  jobGstAmount: number;
  totalJobAmount: number;
  additionalAmount: number;
  additionalDiscountAmount: number;
  additionalGstAmount: number;
  totalAdditionalAmount: number;
  totalJobAndAdditionalAmount: number;
  serviceItems: string;
  serviceItemsQty: string;
  serviceItemsPrice: string;
  serviceItemsDescription: string;
  additionalServiceItems: string;
  additionalServiceItemsDescription: string;
  additionalServiceItemsQty: string;
  additionalServiceItemsPrice: string;
  totalCompletedJobs: number;
  totalJob: number;
  paymentMethod: string;
  additionalCollectedAmount: number;
  expensesItems: string;
  totalAdditionalAmountBeforeGst: number;
  salesPerson: string;
  agentName: string;
  entityName: string;
  customFieldLabel1?: string;
  customFieldValue1?: string;
  customFieldLabel2?: string;
  customFieldValue2?: string;
  actualDuration?: string;
  contactPerson?: string;
  contactNumber?: string;
  contactEmail?: string;
  billingAddress?: string;
}

export interface JobDetailResponseModel {
  id: number;
  startDateTime: string;
  endDateTime: string;
  assignedBy?: number;
  serviceId?: number;
  additionalServiceId?: number;
  collectedAmount?: number;
  paymentMethod?: string;
}

export interface JobGenerateResponseModel {
  id?: number;
  jobStatus: string;
  startDateTime: string;
  endDateTime: string;
  ServiceItems?: ServiceItem[];
  serviceId?: number;
  duration?: number;
  occurance?: number;
}

export interface JobNoteResponseModel {
  id: number;
  notes: string;
  jobNoteType: string;
  isHide: boolean;
  jobId?: number;
  equipmentId?: number;
  fileType?: string;
  imageUrl?: string;
  UserProfile?: UserProfileResponseModel;
  Equipment?: EquipmentResponseModel;
  JobNoteMedia?: JobNoteMediaResponseModel[];
  createdAt?: Date;
  updatedAt?: Date;
  displayName?: string;
}

export interface JobNoteMediaResponseModel {
  id: number;
  jobNoteId?: number;
  fileName: string;
  fileType: string;
  imageUrl?: string;
  displayName?: string;
}

export interface MobileJobNoteResponseModel {
  id: number;
  jobId?: number;
  notes: string;
  isHide: boolean;
  jobNoteType?: string;
  Equipment?: EquipmentResponseModel;
  Equipments?: EquipmentResponseModel[];
  createdBy?: number;
  JobNoteMedia: JobNoteMediaResponseModel[];
  displayName?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface JobDocumentResponseModel {
  id: number;
  notes: string;
  documentUrl: string;
  isHide: boolean;
  jobId?: number;
}

export interface JobHistoryResponseModel {
  id: number;
  jobStatus: string;
  location: string;
  dateTime: Date;
  jobId?: number;
}

export interface ParametersResponseModel {
  name: string;
  id: number;
}

export interface EntityResponseModel {
  id: number;
  name: string;
  address?: string;
  logo: string;
  countryCode: string;
  contactNumber: string;
  email?: string;
  needGST: boolean;
  qrImage?: string;
  registerNumberGST?: string;
  invoiceFooter?: string;
  uenNumber?: string;
}

export interface SettingResponseModel {
  id: number;
  label: string;
  code?: string;
  value?: string;
  isActive: boolean;
}

export interface TableColumnSettingResponseModel {
  id: number;
  tableName: string;
  column?: JSON;
}

export interface AppLogResponseModel {
  id: number;
  user: string;
  description: string;
}

export interface AgentResponseModel {
  id: number;
  name: string;
  description: string;
}

export interface UserSkillResponseModel {
  id: number;
  skill: string;
  userProfileId?: number;
}

export interface ChecklistTemplateResponseModel {
  id: number;
  name: string;
  description?: string;
}

export interface ChecklistItemTemplateResponseModel {
  id: number;
  name: string;
  checklistId?: number;
}

export interface NewChecklistItemTemplateResponseModel {
  id?: number;
  name: string;
  checklistId?: number;
}

export interface ChecklistJobResponseModel {
  id: number;
  jobId: number;
  name: string;
  description?: string;
  remarks?: string;
  ChecklistJobItems?: ChecklistJobItemResponseModel[];
  ChecklistItems?: ChecklistJobItemResponseModel[];
}

export interface ChecklistJobItemResponseModel {
  id: number;
  checklistJobId: number;
  name: string;
  status: boolean;
  remarks: string;
}

export interface JobExpensesResponseModel {
  id: number;
  jobId: number;
  serviceId: number;
  header: string;
  remarks?: string;
  totalExpenses: number;
  JobExpensesItems?: JobExpensesItemResponseModel[];
}

export interface JobExpensesItemResponseModel {
  id: number;
  jobExpensesId: number;
  itemName: string;
  price: number;
  remarks: string;
}

export interface MobileJobExpensesResponseModel {
  id: number;
  jobId: number;
  serviceId: number;
  header: string;
  remarks?: string;
  totalExpenses: number;
  expensesItems?: JobExpensesItemResponseModel[];
}

export interface ScheduleTimeGenerateModel {
  id?: number;
  scheduleIndex?: number;
  startDateTime: string;
  endDateTime: string;
}

export interface ReportLineResponseModel {
  y: number;
  x: string;
  type?: string;
}

export interface ReportValueJobResponseModel {
  y: number;
  x: string;
  totalAmount?: number;
  additionalAmount?: number;
  type?: string;
}

export interface ReportCountResponseModel {
  type: string | number;
  value: number;
  percent?: number;
}

export interface RatingReponseModel {
  id: number;
  feedback: string;
  rate: number;
}

export interface SettingDetailResponseModel {
  Setting: SettingResponseModel[];
  activeTechnician?: number;
  activeAdmin?: number;
  activeVehicle?: number;
  agent?: number;
  client?: number;
}

export interface JobNoteTemplateResponseModel {
  id: number;
  notes: string;
}

export interface EquipmentResponseModel {
  id: number;
  brand: string;
  model: string;
  serialNumber: string;
  location?: string;
  dateWorkDone?: Date;
  remarks?: string;
  serviceAddressId?: number;
  address?: string;
  updatedBy?: number;
  isActive: boolean;
  ServiceAddress?: ServiceAddressResponseModel;
  isMain?: boolean;
  mainId?: number;
  type?: string;
  index?: number;
  SubEquipments?: Equipment[];
  notesCount?: number;
  clientId?: number;
  clientName?: string;
  warrantyStartDate?: Date | string;
  warrantyEndDate?: Date | string;
  description?: string;
}

export interface JobLabelTemplateResponseModel {
  id: number;
  name: string;
  description: string;
  color: string;
}

export interface JobLabelResponseModel {
  id: number;
  name: string;
  description: string;
  color: string;
  jobId: number;
}

export interface WAJobResponseModel {
  TenantKey: string;
  JobId: number;
  wamid: string;
  status: string;
}

export interface CodeWAModel {
  code: string;
}

export interface TemplateWAModel {
  name: string;
  language: CodeWAModel;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  components?: any[];
}

export interface WADataresponseModel {
  messaging_product: string;
  to: string;
  type: string;
  template: TemplateWAModel;
}

export interface NotificationResponseModel {
  id: number;
  title: string;
  description: string;
  type: string;
  status: string;
  jobId: number;
  createdAt: Date;
  updatedAt: Date;
  resolvedBy?: string;
}

export interface UserTokenResponseModel {
  id: number;
  displayName: string;
  token: string;
}

export interface BrandTemplateResponseModel {
  id: number;
  name: string;
  description: string;
}

export interface MobileUserProfileResponseModel {
  id: number;
  displayName: string;
  email: string;
  contactNumber: string;
  role?: string;
  tenant?: string;
  countryCode?: string;
}

export interface MobileJobResponseModel {
  jobId: number;
  jobStatus: string;
  serviceType: string;
  startDateTime: Date;
  clientName: string;
  serviceAddress: string;
  doneJob: number;
  totalJob: number;
  remarks?: string;
  JobLabels?: JobLabelResponseModel[];
  postalCode?: string;
  signature?: string;
}

export interface ClientDocumentResponseModel {
  id: number;
  notes: string;
  documentUrl: string;
  isHide: boolean;
  clientId?: number;
}

export interface GstTemplateResponseModel {
  id: number;
  name: string;
  description?: string;
  tax: number;
  isDefault: boolean;
  isActive: boolean;
}

export interface InvoiceCsvResponseModel {
  invoiceNumber: string;
  clientName: string;
  invoiceTitle: string;
  invoiceDate: string;
  totalAmount: number;
  collectedAmount: number;
  invoiceStatus: string;
  entityName: string;
  customFieldLabel1?: string;
  customFieldValue1?: string;
  customFieldLabel2?: string;
  customFieldValue2?: string;
}

export interface ContractCsvResponseModel {
  id: number;
  clientName: string;
  contractTitle: string;
  contractType: string;
  startDate: string;
  endDate: string;
  createdDate: string;
  entity: string;
  contractAmount: number;
  invoiceNumber: string;
  paymentStatus: string;
  contractStatus: string;
  collectedAmount: number;
  outstandingAmount: number;
  customFieldLabel1?: string;
  customFieldValue1?: string;
  customFieldLabel2?: string;
  customFieldValue2?: string;
}

export interface InvoiceReponseModel {
  id: number;
  invoiceNumber: string;
  generatedDate: Date;
  clientName: string;
  clientId: number;
  termStart: Date;
  termEnd: Date;
  dueDate: string;
  contractTitle: string;
  contractId: number;
  invoiceAmount: number;
  collectedAmount: number;
  outstandingAmount: number;
  totalJob: number;
  remarks: string;
  invoiceStatus: string;
  createdBy: string;
  attnTo?: string;
}

export interface InvoiceDetailResponseModel {
  id: number;
  invoiceNumber: string;
  invoiceStatus: string;
  invoiceAmount: number;
  invoiceRemarks: string;
  termEnd: Date;
  dueDate: string;
  createdAt: Date;
  Client?: ClientResponseModel;
  Job?: Job[];
  contractId: number;
  contractAmount: number;
  contractDiscount: number;
  gstTax: number;
  gst: number;
  totalCollectedAmount: number;
  totalOutstandingAmount: number;
  InvoiceHistory?: InvoiceHistoryResponseModel[];
  newInvoice?: Date;
  updateInvoice?: Date;
  chequeNumber?: string;
  invoiceDate?: Date;
  attnTo?: string;
}

export interface InvoiceHistoryResponseModel {
  id: number;
  invoiceId: number;
  label: string;
  description: string;
  updatedBy: string;
}

export interface CollectedAmountHistoryResponseModel {
  id: number;
  serviceId?: number;
  invoiceId?: number;
  collectedBy: string;
  collectedAmount: number;
  paymentMetod?: string;
  createdAt?: Date;
  isDeleted?: boolean;
}

export interface UserProfileJobResponseModel {
  userProfileId: number;
  jobId: number;
}

export interface MobileServiceItemPriceBreakdown {
  contractAmount?: number;
  collectedAmount?: number;
  contractDiscount?: number;
  outstandingAmount?: number;
  collectedAmountHistory?: CollectedAmountHistoryResponseModel[];
  gstTax?: number;
  gstAmount?: number;
  additionalOutstandingAmount?: number;
  additionalTotalAmount?: number;
}

export interface CustomFieldResponseModel {
  id?: number;
  serviceId?: number;
  label: string;
  value: string;
}

export interface ServiceContactResponseModel {
  serviceId: number;
  contactPersonId: number;
}

export interface RoleGrantResponseModel {
  id: number;
  module: string;
  function: string;
  label: string;
  description: string;
  isMain: boolean;
  isActive: boolean;
}

export interface UserProfileRoleResponseModel {
  userProfileId: number;
  roleId: number;
}

export interface JobSmartRankingResponseModel {
  id: number;
  startDateTime: string;
  endDateTime: string;
  jobStatus: string;
  serviceAddress: string;
  postalCode: string;
}
