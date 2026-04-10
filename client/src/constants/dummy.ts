import { addDays, format } from 'date-fns';
import { ClientBody } from 'typings/body/ClientBody';
import { ServiceAddressBody } from 'typings/body/ServiceAddressBody';
import { JobNoteType, JobStatus, RepeatType, ServiceType } from './enum';
import { JobBody } from 'typings/body/JobBody';
import { ServiceBody } from 'typings/body/ServiceBody';
import { TimeOffBody } from 'typings/body/TimeOffBody';

export const dummySelect: Select = {
  id: 0,
  name: '',
  value: '',
  color: ''
};

export const dummyGlobalAppointment: CalendarGlobalAppointments = {
  index: 0,
  id: 0,
  title: '',
  clientName: '',
  serviceAddress: '',
  contactPerson: '',
  contactNumber: '',
  vehicleNo: '',
  employeesName: '',
  employees: [0],
  vehicles: [0],
  startDate: new Date(),
  endDate: new Date(),
  jobStatus: '',
  vehicleSelected: [],
  employeesSelected: []
};

export const dummySchedule: ScheduleModel = {
  id: 0,
  startDateTime: new Date(),
  endDateTime: new Date(),
  repeatType: RepeatType.ADHOC,
  repeatEvery: 1,
  repeatOnDate: 1,
  repeatOnDay: '',
  repeatOnWeek: 0,
  repeatOnMonth: 1,
  repeatEndType: 'AFTER',
  repeatEndAfter: 1,
  repeatEndOnDate: new Date(),
  ServiceItems: [],
  hour: 1,
  minute: 0,
  scheduleLabel: 'Set custom reccurence here'
};

export const dummyOldService: OldServiceModel = {
  id: 0,
  serviceType: 'ADHOC',
  serviceNumber: '0',
  serviceTitle: '',
  description: '',
  serviceStatus: '',
  needGST: false,
  termStart: format(new Date(), 'yyyy-MM-dd'),
  termEnd: format(new Date(), 'yyyy-MM-dd'),
  originalAmount: 0,
  discountType: 'NA',
  discountAmount: 0,
  gstAmount: 0,
  totalAmount: 0,
  remarks: '',
  termCondition: '',
  clientId: 0,
  serviceAddressId: 0,
  entityId: 0,
  Jobs: [],
  ServiceItems: [],
  Schedules: [],
  Skills: [],
  Checklists: [],
  JobLabels: [],
  isNextDay: false,
  holidaysDate: [],
  gstTax: 0,
  salesPerson: ''
};

export const dummySetting: SettingModel = {
  id: 0,
  label: '',
  code: '',
  value: '',
  isActive: false
};

export const dummyGeneralSettingInfo: GeneralSettingInfo = {
  activeTechnician: 0,
  activeAdmin: 0,
  activeVehicle: 0,
  agent: 0,
  client: 0
};

export const dummyTenantPlanDetail: TentantPlantDetail = {
  key: '',
  numberOfLicense: 0,
  subscriptExpDate: '',
  createdAt: '',
  planType: '',
  whatsappService: false
};

export const dummyResources: CalendarResourcesNew = {
  id: 0,
  title: 'UNASSIGNED JOBS',
  index: 0,
  eventColor: '#BDBDBD',
  eventTextColor: '#000000'
};

export const dummyJobNoteTemplate: JobNoteTemplateModel = {
  id: 0,
  notes: ''
};

export const dummyEquipments: EquipmentModel = {
  id: 0,
  brand: '',
  model: '',
  serialNumber: '',
  location: '',
  notes: '',
  dateWorkDone: new Date(),
  remarks: null,
  serviceAddressId: 0,
  updatedBy: '',
  address: '',
  displayName: '',
  isActive: true,
  isMain: true,
  description: '',
  warrantyStartDate: null,
  warrantyEndDate: null,
  clientId: 0,
  clientName: ''
};

export const dummyJobLabelTemplate: JobLabelTemplateModel = {
  id: 0,
  name: '',
  description: '',
  color: ''
};

export const dummyContactPerson: ContactPersonModel = {
  id: 0,
  clientId: 0,
  contactPerson: '',
  contactEmail: '',
  countryCode: '+65',
  contactNumber: '',
  country: 'Singapore',
  isMain: true
};

export const dummyClient: ClientModel = {
  id: 0,
  name: '',
  clientType: 'RESIDENTIAL',
  activeContract: '',
  totalAmount: '',
  agentName: '-',
  ContactPersons: [],
  ServiceAddresses: []
};

export const dummyClientDetail: ClientDetailsModel = {
  id: 0,
  name: '',
  clientType: '',
  billingAddress: '',
  billingFloorNo: '',
  billingUnitNo: '',
  billingPostal: '',
  needGST: true,
  remarks: '',
  emailReminder: false,
  whatsAppReminder: false,
  emailJobReport: false,
  ServiceAddresses: [],
  ContactPersons: [dummyContactPerson]
};

export const dummyBrandTemplate: BrandTemplateModel = {
  id: 0,
  name: '',
  description: ''
};

export const dummyInvoicesInfo: InvoiceInfoModel = {
  invoiceToday: 0,
  valueInvoiceToday: 0,
  invoiceThisWeek: 0,
  valueInvoiceThisWeek: 0,
  invoiceLastMonth: 0,
  valueInvoiceLastMonth: 0,
  unpaidInvoice: 0,
  valueUnpaidInvoice: 0
};

export const dummyContract: ServiceModel = {
  id: 0,
  contractId: '',
  clientId: 0,
  clientName: '',
  contactNumber: '',
  contractTitle: '',
  serviceAddress: '',
  postalCode: '',
  startDate: new Date(),
  endDate: new Date(),
  createdDate: new Date(),
  invoiceNo: '',
  amount: 0,
  entityId: 0,
  entity: '',
  completed: 0,
  totalJob: 0,
  additionalCompleted: 0,
  additionalTotalJob: 0,
  contractStatus: '',
  contractType: '',
  isRenewed: false,
  collectedAmount: 0
};

export const dummyContractDetail: ContractDetailsModel = {
  id: 0,
  serviceType: '',
  serviceTitle: '',
  serviceNumber: '',
  description: '',
  serviceStatus: '',
  needGST: true,
  termStart: new Date(),
  termEnd: new Date(),
  originalAmount: 0,
  gstAmount: 0,
  totalAmount: 0,
  remarks: '',
  termCondition: '',
  salesPerson: '',
  Client: {
    id: 0,
    name: '',
    country: '',
    billingAddress: '',
    billingFloorNo: '',
    billingUnitNo: '',
    billingPostal: '',
    needGST: false,
    remarks: ''
  },
  Entity: { id: 0, name: '', address: '', countryCode: '', contactNumber: '', logo: '', email: '', needGST: false },
  ServiceSkills: [],
  ServiceAddress: { id: 0, contactPerson: '', contactNumber: '', country: '', address: '', floorNo: '', unitNo: '', postalCode: '' },
  Schedules: [],
  Jobs: [
    { id: 0, jobStatus: 'UNASSIGNED', startDateTime: new Date(), endDateTime: new Date(), ChecklistJob: [], serviceItemsJob: [], JobLabels: [] }
  ],
  Invoice: []
};

export const dummyJobDetail: JobDetailModel = {
  jobId: 0,
  clientId: 0,
  clientName: '',
  clientRemarks: '',
  serviceId: 0,
  serviceName: '',
  jobStatus: JobStatus.UNASSIGNED,
  contactPerson: '',
  contactNumber: '',
  JobLabels: [],
  Skills: [],
  jobRemarks: '',
  signature: '',
  employees: [],
  selectedEmployees: [dummySelect],
  vehicles: [],
  selectedVehicles: [dummySelect],
  startDateTime: new Date(),
  endDateTime: new Date(),
  serviceAddressId: 0,
  serviceAddress: '',
  postalCode: '',
  ServiceItems: [],
  AdditionalServiceItems: [],
  JobChecklist: [],
  JobNotes: [],
  JobExpenses: [],
  JobHistories: [],
  needGST: false,
  jobAmount: 0,
  jobCollectedAmount: 0,
  jobDiscountAmount: 0,
  contractDiscountAmount: 0,
  gstTax: 0,
  defaultGst: 0,
  gstAmount: 0,
  totalAmount: 0,
  contractAmount: 0,
  contractCollectedAmount: 0,
  contractOutstandingAmount: 0,
  additionalServiceId: 0,
  additionalJobAmount: 0,
  additionalGstTax: 0,
  additionalGstAmount: 0,
  additionalDiscountAmount: 0,
  additionalTotalAmount: 0,
  additionalCollectedAmount: 0,
  additionalOutstandingAmount: 0,
  invoiceId: 0,
  invoiceNumber: '',
  invoiceStatus: '',
  paymentMethod: '',
  totalJob: 1,
  jobSequence: 1,
  chequeNumber: '',
  ContactPersons: []
};

export const dummyJobExpenses: JobExpensesModel = {
  id: 0,
  header: '',
  remarks: '',
  jobId: 0,
  serviceId: 0,
  totalExpenses: 0,
  JobExpensesItems: []
};

export const dummyJobExpensesItem: JobExpensesItemsModel = {
  id: 0,
  jobExpensesId: 0,
  itemName: '',
  price: 0,
  remarks: ''
};

export const dummyHeaderTable: HeaderTable = {
  id: 'id',
  label: 'id'
};

export const dummyEntity: EntityModel = {
  id: 0,
  name: '',
  address: '',
  logo: '',
  countryCode: '+65',
  contactNumber: '',
  email: '',
  needGST: false,
  qrImage: '',
  registerNumberGST: 'N.A',
  uenNumber: 'N.A',
  invoiceFooter: ''
};

export const dummyInvoice: InvoicesModel = {
  id: 0,
  invoiceNumber: '',
  generatedDate: new Date(),
  clientName: '',
  clientId: 0,
  termStart: new Date(),
  termEnd: new Date(),
  contractTitle: '',
  contractId: 0,
  invoiceAmount: 0,
  collectedAmount: 0,
  outstandingAmount: 0,
  invoiceStatus: '',
  paymentMethod: '',
  createdAt: new Date(),
  createdBy: '',
  serviceId: 0,
  // Service: { id: 0, serviceTitle: '', clientId: 0, Client: { id: 0, name: '' } },
  remarks: '',
  totalJob: 0
};

export const dummyInvoiceJob: InvoiceJobModel = {
  id: 0,
  startDateTime: new Date(),
  serviceItemsJob: [],
  totalServiceItem: 0,
  jobStatus: '',
  jobAmount: 0,
  collectedAmount: 0,
  collectedBy: '',
  paymentMethod: '',
  chequeNumber: ''
};

export const dummyInvoiceDetail: InvoiceDetailModel = {
  id: 0,
  invoiceNumber: '',
  invoiceStatus: 'UNPAID',
  invoiceAmount: 0,
  invoiceRemarks: '',
  termEnd: '',
  dueDate: 'Due on Receipt',
  salesPerson: '',
  createdAt: new Date(),
  invoiceDate: new Date(),
  contractId: 0,
  contractAmount: 0,
  contractDiscount: 0,
  gstTax: 0,
  gst: 0,
  totalCollectedAmount: 0,
  totalOutstandingAmount: 0,
  Client: dummyClientDetail,
  Entity: dummyEntity,
  Job: [dummyInvoiceJob],
  InvoiceHistory: []
};

//new
export const dummyServiceAddressBody: ServiceAddressBody = {
  id: 0,
  contactPerson: '',
  countryCode: '+65',
  contactNumber: '',
  secondaryContactPerson: '',
  secondaryContactNumber: '',
  country: '',
  address: '',
  floorNo: '',
  unitNo: '',
  postalCode: '',
  clientId: 0
};

export const dummyAdditionalContact: AdditionalContactPersonModel = {
  id: 0,
  clientId: 0,
  contactPerson: '',
  countryCode: '+65',
  contactNumber: '',
  contactEmail: '',
  description: ''
};

export const dummyClientBody: ClientBody = {
  name: '',
  clientType: 'RESIDENTIAL',
  billingAddress: '',
  billingFloorNo: '',
  billingUnitNo: '',
  billingPostal: '',
  remarks: '',
  emailReminder: false,
  whatsAppReminder: false,
  emailJobReport: false,
  priceReportVisibility: false,
  agentId: 0,
  agentName: '',
  idQboWithGST: 0,
  idQboWithoutGST: 0,
  ContactPersons: [dummyContactPerson],
  ServiceAddresses: [dummyServiceAddressBody]
};

export const dummyServiceDetailBody: ServiceDetailModel = {
  id: 0,
  serviceType: 'ADHOC',
  serviceNumber: '',
  serviceTitle: '',
  description: '',
  termCondition: '',
  serviceStatus: 'PENDING',
  needGST: false,
  issueDate: new Date(),
  expiryDate: new Date(),
  termStart: new Date(),
  termEnd: new Date(),
  contractAmount: 0,
  contractDiscount: 0,
  totalAmount: 0,
  gstAmount: 0,
  grandTotal: 0,
  remarks: '',
  gstTax: 0,
  salesPerson: '',
  clientId: 0,
  clientName: '',
  clientType: 'RESIDENTIAL',
  clientAgent: '',
  clientRemarks: '',
  invoiceNumber: '',
  invoiceId: 0,
  invoiceStatus: '',
  serviceAddressId: 0,
  serviceAddress: '',
  postalCode: '',
  billingAddress: '',
  billingPostalCode: '',
  entityId: 0,
  entityName: '',
  skills: [],
  Jobs: [],
  CustomFields: []
};

export const dummyJobsInfo: JobInfoModel = {
  jobsToday: { value: 0, count: 0 },
  jobsThisWeek: { value: 0, count: 0 },
  jobsUnAssignedToday: { count: 0 },
  jobsUnAssignedThisWeek: { count: 0 }
};

export const dummyJob: JobModel = {
  jobId: 0,
  clientId: 0,
  serviceId: 0,
  additionalServiceId: 0,
  clientName: '',
  serviceName: '',
  invoiceNumber: '',
  serviceAddress: '',
  postalCode: '',
  jobSequence: 0,
  totalJob: 0,
  startDateTime: new Date(),
  endDateTime: new Date(),
  serviceType: 'ADHOC',
  jobAmount: 0,
  collectedAmount: 0,
  totalServiceAmount: 0,
  paymentMethod: '',
  employees: [],
  vehicles: [],
  jobStatus: '',
  jobLabels: [],
  ServiceItem: [],
  AdditionalServiceItem: []
};

export const dummyJobBody: JobBody = {
  jobId: 0,
  jobStatus: JobStatus.UNASSIGNED,
  clientName: '',
  serviceAddress: '',
  postalCode: '',
  selectedEmployees: [],
  selectedVehicles: [],
  startDateTime: new Date(),
  endDateTime: new Date(),
  JobLabels: [],
  remarks: '',
  Skills: []
};

export const dummyJobNote: JobNoteModel = {
  id: 0,
  notes: '',
  imageUrl: '',
  isHide: false,
  jobId: 0,
  jobNoteType: JobNoteType.GENERAL,
  fileType: '',
  imageBucket: '',
  createdAt: new Date(),
  displayName: '',
  JobNoteMedia: []
};

export const dummyChecklist: JobChecklistModel = {
  id: 0,
  name: '',
  description: '',
  remarks: '',
  ChecklistItems: []
};

export const dummyServiceItem: ServiceItemModel = {
  id: 0,
  name: '',
  description: '',
  quantity: 1,
  unitPrice: 0,
  totalPrice: 0,
  discountAmt: 0,
  serviceId: 0,
  scheduleId: 0,
  idQboWithGST: 0,
  IdQboWithoutGST: 0,
  Equipments: []
};

export const dummyCustomField: CustomFieldModel = {
  id: 0,
  label: '',
  value: ''
};

export const dummyService: ServiceBody = {
  id: 0,
  serviceType: ServiceType.ADHOC,
  serviceNumber: '',
  serviceTitle: '',
  description: '',
  serviceStatus: 'PENDING',
  issueDate: new Date(),
  expiryDate: addDays(new Date(), 30),
  needGST: false,
  termStart: new Date(),
  termEnd: new Date(),
  contractAmount: 0,
  discountType: 'NA',
  discountAmount: 0,
  gstTax: 0,
  gstAmount: 0,
  totalAmount: 0,
  remarks: '',
  termCondition: '',
  clientId: 0,
  serviceAddressId: 0,
  serviceAddress: '',
  entityId: 0,
  entityName: '',
  isJobCompleted: false,
  totalJob: 0,
  isRenewed: false,
  renewalServiceId: 0,
  salesPerson: '',
  skills: [],
  JobLabels: [],
  Checklists: [],
  Schedules: [dummySchedule],
  CustomFields: [dummyCustomField],
  ContactPersons: []
};

export const dummyUser: UserDetailsModel = {
  id: 0,
  roleId: 2,
  role: 'TECHNICIAN',
  displayName: '',
  password: '',
  email: '',
  countryCode: '+65',
  contactNumber: '',
  userSkills: [],
  active: true,
  lock: false,
  token: ''
};

export const dummyVehicle: VehicleModel = {
  id: 0,
  model: '',
  carplateNumber: '',
  coeExpiryDate: new Date(),
  vehicleStatus: true,
  employeeInCharge: 0
};

export const dummyAgent: AgentsModel = {
  id: 0,
  name: '',
  description: ''
};

export const dummySkill: SkillsModel = {
  id: 0,
  name: '',
  description: ''
};

export const dummyServiceItemTemplate: ServiceItemTemplatesModel = {
  id: 0,
  name: '',
  description: '',
  unitPrice: 0
};

export const dummyServiceTemplate: ServiceTemplatesModel = {
  id: 0,
  name: '',
  description: '',
  termCondition: ''
};

export const dummyChecklistTemplate: ChecklistTemplateModel = {
  id: 0,
  name: '',
  description: '',
  ChecklistItems: []
};

export const dummyAppLog: AppLogModel = {
  id: 0,
  user: '',
  description: '',
  createdAt: new Date()
};

export const dummyJobColumn: any[] = [
  {
    field: 'id',
    name: 'ID & Job Sequence',
    isVisible: true,
    isDisabled: true
  },
  {
    field: 'clientName',
    name: 'Client Name',
    isVisible: true,
    isDisabled: true
  },
  {
    field: 'contract',
    name: 'Contract & Invoice',
    isVisible: true,
    isDisabled: false
  },
  {
    field: 'serviceAddress',
    name: 'Service Address',
    isVisible: true,
    isDisabled: true
  },
  {
    field: 'startDateTime',
    name: 'Start Date & Time',
    isVisible: true,
    isDisabled: true
  },
  {
    field: 'serviceType',
    name: 'Job Type',
    isVisible: true,
    isDisabled: false
  },
  {
    field: 'jobAmount',
    name: 'Job Amount',
    isVisible: true,
    isDisabled: false
  },
  {
    field: 'collectedAmount',
    name: 'Collected Amount',
    isVisible: true,
    isDisabled: false
  },
  {
    field: 'paymentMethod',
    name: 'Payment Method',
    isVisible: true,
    isDisabled: false
  },
  {
    field: 'vehicleNo',
    name: 'Vehicle No.',
    isVisible: true,
    isDisabled: false
  },
  {
    field: 'employee',
    name: 'Employee',
    isVisible: true,
    isDisabled: false
  },
  {
    field: 'jobLabels',
    name: 'Job Labels',
    isVisible: true,
    isDisabled: false
  }
];

export const dummyServiceColumn: any[] = [
  {
    field: 'id',
    name: 'Contract Title & ID',
    isVisible: true,
    isDisabled: true
  },
  {
    field: 'clientName',
    name: 'Client & Entity Name',
    isVisible: true,
    isDisabled: true
  },
  {
    field: 'serviceAddress',
    name: 'Service Address',
    isVisible: true,
    isDisabled: false
  },
  {
    field: 'term',
    name: 'Contract Term',
    isVisible: true,
    isDisabled: false
  },
  {
    field: 'contractType',
    name: 'Contract Type',
    isVisible: true,
    isDisabled: true
  },
  {
    field: 'contractStatus',
    name: 'Contract Status',
    isVisible: true,
    isDisabled: false
  },
  {
    field: 'contractProgress',
    name: 'Contract Progress',
    isVisible: true,
    isDisabled: false
  },
  {
    field: 'invoiceNo',
    name: 'Invoice Number',
    isVisible: true,
    isDisabled: true
  },
  {
    field: 'contractAmount',
    name: 'Contract Amount',
    isVisible: true,
    isDisabled: true
  },
  {
    field: 'collectedAmount',
    name: 'Collected Amount',
    isVisible: true,
    isDisabled: false
  }
];

export const dummyInvoiceColumn: any[] = [
  {
    field: 'invoiceNumber',
    name: 'Invoice Number',
    isVisible: true,
    isDisabled: true
  },
  {
    field: 'generate',
    name: 'Generated Date & Time',
    isVisible: true,
    isDisabled: false
  },
  {
    field: 'clientName',
    name: 'Client Name',
    isVisible: true,
    isDisabled: true
  },
  {
    field: 'contractTitle',
    name: 'Contract Title',
    isVisible: true,
    isDisabled: false
  },
  {
    field: 'term',
    name: 'Term',
    isVisible: true,
    isDisabled: false
  },
  {
    field: 'invoiceAmount',
    name: 'Invoice Amount',
    isVisible: true,
    isDisabled: true
  },
  {
    field: 'amountCollected',
    name: 'Amount Collected',
    isVisible: true,
    isDisabled: true
  },
  {
    field: 'outstandingAmount',
    name: 'Outstanding Amount',
    isVisible: true,
    isDisabled: true
  },
  {
    field: 'invoiceStatus',
    name: 'Invoice Status',
    isVisible: true,
    isDisabled: true
  },
  {
    field: 'totalJob',
    name: 'Total Job',
    isVisible: true,
    isDisabled: false
  }
];

export const dummyClientColumn: any[] = [
  {
    field: 'clientName',
    name: 'Client Name',
    isVisible: true,
    isDisabled: true
  },
  {
    field: 'clientType',
    name: 'Client Type',
    isVisible: true,
    isDisabled: false
  },
  {
    field: 'serviceAddress',
    name: 'Service Address',
    isVisible: true,
    isDisabled: true
  },
  {
    field: 'contactPerson',
    name: 'Contact Person',
    isVisible: true,
    isDisabled: true
  },
  {
    field: 'agent',
    name: 'Agent Name',
    isVisible: true,
    isDisabled: false
  },
  {
    field: 'activeContract',
    name: 'Active Contract',
    isVisible: true,
    isDisabled: false
  },
  {
    field: 'totalContractAmount',
    name: 'Contract Amount',
    isVisible: true,
    isDisabled: false
  }
];

export const dummyEquipmentColumn: any[] = [
  { field: 'id', name: 'ID', isVisible: true, isDisabled: true, sort: true },
  { field: 'Name', name: 'Name/Description', isVisible: true, isDisabled: false, sort: true },
  { field: 'clientName', name: 'Client & Service Address', isVisible: true, isDisabled: true, sort: false },
  { field: 'location', name: 'Location', isVisible: true, isDisabled: true, sort: false },
  { field: 'brand', name: 'Brand', isVisible: true, isDisabled: true, sort: true },
  { field: 'model', name: 'Model', isVisible: true, isDisabled: false, sort: false },
  { field: 'serialNumber', name: 'Serial Number', isVisible: true, isDisabled: false, sort: false },
  { field: 'workDate', name: 'Last Work Date', isVisible: true, isDisabled: true, sort: false },
  { field: 'createdDate', name: 'Created Date', isVisible: true, isDisabled: true, sort: false },
  { field: 'warrantyDate', name: 'Warranty Date', isVisible: true, isDisabled: false, sort: false },
  { field: 'status', name: 'Status', isVisible: true, isDisabled: true, sort: false }
];

export const dummyJobEvent = {
  index: 0,
  title: '',
  start: new Date(),
  end: new Date(),
  resourceIds: ['0'],
  color: '#ffffff',
  textColor: '#000000',
  jobId: 0,
  jobSequence: '',
  clientName: '',
  contactPerson: '',
  contactNumber: '',
  serviceAddress: '',
  postalCode: '',
  contract: '',
  remarks: '',
  employees: '-',
  vehicles: '-',
  jobStatus: '',
  vehicleSelected: [],
  employeesSelected: [],
  jobLabels: [],
  serviceItems: '-',
  resourceEditable: false
};

export const dummyTimeOff: TimeOffBody = {
  id: 0,
  status: '',
  remarks: null,
  startDateTime: new Date(),
  endDateTime: new Date(),
  Employees: []
};

export const dummySecurityRoles: SecurityRolesModel = {
  id: 0,
  name: '',
  description: '',
  isEdited: false
};

export const dummyRoleGrants: RoleGrantModel[] = [
  {
    id: 1,
    module: 'JOBS',
    function: 'ACCESS',
    label: 'Jobs Page',
    description: 'Granting Access to the Job Page.',
    isMain: true,
    isActive: true
  },
  {
    id: 2,
    module: 'JOBS',
    function: 'EXPORT',
    label: 'Export Job Data',
    description: 'Granting access to export data from the job page.',
    isMain: false,
    isActive: false
  },
  {
    id: 3,
    module: 'QUOTATIONS',
    function: 'ACCESS',
    label: 'Quotations Page',
    description: 'Granting Access to the Quotations Page.',
    isMain: true,
    isActive: true
  },
  {
    id: 4,
    module: 'QUOTATIONS',
    function: 'DELETE',
    label: 'Delete Quotation',
    description: 'Granting access to deleting quotation data from the quotation page.',
    isMain: false,
    isActive: true
  },
  {
    id: 5,
    module: 'INVOICES',
    function: 'ACCESS',
    label: 'Invoices Page',
    description: 'Granting Access to the Invoices Page.',
    isMain: true,
    isActive: false
  },
  {
    id: 6,
    module: 'INVOICES',
    function: 'EXPORT',
    label: 'Export Invoice Data',
    description: 'Granting access to export data from the invoice page.',
    isMain: false,
    isActive: false
  },
  {
    id: 7,
    module: 'INVOICES',
    function: 'DELETE',
    label: 'Delete Invoice',
    description: 'Granting access to deleting invoice data from the invoice page.',
    isMain: false,
    isActive: false
  },
  {
    id: 8,
    module: 'SCHEDULES',
    function: 'ACCESS',
    label: 'Schedules Page',
    description: 'Granting Access to the Schedules Page.',
    isMain: true,
    isActive: true
  },
  {
    id: 9,
    module: 'CLIENTS',
    function: 'ACCESS',
    label: 'Clients Page',
    description: 'Granting Access to the Clients Page.',
    isMain: true,
    isActive: true
  },
  {
    id: 10,
    module: 'CLIENTS',
    function: 'DELETE',
    label: 'Delete Client',
    description: 'Granting access to deleting client data from the client page.',
    isMain: false,
    isActive: true
  },
  {
    id: 11,
    module: 'ANALYTICS',
    function: 'ACCESS',
    label: 'Analytics Page',
    description: 'Granting Access to the Analytics Page.',
    isMain: true,
    isActive: true
  },
  {
    id: 12,
    module: 'SETTINGS',
    function: 'ACCESS',
    label: 'Settings Page',
    description: 'Granting Access to the Settings Page.',
    isMain: true,
    isActive: true
  },
  {
    id: 13,
    module: 'EQUIPMENTS',
    function: 'ACCESS',
    label: 'Equipment Page',
    description: 'Granting Access to the Equipment Page.',
    isMain: true,
    isActive: true
  },
  {
    id: 14,
    module: 'EQUIPMENTS',
    function: 'EXPORT',
    label: 'Export Equipment Data',
    description: 'Granting access to export data from the equipment page.',
    isMain: false,
    isActive: false
  },
  {
    id: 15,
    module: 'EQUIPMENTS',
    function: 'DELETE',
    label: 'Delete Equipment',
    description: 'Granting access to deleting equipment data from the equipment page.',
    isMain: false,
    isActive: false
  }
];

export const dummyInformationContent: InformationContentModel[] = Array.from({ length: 4 }, () => ({
  header: '',
  value: 0,
  isPrice: false
}));

export const dummyInvoiceOption: { [key: string]: string } = { headerOptionId: '1', clientInfoOptionId: '1', tableOptionId: '1', tncOptionId: '1' };

export const dummyQuotationOption: { [key: string]: string } = {
  headerOptionId: '1',
  clientInfoOptionId: '1',
  tableOptionId: '1',
  tncOptionId: '1',
  signatureOptionId: '1'
};

export const dummyBookingSetting = {
  BusinessName: '',
  Logo: '',
  LogoUrl: '',
  Instructions: '',
  LimitTimeSlot: '1',
  TimeSlots: ['08:00'],
  WorkingDays: 'monday to saturday',
  IncludePublicHoliday: false,
  TimeSlotsHoliday: ['08:00']
};
