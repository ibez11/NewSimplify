import { getEquipmentByServiceAddressId } from '../../services/EquipmentService';
import { getHistoryByServiceId } from '../../services/CollectedAmountHistoryService';
import {
  CollectedAmountHistoryResponseModel,
  ContactPersonResponseModel,
  JobResponseModel,
  MobileServiceItemPriceBreakdown
} from '../ResponseFormats';
import { JobBody, SyncJobBody } from '../body/JobBody';
import lodash from 'lodash';
import * as GstTemplateService from '../../services/GstTemplateService';
import * as JobNoteService from '../../services/JobNoteService';
import EquipmentAttributes from './EquipmentAttributes';
import _ from 'lodash';

interface JobAttributes {
  toResponseWeb: (param: JobResponseModel) => JobBody;
  toResponseMobile: (param: JobResponseModel) => Promise<JobBody>; // for mobile job detail response format
  toResponseAdminMobile: (param: JobResponseModel) => Promise<JobBody>; // for admin on mobile job detail response format
  serviceItemPriceBreakdown: (param: JobResponseModel) => Promise<JobBody>; // for mobile service item price breakdown response format
  editJobServiceItem: (param: JobResponseModel) => Promise<JobBody>; // for mobile edit service item response format
  additionalItemResponse: (param: JobResponseModel) => Promise<JobBody>; // for mobile create additional item response format,
  sycnJob: (param: JobResponseModel) => Promise<SyncJobBody>; // for sync job response format
  previousJobsByClientId: (param: JobResponseModel) => Promise<JobBody>;
  getAll: string[];
}

const JobAttributes: JobAttributes = {
  toResponseWeb: (param: JobResponseModel): JobBody => {
    const contact = param.ContactPerson.find(contact => contact.isMain === true);
    return {
      id: param.jobId,
      jobId: param.jobId,
      clientId: param.clientId,
      clientName: param.clientName,
      clientRemarks: param.clientRemarks,
      serviceId: param.serviceId,
      serviceName: param.serviceName,
      serviceStatus: param.serviceStatus,
      jobStatus: param.jobStatus,
      needGST: param.needGST,
      contactPerson: contact.contactPerson,
      contactNumber: `${contact.countryCode}${contact.contactNumber}`,
      JobLabels: param.jobLabels ? param.jobLabels : [],
      Skills: param.ServiceSkills ? param.ServiceSkills.map(val => val.skill) : [],
      jobRemarks: param.remarks,
      signature: param.signatureUrl,
      employees: param.employee ? param.employee.map(val => val.displayName) : [],
      selectedEmployees: param.employee
        ? param.employee.map(val => {
            return { id: val.id, name: val.displayName };
          })
        : [],
      vehicles: param.vehicleJobs ? param.vehicleJobs.map(val => val.carplateNumber) : [],
      selectedVehicles: param.vehicleJobs
        ? param.vehicleJobs.map(val => {
            return { id: val.id, name: val.carplateNumber };
          })
        : [],
      startDateTime: param.startDateTime,
      endDateTime: param.endDateTime,
      serviceAddressId: param.serviceAddressId,
      serviceAddress: param.serviceAddress,
      postalCode: param.postalCode,
      ServiceItems: param.ServiceItem.sort((a, b) => a.id - b.id),
      AdditionalServiceItems: param.AdditionalServiceItem && param.AdditionalServiceItem.sort((a, b) => a.id - b.id),
      JobChecklist: param.ChecklistJob,
      JobDocuments: param.jobDocuments,
      JobNotes: param.jobNotes,
      JobExpenses: param.JobExpenses,
      JobHistories: param.jobHistories,
      jobAmount: param.jobAmount || 0,
      jobDiscountAmount: param.jobDiscountAmount || 0,
      contractDiscount: param.discountAmount || 0,
      gstTax: param.gstTax,
      defaultGst: param.defaultGst || 0,
      gstAmount: param.jobGstAmount || 0,
      totalAmount: param.jobAmount - param.jobDiscountAmount + param.jobGstAmount,
      jobCollectedAmount: param.collectedAmount,
      contractCollectedAmount: param.totalCollectedAmountContract,
      contractOutstandingAmount: param.outstandingContract,
      additionalServiceId: param.additionalServiceId,
      additionalJobAmount: param.additionalAmount,
      additionalDiscountAmount: param.additionalDiscountAmount || 0,
      additionalGstTax: param.additionalGstTax,
      additionalGstAmount: param.additionalGstAmount,
      additionalTotalAmount: param.additionalTotalAmount,
      additionalCollectedAmount: param.additionalCollectedAmount || 0,
      additionalOutstandingAmount: param.additionalOutstandingAmount || 0,
      invoiceId: param.invoiceId || null,
      invoiceNumber: param.invoiceNumber || null,
      invoiceStatus: param.invoiceStatus || null,
      paymentMethod: param.paymentMethod,
      totalJob: param.totalJob || 1,
      jobSequence: param.jobSequence || 1,
      contractAmount: param.totalAmountService,
      chequeNumber: param.chequeNumber,
      entityName: param.entityName || '',
      ContactPersons: param.ContactPerson
    };
  },

  toResponseMobile: async (param: JobResponseModel): Promise<JobBody> => {
    const equipments = await getEquipmentByServiceAddressId(param.serviceAddressId);
    const { count: equipmentCount } = await EquipmentAttributes.getCountEquipmentByServiceAddressIdMobile(equipments);
    const generalNotes = param.jobNotes ? param.jobNotes.filter(val => val.jobNoteType === 'GENERAL') : [];
    const equipmentNotes = param.jobNotes ? param.jobNotes.filter(val => val.jobNoteType === 'EQUIPMENT') : [];

    const currentNotesCount = await JobNoteService.getCountNotesByQuery(param.jobId, null);
    const previousNotesCount = await JobNoteService.getCountPreviousJobNotesByClientId(param.jobId);

    const defaultGst = await GstTemplateService.getDefaultGst();

    const contacts: ContactPersonResponseModel[] = [];
    // const contact = param.ContactPerson.find(contact => contact.isMain === true);

    if (param.ContactPerson) {
      param.ContactPerson.map(val => {
        contacts.push({
          contactPerson: val.contactPerson,
          contactNumber: val.countryCode + val.contactNumber,
          contactEmail: val.contactEmail
        });
      });
    }

    const checklistJobs = lodash.map(param.ChecklistJob, items => lodash.omit(items, 'ChecklistItems'));

    return {
      jobId: param.jobId,
      serviceType: param.serviceType,
      clientName: param.clientName,
      serviceAddress: param.serviceAddress,
      jobStatus: param.jobStatus,
      remarks: param.remarks ? param.remarks : '',
      clientRemarks: param.clientRemarks ? param.clientRemarks : '',
      JobDocuments: param.jobDocuments,
      ContactPersons: contacts,
      postalCode: param.postalCode,
      serviceName: param.serviceName,
      priceVisibility: param.priceVisibility,
      invoiceNumber: param.invoiceNumber,
      AdditionalServiceItems: param.AdditionalServiceItem,
      needGST: param.needGST,
      ChecklistJobs: checklistJobs,
      additionalServiceId: param.additionalServiceId,
      additionalServiceTitle: param.additionalServiceTitle,
      clientId: param.clientId,
      serviceAddressId: param.serviceAddressId,
      entityName: param.entityName,
      entityAddress: param.entityAddress,
      entityContactNumber: param.entityContactNumber,
      entityEmail: param.entityEmail,
      serviceId: param.serviceId,
      collectedAmount: param.collectedAmount,
      signatureUrl: param.signatureUrl,
      paynowQrcode: param.paynowQrcode,
      JobLabels: param.jobLabels,
      discountAmount: param.discountAmount,
      additionalDiscountAmount: param.additionalDiscountAmount,
      additionalOutstandingAmount: param.additionalOutstandingAmount,
      additionalCollectedAmount: param.additionalCollectedAmount,
      additionalTotalAmount: param.additionalTotalAmount,
      additionalGstAmount: param.additionalGstAmount,
      additionalAmount: param.additionalAmount,
      outstandingContract: param.outstandingContract,
      gstTax: param.needGST ? defaultGst.tax : 0,
      startDateTime: param.startDateTimeMobile,
      endDateTime: param.endDateTimeMobile,
      ServiceSkills: param.ServiceSkills ? param.ServiceSkills.map(val => val.skill) : null,
      employees: param.employee ? param.employee.map(val => val.displayName) : null,
      vehicleNumbers: param.vehicleJobs ? param.vehicleJobs.map(val => val.carplateNumber) : null,
      ServiceItems: param.ServiceItem ? param.ServiceItem : [],
      expensesCount: param.JobExpenses ? param.JobExpenses.length : 0,
      equipmentsCount: equipments ? equipmentCount : 0,
      generalNotesCount: generalNotes.length,
      equipmentNotesCount: equipmentNotes.length,
      jobSequence: param.jobSequence || 1,
      totalJob: param.totalJob,
      signature: param.signature ? param.signature : '',
      currentNotesCount: currentNotesCount,
      previousNotesCount: previousNotesCount,
      callClientPermission: param.callClientPermission
    };
  },

  toResponseAdminMobile: async (param: JobResponseModel): Promise<JobBody> => {
    const equipments = await getEquipmentByServiceAddressId(param.serviceAddressId);
    const { count: equipmentCount } = await EquipmentAttributes.getCountEquipmentByServiceAddressIdMobile(equipments);

    const defaultGst = await GstTemplateService.getDefaultGst();

    const contacts: ContactPersonResponseModel[] = [];
    // const contact = param.ContactPerson.find(contact => contact.isMain === true);

    if (param.ContactPerson) {
      param.ContactPerson.map(val => {
        contacts.push({
          contactPerson: val.contactPerson,
          contactNumber: val.countryCode + val.contactNumber,
          contactEmail: val.contactEmail
        });
      });
    }

    const previousNotesCount = await JobNoteService.getCountPreviousJobNotesByClientId(param.jobId);

    const checklistJobs = lodash.map(param.ChecklistJob, items => lodash.omit(items, 'ChecklistItems'));

    return {
      jobId: param.jobId,
      serviceType: param.serviceType,
      clientName: param.clientName,
      serviceAddress: param.serviceAddress,
      jobStatus: param.jobStatus,
      remarks: param.remarks ? param.remarks : '',
      clientRemarks: param.clientRemarks ? param.clientRemarks : '',
      JobDocuments: param.jobDocuments,
      ContactPersons: contacts,
      postalCode: param.postalCode,
      serviceName: param.serviceName,
      priceVisibility: param.priceVisibility,
      invoiceNumber: param.invoiceNumber,
      AdditionalServiceItems: param.AdditionalServiceItem,
      needGST: param.needGST,
      ChecklistJobs: checklistJobs,
      additionalServiceId: param.additionalServiceId,
      additionalServiceTitle: param.additionalServiceTitle,
      clientId: param.clientId,
      serviceAddressId: param.serviceAddressId,
      entityName: param.entityName,
      entityAddress: param.entityAddress,
      entityContactNumber: param.entityContactNumber,
      entityEmail: param.entityEmail,
      serviceId: param.serviceId,
      collectedAmount: param.collectedAmount,
      signatureUrl: param.signatureUrl,
      paynowQrcode: param.paynowQrcode,
      JobLabels: param.jobLabels,
      discountAmount: param.discountAmount,
      additionalDiscountAmount: param.additionalDiscountAmount,
      additionalOutstandingAmount: param.additionalOutstandingAmount,
      additionalCollectedAmount: param.additionalCollectedAmount,
      additionalTotalAmount: param.additionalTotalAmount,
      additionalGstAmount: param.additionalGstAmount,
      additionalAmount: param.additionalAmount,
      outstandingContract: param.outstandingContract,
      gstTax: param.needGST ? defaultGst.tax : 0,
      startDateTime: param.startDateTimeMobile,
      endDateTime: param.endDateTimeMobile,
      ServiceSkills: param.ServiceSkills ? param.ServiceSkills.map(val => val.skill) : null,
      Employees: param.employee ? param.employee.map(val => _.pick(val, ['id', 'displayName', 'countryCode', 'contactNumber'])) : null,
      Vehicles: param.vehicleJobs ? param.vehicleJobs.map(val => _.pick(val, ['id', 'carplateNumber'])) : null,
      ServiceItems: param.ServiceItem ? param.ServiceItem : [],
      expensesCount: param.JobExpenses ? param.JobExpenses.length : 0,
      equipmentsCount: equipments ? equipmentCount : 0,
      jobSequence: param.jobSequence || 1,
      totalJob: param.totalJob,
      signature: param.signature ? param.signature : '',
      previousNotesCount: previousNotesCount,
      callClientPermission: param.callClientPermission
    };
  },

  serviceItemPriceBreakdown: async (param: JobResponseModel): Promise<JobBody> => {
    const histories = await getHistoryByServiceId(param.serviceId);
    const collectedAmountHistory: CollectedAmountHistoryResponseModel[] = [];
    let contractCollectedAmount = 0;
    if (histories) {
      histories.map(history => {
        collectedAmountHistory.push({
          id: history.id,
          collectedBy: history.collectedBy,
          collectedAmount: history.collectedAmount,
          paymentMetod: (history.paymentMethod && history.paymentMethod.toUpperCase()) || null,
          createdAt: new Date(history.createdAt)
        });
        contractCollectedAmount += history.collectedAmount;
      });
    }

    const serviceContract: MobileServiceItemPriceBreakdown = {
      contractAmount: param.totalAmountService,
      collectedAmount: param.totalCollectedAmountContract,
      outstandingAmount: param.outstandingContract,
      collectedAmountHistory: collectedAmountHistory.sort((a, b) => b.id - a.id)
    };

    let separateContract: MobileServiceItemPriceBreakdown = null;
    if (param.additionalServiceId) {
      separateContract = {
        contractAmount: param.additionalAmount,
        contractDiscount: param.additionalDiscountAmount,
        gstTax: param.additionalGstTax,
        gstAmount: param.additionalGstAmount,
        additionalOutstandingAmount: param.additionalOutstandingAmount,
        additionalTotalAmount: param.additionalTotalAmount
      };
    }

    return {
      CurrentContract: serviceContract,
      SeparateContract: separateContract
    };
  },

  editJobServiceItem: async (param: JobResponseModel): Promise<JobBody> => {
    return {
      ServiceItems: param.ServiceItem,
      outstandingContract: param.outstandingContract
    };
  },

  additionalItemResponse: async (param: JobResponseModel): Promise<JobBody> => {
    return {
      additionalServiceId: param.additionalServiceId,
      ServiceItems: param.AdditionalServiceItem,
      additionalDiscountAmount: param.additionalDiscountAmount,
      additionalOutstandingAmount: param.additionalOutstandingAmount
    };
  },

  sycnJob: async (param: JobResponseModel): Promise<SyncJobBody> => {
    const firstName = param.clientName ? param.clientName.split(' ')[0] : '-';
    const lastName = param.clientName ? param.clientName.split(' ')[1] : '-';

    return {
      id: `${param.jobId}-${new Date(param.updatedAt).getTime()}`,
      jobId: param.jobId,
      firstName: firstName,
      lastName: lastName,
      contactNumber: param.countryCode + param.contactNumber,
      contactEmail: param.contactEmail,
      jobStatus: param.jobStatus,
      startDateTime: param.startDateTime,
      endDateTime: param.endDateTime,
      ServiceItems: param.ServiceItem,
      employeeId: param.employeeId,
      syncId: param.syncId,
      employeeSyncId: param.employeeSyncId,
      remarks: param.remarks
    };
  },

  previousJobsByClientId: async (param: JobResponseModel): Promise<JobBody> => {
    console.log('param previousJobsByClientId', param);
    return {
      jobId: param.jobId,
      jobStatus: param.jobStatus,
      startDateTime: param.startDateTime,
      collectedAmount: param.collectedAmount,
      paymentMethod: param.paymentMethod,
      totalAmount: param.totalAmountService,
      serviceName: param.serviceName,
      serviceType: param.serviceType,
      ServiceItems: param.ServiceItem,
      employees: param.employees
    };
  },

  getAll: [
    'id',
    'jobId',
    'clientName',
    'serviceName',
    'invoiceId',
    'invoiceNumber',
    'invoiceStatus',
    'serviceAddress',
    'postalCode',
    'jobSequence',
    'totalJob',
    'startDateTime',
    'endDateTime',
    'endDateTime',
    'serviceType',
    'jobAmount',
    'collectedAmount',
    'totalServiceAmount',
    'paymentMethod',
    'employees',
    'employeeId',
    'vehicleId',
    'vehicles',
    'jobStatus',
    'jobLabels',
    'ServiceItem',
    'AdditionalServiceItem',
    'clientId',
    'contactPerson',
    'countryCode',
    'contactNumber',
    'serviceId',
    'additionalServiceId',
    'AdditionalServiceItem',
    'remarks',
    'entityName',
    'ContactPersons',
    'ServiceSkills',
    'totalAmount'
  ]
};

export default JobAttributes;
