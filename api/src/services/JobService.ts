/* eslint-disable @typescript-eslint/no-explicit-any */
import Logger from '../Logger';
import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';
import { format, startOfWeek, endOfWeek } from 'date-fns';

import * as JobDao from '../database/dao/JobDao';
import * as JobHistoryDao from '../database/dao/JobHistoryDao';
import * as ServiceDao from '../database/dao/ServiceDao';
import * as InvoiceDao from '../database/dao/InvoiceDao';
import * as SettingDao from '../database/dao/SettingDao';
import * as UserProfileDao from '../database/dao/UserProfileDao';
import * as UserProfileJobDao from '../database/dao/UserProfileJobDao';
import * as VehicleJobDao from '../database/dao/VehicleJobDao';
import * as ChecklistJobDao from '../database/dao/ChecklistJobDao';
import * as ChecklistJobItemDao from '../database/dao/ChecklistJobItemDao';
import * as JobLabelDao from '../database/dao/JobLabelDao';
import * as ServiceItemDao from '../database/dao/ServiceItemDao';
import * as ServiceItemJobDao from '../database/dao/ServiceItemJobDao';
import * as ServiceItemEquipmentDao from '../database/dao/ServiceItemEquipmentDao';
import * as EmailService from './EmailService';
import * as InvoiceService from './InvoiceService';
import * as InvoiceHistoryService from './InvoiceHistoryService';
import * as Notification from './NotificationService';
import * as ServiceService from '../services/ServiceService';
import * as AwsService from '../services/AwsService';
import * as SettingService from '../services/SettingService';
import * as EquipmentService from '../services/EquipmentService';
import * as JobNoteService from '../services/JobNoteService';
import * as ClientDocumentService from '../services/ClientDocumentService';
import * as GstTemplateService from '../services/GstTemplateService';
import * as CollectedAmountHistoryService from '../services/CollectedAmountHistoryService';
import * as JobNoteMediaDao from '../database/dao/JobNoteMediaDao';
import * as ContactPersonDao from '../database/dao/ContactPersonDao';
import * as ServiceContactDao from '../database/dao/ServiceContactDao';
import * as CollectedAmountHistoryDao from '../database/dao/CollectedAmountHistoryDao';
import * as DistrictDao from '../database/dao/DistrictDao';
import * as JobNoteEquipmentDao from '../database/dao/JobNoteEquipmentDao';
import * as ClientService from './ClientService';
import * as FirestoreService from './FirestoreService';

import JobNotFoundError from '../errors/JobNotFoundError';
import JobAlreadyUpdateError from '../errors/JobAlreadyUpdateError';
import JobHaveOtherInProgressError from '../errors/JobHaveOtherInProgressError';
import { JobStatus, PaymentMethod } from '../database/models/Job';
import { ServiceTypes } from '../database/models/Service';
import { SettingCode } from '../database/models/Setting';
import {
  ServiceItemResponseModel,
  JobResponseModel,
  ParametersResponseModel,
  ChecklistJobResponseModel,
  JobLabelResponseModel,
  JobDocumentResponseModel,
  JobCsvData
} from '../typings/ResponseFormats';
import { compressImageFromS3, maskString } from '../utils';
import { JobQueryParams } from '../typings/params/JobQueryParams';
import { JobBody } from '../typings/body/JobBody';
import ServiceItem from '../database/models/ServiceItem';
import puppeteer from 'puppeteer';
import { getTenantKey } from '../database/models';
import { JobNoteBody } from '../typings/body/JobNoteBody';

const LOG = new Logger('JobService.ts');

export const searchJobsWithPagination = async (query: JobQueryParams, id: number): Promise<{ rows: JobResponseModel[]; count: number }> => {
  LOG.debug('Searching job with Pagination');

  if (query.pd) {
    query.pd = Array.isArray(query.pd) ? query.pd : [query.pd];
    const postalDistricts = await DistrictDao.getSectorByDistrict(query.pd);
    query.pd = postalDistricts.reduce((acc, district) => {
      return acc.concat(district.postalSector);
    }, []);
  }

  const { rows, count } = await JobDao.getPaginated(query, id);

  if (rows) {
    await Promise.all(
      rows.map(async row => {
        let jobAmount = 0;
        let jobGstAmount = 0;
        let jobTotalAmount = 0;
        const totalJob = await JobDao.getTotalJobByServiceId(row.serviceId);
        const jobDiscountAmount = Number((row.discountAmount / totalJob).toFixed(2));
        const needGST = row.needGST;

        const gst = (row.serviceGstTax || 0) / 100;

        let additionalAmount = 0;
        let additionalGstAmount = 0;
        let additionalDiscountAmount = 0;
        let additionalTotalAmount = 0;

        if (row.serviceType === ServiceTypes.CONTRACT) {
          const isLastJob = await checkLastJob(row.jobId, row.serviceId);
          row.isLastJob = isLastJob;
        }

        if (row.additionalServiceId) {
          const additionalService = await ServiceDao.getServiceById(row.additionalServiceId);
          additionalGstAmount = additionalService.gstAmount;
          additionalDiscountAmount = additionalService.discountAmount;
          row.AdditionalServiceItem = await ServiceItemDao.getServiceItemByServiceId(row.additionalServiceId);
          const additionalInvoice = await InvoiceService.getInvoiceByServiceId(row.additionalServiceId);
          row.additionalInvoiceNumber = additionalInvoice ? additionalInvoice.invoiceNumber : '-';
          row.additionalInvoiceStatus = additionalInvoice ? additionalInvoice.invoiceStatus : '-';
        }

        row.startDateTimeMobile = new Date(row.startDateTime);
        row.endDateTimeMobile = new Date(row.endDateTime);
        row.startDateTime = new Date(row.startDateTime).toLocaleString();
        row.endDateTime = new Date(row.endDateTime).toLocaleString();
        row.jobDiscountAmount = jobDiscountAmount;

        if (row.ServiceItem) {
          await Promise.all(
            row.ServiceItem.map(async item => {
              item.isDeleted = false;
              const discountPrice = item.discountAmt ? item.discountAmt : 0;
              const totalPrice = item.quantity * Number(item.unitPrice) - discountPrice;
              jobAmount = jobAmount + Number(totalPrice.toFixed(2));
            })
          );
          row.jobAmount = jobAmount;
        }

        if (row.AdditionalServiceItem) {
          const newAdditionalServiceItem = row.AdditionalServiceItem;
          newAdditionalServiceItem.map(async item => {
            item.isDeleted = false;
            const discountPrice = item.discountAmt ? item.discountAmt : 0;
            const totalPrice = item.quantity * Number(item.unitPrice) - discountPrice;
            additionalAmount = additionalAmount + Number(totalPrice.toFixed(2));
          });
          row.AdditionalServiceItem = newAdditionalServiceItem;
          row.additionalCollectedAmount = row.additionalCollectedAmount ? row.additionalCollectedAmount : 0;
          row.additionalAmount = additionalAmount;
        }

        if (needGST) {
          jobAmount = Number((jobAmount - jobDiscountAmount).toFixed(2));

          jobGstAmount = Number((jobAmount * gst).toFixed(2));
          jobTotalAmount = Number((jobAmount + jobGstAmount).toFixed(2));

          additionalAmount = Number((additionalAmount - additionalDiscountAmount).toFixed(2));
          additionalTotalAmount = Number((additionalAmount + additionalGstAmount).toFixed(2));

          row.jobGstAmount = jobGstAmount;
          row.jobTotalAmount = jobTotalAmount;

          row.additionalGstAmount = additionalGstAmount;
          row.additionalTotalAmount = additionalTotalAmount;
        } else {
          jobAmount = Number((jobAmount - jobDiscountAmount).toFixed(2));
          jobTotalAmount = jobAmount;
          additionalAmount = Number((additionalAmount - additionalDiscountAmount).toFixed(2));
          additionalTotalAmount = additionalAmount;

          row.jobGstAmount = 0;
          row.jobTotalAmount = jobTotalAmount;
          row.additionalGstAmount = 0;
          row.additionalTotalAmount = additionalTotalAmount;
        }

        const { jobSequence } = await JobDao.getJobSequence(row.jobId, row.serviceId);
        row.jobSequence = jobSequence ? Number(jobSequence) : 0;

        const contacts = await ContactPersonDao.getByClientId(row.clientId);
        const mainContact = contacts.rows.find(contact => contact.isMain === true);
        row.contactPerson = mainContact.contactPerson;
        row.contactNumber = mainContact.contactNumber;
        row.countryCode = mainContact.countryCode;
        row.contactEmail = mainContact.contactEmail;
        row.collectedAmount = Number((row.collectedAmount + row.additionalCollectedAmount).toFixed(2));

        // <-- used for job list with detail offline mode
        if (row.entityQrImage) {
          const signedUrl = await AwsService.s3BucketGetSignedUrl(row.entityQrImage, 'entities');
          row.paynowQrcode = String(signedUrl);
        }

        let totalCollectedAdditionalAmount = 0;
        let totalAdditionalOustanding = 0;

        const additionalItems = await JobDao.getAdditionalItemsByServiceId(row.serviceId);

        if (additionalItems.length > 0) {
          await Promise.all(
            additionalItems.map(async value => {
              const additionalInvoice = await InvoiceService.getInvoiceByServiceId(Number(value.additionalServiceId));

              if (additionalInvoice) {
                const balance = additionalInvoice.invoiceAmount - additionalInvoice.collectedAmount;
                totalCollectedAdditionalAmount = totalCollectedAdditionalAmount + additionalInvoice.collectedAmount;
                totalAdditionalOustanding = totalAdditionalOustanding + balance;
              } else {
                const additional = await ServiceDao.getServiceDetailByIdForJob(Number(value.additionalServiceId));
                const collectedAdditionalAmount = value.additionalCollectedAmount || 0;
                const outStandingAdditionalAmount = (additional.totalAmount || 0) - collectedAdditionalAmount;
                totalCollectedAdditionalAmount = totalCollectedAdditionalAmount + collectedAdditionalAmount;
                totalAdditionalOustanding = totalAdditionalOustanding + outStandingAdditionalAmount;
              }
            })
          );
        }
        row.additionalOutstandingAmount = totalAdditionalOustanding;
        row.additionalTotalCollectedAmount = totalCollectedAdditionalAmount;

        const contractCollectedAmount = await JobDao.getTotalCollectedAmountByServiceId(row.serviceId);
        const totalContractAmount = row.totalAmountService ? row.totalAmountService : 0;
        const totalCollectedContractAmount = contractCollectedAmount ? contractCollectedAmount.collectedAmount : 0;
        const totalOutstandingContract = totalCollectedContractAmount > totalContractAmount ? 0 : totalContractAmount - totalCollectedContractAmount;

        row.outstandingContract = totalOutstandingContract;
        row.totalAmount = Number((jobTotalAmount + additionalTotalAmount).toFixed(2));
        // used for job list with detail offline mode -->
      })
    );
  }

  return { rows, count };
};

// eslint-disable-next-line
export const jobInformation = async (): Promise<any> => {
  LOG.debug('job Information');
  try {
    const today = format(new Date(), 'yyyy-MM-dd');
    const firstInWeek = format(startOfWeek(new Date()), 'yyyy-MM-dd');
    const lastInWeek = format(endOfWeek(new Date()), 'yyyy-MM-dd');

    const jobsToday = await JobDao.jobInformation(today, today);
    const jobsThisWeek = await JobDao.jobInformation(firstInWeek, lastInWeek);
    const jobsUnAssignedToday = await JobDao.jobInformation(today, today, JobStatus.UNASSIGNED, true);
    const jobsUnAssignedThisWeek = await JobDao.jobInformation(firstInWeek, lastInWeek, JobStatus.UNASSIGNED, true);

    let valueToday = 0;
    if (jobsToday) {
      await Promise.all(
        // eslint-disable-next-line
        jobsToday.map(async (row: any) => {
          const gstTax = (row.gstTax || 0) / 100;
          //eslint-disable-next-line
          row.ServiceItem.map((item: any) => {
            if (row.needGST) {
              valueToday += Number((item.totalPrice + item.totalPrice * gstTax).toFixed(2));
            } else {
              valueToday += Number(item.totalPrice.toFixed(2));
            }
          });

          if (row.additionalServiceId) {
            const additionalService = await ServiceService.getServiceDetailById(row.additionalServiceId);
            const serviceGst = additionalService.getDataValue('needGST');
            const schedules = additionalService.getDataValue('Schedules');
            const gstTax = (additionalService.gstTax || 0) / 100;

            if (schedules) {
              await Promise.all(
                // eslint-disable-next-line
                schedules.map((schedule: any) => {
                  const serviceItems = schedule.getDataValue('ServiceItems');

                  if (serviceItems) {
                    // eslint-disable-next-line
                    serviceItems.map((item: any) => {
                      if (serviceGst) {
                        valueToday += Number((item.totalPrice + item.totalPrice * gstTax).toFixed(2));
                      } else {
                        valueToday += Number(item.totalPrice.toFixed(2));
                      }
                    });
                  }
                })
              );
            }
          }
        })
      );
    }

    let valueWeek = 0;
    if (jobsThisWeek) {
      await Promise.all(
        // eslint-disable-next-line
        jobsThisWeek.map(async (row: any) => {
          const gstTax = (row.gstTax || 0) / 100;
          //eslint-disable-next-line
          row.ServiceItem.map((item: any) => {
            if (row.needGST) {
              valueWeek += Number((item.totalPrice + item.totalPrice * gstTax).toFixed(2));
            } else {
              valueWeek += Number(item.totalPrice.toFixed(2));
            }
          });

          if (row.additionalServiceId) {
            const additionalService = await ServiceService.getServiceDetailById(row.additionalServiceId);
            const serviceGst = additionalService.getDataValue('needGST');
            const schedules = additionalService.getDataValue('Schedules');
            const gstTax = (additionalService.gstTax || 0) / 100;

            if (schedules) {
              await Promise.all(
                // eslint-disable-next-line
                schedules.map((schedule: any) => {
                  const serviceItems = schedule.getDataValue('ServiceItems');

                  if (serviceItems) {
                    // eslint-disable-next-line
                    serviceItems.map((item: any) => {
                      if (serviceGst) {
                        valueWeek += Number((item.totalPrice + item.totalPrice * gstTax).toFixed(2));
                      } else {
                        valueWeek += Number(item.totalPrice.toFixed(2));
                      }
                    });
                  }
                })
              );
            }
          }
        })
      );
    }

    return {
      jobsToday: { count: jobsToday.length, value: valueToday },
      jobsThisWeek: { count: jobsThisWeek.length, value: valueWeek },
      jobsUnAssignedToday: { ...jobsUnAssignedToday },
      jobsUnAssignedThisWeek: { ...jobsUnAssignedThisWeek }
    };
  } catch (err) {
    throw err;
  }
};

export const searchJobsWithColumnFilter = async (): Promise<{ vehicles: ParametersResponseModel[]; employes: ParametersResponseModel[] }> => {
  LOG.debug('Searching job with column filter');
  const { employes, vehicles } = await JobDao.getColumnFilter();

  return { employes, vehicles };
};

export const getJobDetailById = async (jobId: number): Promise<{ row: JobResponseModel }> => {
  LOG.debug('Get job information detail by id');

  const { row } = await JobDao.getJobDetailById(jobId);
  const defaultGst = await GstTemplateService.getDefaultGst();

  if (!row) {
    throw new JobNotFoundError(jobId);
  }

  try {
    const needGST = row.needGST;
    const gst = (row.serviceGstTax || 0) / 100;

    let jobAmount = 0;
    let jobGstAmount = 0;
    let jobTotalAmount = 0;
    const totalJob = await JobDao.getTotalJobByServiceId(row.serviceId);
    row.totalJob = totalJob;
    const jobDiscountAmount = Number((row.discountAmount / totalJob).toFixed(2));

    let additionalAmount = 0;
    const additionalGstAmount = row.additionalGstAmount ? row.additionalGstAmount : 0;
    const additionalDiscountAmount = row.additionalDiscountAmount ? row.additionalDiscountAmount : 0;
    let additionalTotalAmount = 0;

    row.startDateTimeMobile = new Date(row.startDateTime);
    row.endDateTimeMobile = new Date(row.endDateTime);
    row.startDateTime = new Date(row.startDateTime).toLocaleString();
    row.endDateTime = new Date(row.endDateTime).toLocaleString();
    row.vehicleJobs = row.vehicleJobs ? row.vehicleJobs : [];
    row.employee = row.employee ? row.employee : [];
    row.jobDiscountAmount = jobDiscountAmount;
    row.defaultGst = defaultGst.tax;
    row.gstTax = row.serviceGstTax;
    row.paymentMethod = row.paymentMethod;

    if (row.ServiceItem) {
      row.ServiceItem = row.ServiceItem.sort((a, b) => a.id - b.id);
      await Promise.all(
        row.ServiceItem.map(async item => {
          item.isDeleted = false;
          const discountPrice = item.discountAmt ? item.discountAmt : 0;
          const totalPrice = item.quantity * Number(item.unitPrice) - discountPrice;
          jobAmount = jobAmount + Number(totalPrice.toFixed(2));

          //get equipments by service item id
          const equipments = await EquipmentService.getEquipmentByServiceItemId(item.id);
          item.Equipments = equipments;
        })
      );
      row.jobAmount = jobAmount;
    }

    if (row.AdditionalServiceItem) {
      const newAdditionalServiceItem = row.AdditionalServiceItem;
      newAdditionalServiceItem.map(async item => {
        item.isDeleted = false;
        const discountPrice = item.discountAmt ? item.discountAmt : 0;
        const totalPrice = item.quantity * Number(item.unitPrice) - discountPrice;
        additionalAmount = additionalAmount + Number(totalPrice.toFixed(2));

        //get equipments by service item id
        const equipments = await EquipmentService.getEquipmentByServiceItemId(item.id);
        item.Equipments = equipments;
      });
      row.AdditionalServiceItem = newAdditionalServiceItem;
      row.additionalAmount = additionalAmount;
    }

    if (needGST) {
      jobAmount = Number((jobAmount - jobDiscountAmount).toFixed(2));
      jobGstAmount = Number((jobAmount * gst).toFixed(2));
      jobTotalAmount = Number((jobAmount + jobGstAmount).toFixed(2));

      additionalAmount = Number((additionalAmount - additionalDiscountAmount).toFixed(2));
      additionalTotalAmount = Number((additionalAmount + additionalGstAmount).toFixed(2));

      row.jobGstAmount = jobGstAmount;
      row.jobTotalAmount = jobTotalAmount;
      row.additionalGstAmount = additionalGstAmount;
      row.additionalTotalAmount = additionalTotalAmount;
    } else {
      jobAmount = Number((jobAmount - jobDiscountAmount).toFixed(2));
      jobTotalAmount = jobAmount;
      additionalAmount = Number((additionalAmount - additionalDiscountAmount).toFixed(2));
      additionalTotalAmount = additionalAmount;

      row.jobGstAmount = 0;
      row.jobTotalAmount = jobTotalAmount;
      row.additionalGstAmount = 0;
      row.additionalTotalAmount = additionalTotalAmount;
    }

    //get contract detail payment
    const contractCollectedAmount = await JobDao.getTotalCollectedAmountByServiceId(row.serviceId);
    const jobCollectedAmount = row.collectedAmount ? row.collectedAmount : 0;
    const totalContractAmount = row.totalAmountService ? row.totalAmountService : 0;
    const totalCollectedContractAmount = contractCollectedAmount ? contractCollectedAmount.collectedAmount : 0;
    const totalOutstandingContract = totalCollectedContractAmount > totalContractAmount ? 0 : totalContractAmount - totalCollectedContractAmount;

    row.collectedAmount = jobCollectedAmount;
    row.totalAmountService = totalContractAmount;
    row.totalCollectedAmountContract = totalCollectedContractAmount;
    row.outstandingContract = totalOutstandingContract;

    const invoice = await InvoiceService.getInvoiceByServiceId(row.serviceId);

    if (invoice) {
      const balance = invoice.invoiceAmount - invoice.collectedAmount;
      row.contractBalance = balance < 0 ? 0 : balance;
      row.totalCollectedAmountContract = invoice.collectedAmount;
      row.outstandingContract = balance < 0 ? row.outstandingContract : balance;
    } else {
      const balance = row.outstandingContract;
      row.contractBalance = balance < 0 ? 0 : balance;
    }

    //get additional detail payment amount

    let totalCollectedAdditionalAmount = 0;
    let totalAdditionalOustanding = 0;

    const additionalItems = await JobDao.getAdditionalItemsByServiceId(row.serviceId);

    if (additionalItems.length > 0) {
      await Promise.all(
        additionalItems.map(async value => {
          const additionalInvoice = await InvoiceService.getInvoiceByServiceId(Number(value.additionalServiceId));

          if (additionalInvoice) {
            const balance = additionalInvoice.invoiceAmount - additionalInvoice.collectedAmount;
            totalCollectedAdditionalAmount = totalCollectedAdditionalAmount + additionalInvoice.collectedAmount;
            totalAdditionalOustanding = totalAdditionalOustanding + balance;
          } else {
            const additional = await ServiceDao.getServiceDetailByIdForJob(Number(value.additionalServiceId));
            const collectedAdditionalAmount = value.additionalCollectedAmount || 0;
            const outStandingAdditionalAmount = (additional.totalAmount || 0) - collectedAdditionalAmount;
            totalCollectedAdditionalAmount = totalCollectedAdditionalAmount + collectedAdditionalAmount;
            totalAdditionalOustanding = totalAdditionalOustanding + outStandingAdditionalAmount;
          }
        })
      );
    }
    row.additionalOutstandingAmount = totalAdditionalOustanding;
    row.additionalTotalCollectedAmount = totalCollectedAdditionalAmount;

    // const balance = row.additionalCollectedAmount ? row.additionalCollectedAmount : 0;
    // const collectedAdditionalAmount = await JobDao.getTotalCollectedAdditionalAmountByServiceId(row.serviceId);
    // const sumTotalAdditionalAmount = await JobDao.getTotalAdditionalAmountByServiceId(row.serviceId);
    // const totalCollectedAdditionalAmount = collectedAdditionalAmount ? collectedAdditionalAmount.totalAdditionalCollectedAmount : 0;
    // const totalAdditionalServiceAmount = sumTotalAdditionalAmount ? sumTotalAdditionalAmount.totalAdditionalServiceAmount : 0;
    // row.additionalCollectedAmount = balance < 0 ? 0 : balance;
    // row.additionalTotalCollectedAmount = totalCollectedAdditionalAmount ? totalCollectedAdditionalAmount : 0;
    // row.additionalOutstandingAmount =
    //   totalCollectedAdditionalAmount > totalAdditionalServiceAmount ? 0 : totalAdditionalServiceAmount - totalCollectedAdditionalAmount;

    // if (row.additionalServiceId) {
    //   const additionalInvoice = await InvoiceService.getInvoiceByServiceId(row.additionalServiceId);

    //   if (additionalInvoice) {
    //     const balance = additionalInvoice.invoiceAmount - additionalInvoice.collectedAmount;
    //     row.additionalOutstandingAmount = balance < 0 ? 0 : balance;
    //     row.additionalTotalCollectedAmount = additionalInvoice.collectedAmount;
    //   }
    // }

    if (row.ChecklistJob) {
      const newChecklistJob = row.ChecklistJob;
      newChecklistJob.map(item => {
        if (item.ChecklistJobItems) {
          item.ChecklistJobItems = item.ChecklistJobItems.sort((a, b) => a.id - b.id); // for mobile response temporary
          item.ChecklistItems = item.ChecklistJobItems.sort((a, b) => a.id - b.id);
        }
      });
      row.ChecklistJob = newChecklistJob;
    }

    if (row.JobExpenses) {
      const newJobExpenses = row.JobExpenses;
      newJobExpenses.map(item => {
        if (item.JobExpensesItems) {
          item.JobExpensesItems = item.JobExpensesItems.sort((a, b) => a.id - b.id);
        }
      });
      row.JobExpenses = newJobExpenses;
    }

    if (row.signature) {
      const signedImageUrl = await AwsService.s3BucketGetSignedUrl(row.signature, 'signature');
      row.signatureUrl = String(signedImageUrl);
    }

    let newJobNoteData: any[] = [];
    if (row.jobNotes) {
      await Promise.all(
        row.jobNotes.map(async jobNote => {
          const media = await JobNoteMediaDao.getJobNoteMediaByJobNoteId(jobNote.id);
          await Promise.all(
            media.rows.map(async row => {
              if (row.fileName) {
                row.setDataValue('imageUrl', await AwsService.s3BucketGetSignedUrl(row.fileName, 'jobs'));
              }
            })
          );

          const equipments = await EquipmentService.getEquipmentByJobNoteId(jobNote.id);

          newJobNoteData.push({
            id: jobNote.id,
            notes: jobNote.notes,
            jobNoteType: jobNote.jobNoteType,
            isHide: jobNote.isHide,
            jobId: jobNote.jobId,
            displayName: jobNote.UserProfile.displayName,
            Equipments: equipments,
            JobNoteMedia: media.rows,
            createdAt: jobNote.createdAt
          });
        })
      );

      // newJobNoteData = newJobNoteData.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      newJobNoteData = newJobNoteData.sort((a, b) => a.id - b.id);
      console.log('newJobNoteData', newJobNoteData);
      row.jobNotes = newJobNoteData;
    }

    let newJobDocumentData: JobDocumentResponseModel[] = [];
    //get client documents
    const { rows, count } = await ClientDocumentService.getClientDocumentByClientId(row.clientId);

    if (count > 0) {
      await Promise.all(
        rows.map(async clientDocument => {
          let signedDocumentUrl = '';
          if (clientDocument.documentUrl) {
            signedDocumentUrl = await AwsService.s3BucketGetSignedUrl(clientDocument.documentUrl, 'documents');
          }

          newJobDocumentData.push({
            id: clientDocument.id,
            notes: clientDocument.notes,
            documentUrl: String(signedDocumentUrl),
            isHide: clientDocument.isHide,
            jobId: Number(jobId)
          });
        })
      );
    }

    if (row.jobDocuments) {
      await Promise.all(
        row.jobDocuments.map(async jobDocument => {
          let signedDocumentUrl = '';
          if (jobDocument.documentUrl) {
            signedDocumentUrl = await AwsService.s3BucketGetSignedUrl(jobDocument.documentUrl, 'documents');
          }

          newJobDocumentData.push({
            id: jobDocument.id,
            notes: jobDocument.notes,
            documentUrl: String(signedDocumentUrl),
            isHide: jobDocument.isHide,
            jobId: jobDocument.jobId
          });
        })
      );

      newJobDocumentData = newJobDocumentData.sort((a, b) => a.id - b.id);
    }
    row.jobDocuments = newJobDocumentData;

    if (row.entityQrImage) {
      const signedUrl = await AwsService.s3BucketGetSignedUrl(row.entityQrImage, 'entities');
      row.paynowQrcode = String(signedUrl);
    }

    const priceVisibility = await SettingService.getSpecificSettings('PRICEVISIBILITY');
    row.priceVisibility = priceVisibility ? priceVisibility.isActive : false;
    row.contactNumber = row.countryCode + row.contactNumber;

    const { jobSequence } = await JobDao.getJobSequence(row.jobId, row.serviceId);
    row.jobSequence = jobSequence ? Number(jobSequence) : 0;

    const callClientPermission = await SettingService.getSpecificSettings('CALLCLIENTPERMISSION');
    console.log('---->', callClientPermission);
    row.callClientPermission = callClientPermission ? callClientPermission.isActive : true;

    return { row };
  } catch (err) {
    throw err;
  }
};

export const getJobDetailByAdditionalServiceId = async (additionalServiceId: number): Promise<JobResponseModel> => {
  LOG.debug('Get job information detail by additional service id');

  try {
    const parentJob = await JobDao.getJobDetailByAdditionalServiceId(additionalServiceId);

    if (!parentJob) {
      throw new JobNotFoundError(additionalServiceId);
    }

    const job = await JobDao.getJobDetailById(parentJob.id);

    if (job.row.AdditionalServiceItem) {
      const newAdditionalServiceItem = job.row.AdditionalServiceItem;

      await Promise.all(
        newAdditionalServiceItem.map(async item => {
          item.isDeleted = false;

          //get equipments by service item id
          const equipments = await EquipmentService.getEquipmentByServiceItemId(item.id);
          item.Equipments = equipments;
        })
      );
      job.row.AdditionalServiceItem = newAdditionalServiceItem;
    }

    //get additional detail payment amount

    let totalCollectedAdditionalAmount = 0;
    let totalAdditionalOustanding = 0;

    const additionalItems = await JobDao.getAdditionalItemsByServiceId(job.row.serviceId);

    if (additionalItems.length > 0) {
      await Promise.all(
        additionalItems.map(async value => {
          const additionalInvoice = await InvoiceService.getInvoiceByServiceId(Number(value.additionalServiceId));

          if (additionalInvoice) {
            const balance = additionalInvoice.invoiceAmount - additionalInvoice.collectedAmount;
            totalCollectedAdditionalAmount = totalCollectedAdditionalAmount + additionalInvoice.collectedAmount;
            totalAdditionalOustanding = totalAdditionalOustanding + balance;
          } else {
            const additional = await ServiceDao.getServiceDetailByIdForJob(Number(value.additionalServiceId));
            const collectedAdditionalAmount = value.additionalCollectedAmount || 0;
            const outStandingAdditionalAmount = (additional.totalAmount || 0) - collectedAdditionalAmount;
            totalCollectedAdditionalAmount = totalCollectedAdditionalAmount + collectedAdditionalAmount;
            totalAdditionalOustanding = totalAdditionalOustanding + outStandingAdditionalAmount;
          }
        })
      );
    }
    job.row.additionalOutstandingAmount = totalAdditionalOustanding;
    job.row.additionalTotalCollectedAmount = totalCollectedAdditionalAmount;

    return job.row;
  } catch (err) {
    throw err;
  }
};

export const checkLastJob = async (jobId: number, serviceId: number): Promise<boolean> => {
  LOG.debug('Check is last job in service');

  try {
    const lastJob = await JobDao.getLastJobByServiceId(serviceId);

    return jobId === lastJob.id;
  } catch (err) {
    throw err;
  }
};

/**
 * To Edit job in the system, based on user input
 *
 * @param jobStatus of the jobs
 *
 * @returns void
 */

export const editJob = async (id: number, query: JobBody, assignedBy: number): Promise<{ row: JobResponseModel }> => {
  LOG.debug('Editing Job');

  const job = await JobDao.getJobById(id);

  if (!job) {
    throw new JobNotFoundError(id);
  }

  try {
    const {
      startDateTime,
      endDateTime,
      signature,
      remarks,
      paymentMethod,
      location,
      selectedVehicles,
      selectedEmployees,
      subtaskRemarks,
      ChecklistJob,
      JobLabels
    } = query;

    let collectedAmount = query.collectedAmount || job.collectedAmount || 0;
    let collectedBy = job.collectedBy || '';
    const additionalCollectedAmount = query.additionalCollectedAmount || 0;
    const chequeNumber = query.chequeNumber || null;

    const currentUser = await UserProfileDao.getUserFullDetails(assignedBy);
    const { row } = await getJobDetailById(id);
    const jobDetail = row;
    const jobStatus = query.jobStatus || jobDetail.jobStatus;

    if (currentUser.roleId === 2) {
      if (jobStatus === job.jobStatus) {
        throw new JobAlreadyUpdateError(id);
      }

      if (jobDetail.employee && jobDetail.employee.length > 0) {
        const findEmmployee = jobDetail.employee.find(value => value.id == assignedBy);

        if (!findEmmployee) {
          throw new JobNotFoundError(id);
        }
      }

      if (jobStatus === JobStatus.IN_PROGRESS) {
        const anotherInProgressJob = await JobDao.getJobsByTecnician(currentUser.id, JobStatus.IN_PROGRESS, job.id);

        if (anotherInProgressJob.length > 0) {
          throw new JobHaveOtherInProgressError();
        }

        if (job.jobStatus === JobStatus.UNASSIGNED) {
          throw new JobNotFoundError(id);
        }
      }
    }

    //create job history
    await JobHistoryDao.createJobHistory(job.id, currentUser.id, jobStatus, location);

    if (selectedVehicles && selectedVehicles.length > 0) {
      await VehicleJobDao.deleteData(id);
      // eslint-disable-next-line
      const vehicleJobData: any[] = [];
      // eslint-disable-next-line
      selectedVehicles.map((value: any) => {
        vehicleJobData.push({ vehicleId: value.id, jobId: id });
      });

      await VehicleJobDao.create(vehicleJobData);
    } else {
      if (jobStatus === JobStatus.UNASSIGNED || jobStatus === JobStatus.CONFIRMED) {
        await VehicleJobDao.deleteData(id);
      }
    }

    if (selectedEmployees && selectedEmployees.length > 0) {
      await UserProfileJobDao.deleteData(id);
      // eslint-disable-next-line
      const userProfileJobData: any[] = [];
      // eslint-disable-next-line
      selectedEmployees.map((value: any) => userProfileJobData.push({ userProfileId: value.id, jobId: id }));

      await UserProfileJobDao.create(userProfileJobData);
    } else {
      if (jobStatus === JobStatus.UNASSIGNED || jobStatus === JobStatus.CONFIRMED) {
        await UserProfileJobDao.deleteData(id);
      }
    }

    let reassign = false;
    if (startDateTime) {
      reassign =
        jobDetail.jobStatus === JobStatus.ASSIGNED &&
        jobStatus === JobStatus.ASSIGNED &&
        format(new Date(jobDetail.startDateTime), 'dd-MM-yyyy hh:mm a') !== format(new Date(startDateTime), 'dd-MM-yyyy hh:mm a');
    }

    if (jobStatus === JobStatus.ASSIGNED || reassign) {
      if (selectedEmployees && selectedEmployees.length > 0) {
        // eslint-disable-next-line
        selectedEmployees.map(async (value: any) => {
          const currentUser = await UserProfileDao.getById(value.id);
          const employeeName = currentUser.getDataValue('displayName');
          const tokenNotification = currentUser.getDataValue('token');
          const address = jobDetail.serviceAddress;
          if (tokenNotification) {
            const message = {
              title: `New Job ${reassign ? 'reassign' : 'assign'}`,
              body: reassign
                ? `Hi ${employeeName}, your assigned job on ${
                    startDateTime
                      ? format(new Date(startDateTime), 'dd-MM-yyyy hh:mm a')
                      : format(new Date(jobDetail.startDateTime), 'dd-MM-yyyy hh:mm a')
                  } at ${address} has been reassigned. Please check job details or contact admin.`
                : `Hi ${employeeName}, you have a new job assigned to you on ${
                    startDateTime
                      ? format(new Date(startDateTime), 'dd-MM-yyyy hh:mm a')
                      : format(new Date(jobDetail.startDateTime), 'dd-MM-yyyy hh:mm a')
                  } at ${address}. Please check job details for more information.`
            };

            await Notification.sendTechnicianNotif(tokenNotification, message, {
              jobId: String(job.id),
              jobType: jobDetail.serviceType,
              jobStatus: 'ASSIGNED',
              startDateTime: startDateTime ? startDateTime.toString() : jobDetail.startDateTime.toString()
            });
          }
          FirestoreService.fetchUser(value);
        });
      }
    }

    let paymentType;
    let additionalOutstandingAmount = 0;
    if (collectedAmount > 0 && additionalCollectedAmount > 0) {
      paymentType = 'FULL_PAYMENT';
    } else if (collectedAmount > 0) {
      paymentType = 'OUTSTANDING';
    } else if (additionalCollectedAmount > 0) {
      paymentType = 'ADDITIONAL';
    }

    //function to update invoice contract collected amount
    if (collectedAmount && collectedAmount > 0 && query.isEditCollectedAmount) {
      const invoice = await InvoiceDao.getInvoiceByServiceId(jobDetail.serviceId);
      if (invoice) {
        const invoiceAmount = invoice.invoiceAmount;
        let newContractCollect = query.isReplacement
          ? invoice.collectedAmount - row.collectedAmount + collectedAmount
          : invoice.collectedAmount + collectedAmount;
        newContractCollect = newContractCollect > invoiceAmount ? invoiceAmount : newContractCollect;
        const newInvoiceStatus = newContractCollect >= invoice.invoiceAmount ? 'FULLY PAID' : 'PARTIALLY PAID';

        await invoice.update({ collectedAmount: newContractCollect, invoiceStatus: newInvoiceStatus, chequeNumber });
        // call function to syncing invoice
        await InvoiceService.syncingInvoiceUpdate(invoice.id);

        // create invoice history and collected amount history
        const description =
          newInvoiceStatus === 'FULLY PAID'
            ? `Payment Received fully $${collectedAmount} collected by ${currentUser.displayName} ${
                paymentMethod ? ` (${paymentMethod === PaymentMethod.CHEQUE ? `CHEQUE, No. ${chequeNumber}` : paymentMethod})` : ''
              }`
            : `Partial Payment $${collectedAmount} collected by ${currentUser.displayName} (${
                paymentMethod === PaymentMethod.CHEQUE ? `CHEQUE, No. ${chequeNumber}` : paymentMethod
              }).`;
        await InvoiceHistoryService.createInvoiceHistory(currentUser.id, invoice.id, newInvoiceStatus, description);
      }

      if (query.isReplacement && query.isReplacement === true) {
        await CollectedAmountHistoryDao.softDeleteByJobId(id);
      }

      await CollectedAmountHistoryService.createCollectedAmountHistory(
        Number(job.serviceId),
        currentUser.displayName,
        collectedAmount,
        paymentMethod,
        null,
        id,
        false
      );

      if (currentUser.roleId != 1 && collectedBy.includes('ADMIN')) {
        collectedAmount += job.collectedAmount;
      }

      collectedBy = `${currentUser.displayName} (${currentUser.role})`;
    }

    //function to update invoice additional collected amount
    if (additionalCollectedAmount && jobDetail.additionalServiceId && additionalCollectedAmount > 0) {
      const additionalInvoice = await InvoiceDao.getInvoiceByServiceId(jobDetail.additionalServiceId);
      if (additionalInvoice) {
        const invoiceAmount = additionalInvoice.invoiceAmount;
        let newContractCollect = additionalInvoice.collectedAmount + additionalCollectedAmount;
        newContractCollect = newContractCollect > invoiceAmount ? invoiceAmount : newContractCollect;
        const newInvoiceStatus = newContractCollect >= additionalInvoice.invoiceAmount ? 'FULLY PAID' : 'PARTIALLY PAID';
        additionalOutstandingAmount = additionalInvoice.invoiceAmount - newContractCollect;
        await additionalInvoice.update({ collectedAmount: newContractCollect, invoiceStatus: newInvoiceStatus });
        // call function to syncing invoice
        await InvoiceService.syncingInvoiceUpdate(additionalInvoice.id);

        // create invoice history and collected amount history
        const description =
          newInvoiceStatus === 'FULLY PAID'
            ? `Additional Payment Received fully $${additionalCollectedAmount} collected by ${currentUser.role} ${currentUser.displayName} ${
                paymentMethod ? ` (${paymentMethod === PaymentMethod.CHEQUE ? `CHEQUE, No. ${chequeNumber}` : paymentMethod})` : ''
              }`
            : `Additional Partial Payment $${additionalCollectedAmount} collected by ${currentUser.role} (${
                paymentMethod === PaymentMethod.CHEQUE ? `CHEQUE, No. ${chequeNumber}` : paymentMethod
              }).`;
        await InvoiceHistoryService.createInvoiceHistory(currentUser.id, additionalInvoice.id, newInvoiceStatus, description);
      } else {
        const collectedAdditionalAmount = await JobDao.getTotalCollectedAdditionalAmountByServiceId(row.serviceId);
        const totalAdditionalAmount = await JobDao.getTotalAdditionalAmountByServiceId(row.serviceId);
        const totalCollectedAdditionalAmount = collectedAdditionalAmount ? collectedAdditionalAmount.totalAdditionalCollectedAmount : 0;
        const totalAdditionalServiceAmount = totalAdditionalAmount ? totalAdditionalAmount.totalAdditionalServiceAmount : 0;
        const lastAdditionalOutstandingAmount = totalAdditionalServiceAmount - totalCollectedAdditionalAmount;

        const jobAdditional = await ServiceDao.getServiceById(jobDetail.additionalServiceId);
        const jobAdditionalAmount = jobAdditional ? jobAdditional.totalAmount : 0;
        const totalAdditionalOustanding = lastAdditionalOutstandingAmount + jobAdditionalAmount;
        additionalOutstandingAmount = totalAdditionalOustanding - additionalCollectedAmount;
      }
      // await CollectedAmountHistoryService.createCollectedAmountHistory(
      //   Number(job.serviceId),
      //   currentUser.displayName,
      //   additionalCollectedAmount,
      //   paymentMethod
      // );
      collectedBy = currentUser.displayName;
    }

    const serviceItems = jobDetail.ServiceItem ? jobDetail.ServiceItem : [];
    const additionalServiceItems = jobDetail.AdditionalServiceItem ? jobDetail.AdditionalServiceItem : [];

    if (jobStatus === JobStatus.COMPLETED) {
      if (currentUser.roleId != 1) {
        if (serviceItems.length > 0) {
          await Promise.all(
            serviceItems.map(async item => {
              const jobNote: JobNoteBody = {
                notes: `${item.name} ${item.description ? `\n\n ${item.description}` : ''}`,
                jobId: id,
                createdBy: assignedBy
              };
              const equipments = item.Equipments ? item.Equipments : [];
              if (equipments.length > 0) {
                const newJobNote = await JobNoteService.createJobNote(jobNote);
                const jobNoteEquipment: any[] = [];
                Promise.all(
                  item.Equipments.map(value => {
                    return jobNoteEquipment.push({ jobNoteId: newJobNote.id, equipmentId: value.id });
                  })
                );

                await JobNoteEquipmentDao.create(jobNoteEquipment);
              }
            })
          );
        }

        if (additionalServiceItems.length > 0) {
          await Promise.all(
            additionalServiceItems.map(async item => {
              const jobNote: JobNoteBody = {
                notes: `${item.name} ${item.description ? `\n\n ${item.description}` : ''}`,
                jobId: id,
                createdBy: assignedBy
              };
              const equipments = item.Equipments ? item.Equipments : [];
              if (equipments.length > 0) {
                const newJobNote = await JobNoteService.createJobNote(jobNote);
                const jobNoteEquipment: any[] = [];
                Promise.all(
                  item.Equipments.map(value => {
                    return jobNoteEquipment.push({ jobNoteId: newJobNote.id, equipmentId: value.id });
                  })
                );
                await JobNoteEquipmentDao.create(jobNoteEquipment);
              }
            })
          );
        }
      }
    }

    if (ChecklistJob && ChecklistJob.length > 0) {
      await Promise.all(
        // eslint-disable-next-line
        ChecklistJob.map(async (checklistJob: any) => {
          const checklistJobData = await ChecklistJobDao.getChecklistJobById(checklistJob.id);

          await checklistJobData.update({ name: checklistJob.name, description: checklistJob.description, remarks: subtaskRemarks });

          if (checklistJob.ChecklistJobItems) {
            // eslint-disable-next-line
            checklistJob.ChecklistJobItems.map(async (value: any) => {
              const items = await ChecklistJobItemDao.getChecklistJobItemByid(value.id);

              await items.update({
                status: value.status,
                remarks: value.remarks
              });
            });
          }
        })
      );
    }

    if (JobLabels) {
      await JobLabelDao.deleteJobLabelByJobId([id]);
      await Promise.all(
        JobLabels.map(async (label: JobLabelResponseModel) => {
          await JobLabelDao.createJobLabel(id, label.name, label.description, label.color);
        })
      );
    }

    await job.update({
      startDateTime,
      endDateTime,
      jobStatus,
      signature: query.jobStatus === JobStatus.UNASSIGNED ? null : signature ?? row.signature,
      remarks,
      assignedBy,
      collectedAmount,
      additionalCollectedAmount,
      additionalOutstandingAmount,
      paymentMethod,
      paymentType,
      collectedBy,
      chequeNumber,
      isSynchronize: false
    });

    if (jobStatus === JobStatus.COMPLETED) {
      const service = await ServiceDao.getServiceById(jobDetail.serviceId);
      const additionalService = await ServiceDao.getServiceById(jobDetail.additionalServiceId);
      const totalCompletedJob = await JobDao.getCompletedJobByServiceId(service.id);
      const isJobCompleted = totalCompletedJob === service.totalJob ? true : false;

      await service.update({ isJobCompleted });

      if (additionalService) {
        const totalCompletedAdditionalJob = await JobDao.getCompletedJobByServiceId(additionalService.id);
        const isJobCompletedAdditional = totalCompletedAdditionalJob === additionalService.totalJob ? true : false;
        await additionalService.update({ isJobCompleted: isJobCompletedAdditional });
      }

      const sendReport = await SettingService.getSpecificSettings('NOTIFCOMPLETEJOBEMAIL');

      if (sendReport.isActive) {
        if (row.emailJobReport === true) {
          const contacts: any = [];
          const serviceContact = await ServiceContactDao.getByserviceId(row.serviceId);
          row.ContactPerson.map(val => {
            const matchingServiceContact = serviceContact.find(contact => contact.contactPersonId === val.id);
            if (matchingServiceContact) {
              if (val.contactEmail && val.contactEmail !== '') {
                contacts.push(val.contactEmail);
              }
            }
          });
          if (contacts && contacts.length > 0) {
            sendEmail(id, [contacts.join(', ')]);
          }
        }
      }
    }

    if (jobStatus !== JobStatus.COMPLETED) {
      const service = await ServiceDao.getServiceById(jobDetail.serviceId);
      if (jobDetail.serviceType === 'ADHOC') {
        await service.update({ isJobCompleted: false });
      }
    }

    return await getJobDetailById(id);
  } catch (err) {
    throw err;
  }
};

/**
 * To delete service (hard delete)
 *
 * @param id of the service to be deleted
 *
 * @returns void
 */

export const deleteJob = async (jobId: number[]): Promise<void> => {
  await JobDao.deleteJobById(jobId);
};

export const notifCompletedJob = async (id: number, roleId: number): Promise<JobResponseModel> => {
  try {
    const { row } = await JobDao.getJobDetailById(id);
    const jobDetail = row;

    const notificationSetting = await SettingDao.getSettingByCodeAndLabel(SettingCode.NOTIFCOMPLETEJOBEMAIL);

    if (notificationSetting && notificationSetting.isActive) {
      const jobDateTime = `${format(new Date(jobDetail.startDateTime), 'dd-MM-yyyy hh:mm a')} - ${format(
        new Date(jobDetail.endDateTime),
        'dd-MM-yyyy hh:mm a'
      )}`;
      const serviceAddress = jobDetail.serviceAddress.split(', ');
      const firstLineAddress = `${serviceAddress[0] || ''}, ${serviceAddress[1] || ''}`;
      const secondLineAddress = `#${jobDetail.serviceFloorNo}-${jobDetail.serviceUnitNo}, Singapore ${jobDetail.postalCode}`;

      const entityAddress = jobDetail.entityAddress || '';
      const splitEntityAddress = entityAddress.split(',');
      const newEntityAddress =
        splitEntityAddress.length > 1
          ? `${splitEntityAddress[0]}, ${splitEntityAddress[1]}, Singapore, ${splitEntityAddress[2]}`
          : `${splitEntityAddress[0]}, Singapoore`;

      const jobReportFile = await exportPdf(id);

      const contactEmail = [''];

      if (jobDetail.ContactPerson) {
        jobDetail.ContactPerson.map(contact => {
          return contactEmail.push(contact.contactEmail);
        });
      }

      let logoUrl;
      if (jobDetail.entityLogo) {
        logoUrl = await AwsService.s3BucketGetSignedUrl(jobDetail.entityLogo, 'entities');
      }

      const template = await SettingService.getSpecificSettings('JOBEMAILTEMPLATE', 'JobEmailTemplate');

      const replacementValues: Record<string, string> = {
        displayName: jobDetail.clientName,
        jobTime: jobDateTime,
        firstLineAddress: firstLineAddress,
        secondLineAddress: secondLineAddress
      };

      const emailBody = template.value.replace(/{([^}]+)}/g, (match, placeholder) => {
        return replacementValues[placeholder] || match;
      });

      if (roleId === 2) {
        await EmailService.sendJobCompletedEmail(
          jobDetail.jobId,
          jobDetail.entityName,
          jobDetail.clientName,
          jobDateTime,
          firstLineAddress,
          secondLineAddress,
          contactEmail,
          jobReportFile,
          logoUrl,
          jobDetail.entityEmail,
          `+65${jobDetail.entityContactNumber}`,
          newEntityAddress,
          emailBody
        );
      }
    }

    return jobDetail;
  } catch (err) {
    throw err;
  }
};

export const exportPdf = async (id: number): Promise<Buffer> => {
  try {
    const { row } = await getJobDetailById(id);
    const { DOMAIN } = process.env;
    const jobDetail = row;
    const tenantKey = getTenantKey();

    let logoUrl = `https://${DOMAIN}/noimage.png`;

    if (jobDetail.entityLogo) {
      logoUrl = await AwsService.s3BucketGetSignedUrl(jobDetail.entityLogo, 'entities');
    }

    let dataTables: ServiceItemResponseModel[] = [];
    let dataAdditionalServiceItems: ServiceItemResponseModel[] = [];

    const jobAmount = jobDetail.jobAmount || 0;
    const discountAmount = jobDetail.jobDiscountAmount || 0;
    const gstAmount = jobDetail.jobGstAmount || 0;
    const totalAmount = jobDetail.jobTotalAmount || 0;
    const jobCollectedAmount = jobDetail.collectedAmount || 0;
    const additionalAmount = jobDetail.additionalAmount || 0;
    const additionalGstAmount = jobDetail.additionalGstAmount || 0;
    const additionalDiscountAmount = jobDetail.additionalDiscountAmount || 0;
    const totalAdditionalAmount = jobDetail.additionalTotalAmount || 0;
    const collectedAdditionalAmount = jobDetail.additionalCollectedAmount || 0;
    const totalAmountService = jobDetail.totalAmountService || 0;
    let paymentStatus = '';
    let serviceItemDiscountVisibility = false;
    const gstTax = jobDetail.gstTax || 0;

    const collectedAmount = await JobDao.getTotalCollectedAmountByServiceId(jobDetail.serviceId);
    const totalCollectedAmount = collectedAmount ? collectedAmount.collectedAmount : 0;
    const invoice = await InvoiceService.getInvoiceByServiceId(jobDetail.serviceId);
    const employees = row.employee && row.employee.length > 0 ? row.employee.map(obj => obj.displayName).join(', ') : '-';

    if (jobDetail.ServiceItem) {
      const tables = await Promise.all(
        jobDetail.ServiceItem.map(async item => {
          const discountPrice = item.discountAmt ? item.discountAmt : 0;
          const equipments = await EquipmentService.getEquipmentByServiceItemId(item.id);
          // set equipment type synchronously
          equipments.forEach(val => {
            val.type = val.isMain ? 'Main' : 'Sub';
          });

          if (discountPrice > 0) {
            serviceItemDiscountVisibility = true;
          }

          return {
            id: item.id,
            name: item.name,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice ? item.unitPrice.toLocaleString('en-sg', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00',
            discountAmt: discountPrice,
            totalPrice: item.totalPrice ? item.totalPrice.toLocaleString('en-sg', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00',
            Equipments: equipments
          } as ServiceItemResponseModel;
        })
      );

      // Promise.all preserves array order of the input promises
      dataTables = tables;
    }

    if (jobDetail.AdditionalServiceItem) {
      const additional = await Promise.all(
        jobDetail.AdditionalServiceItem.map(async item => {
          const discountPrice = item.discountAmt ? item.discountAmt : 0;
          const equipments = await EquipmentService.getEquipmentByServiceItemId(item.id);
          equipments.forEach(val => {
            val.type = val.isMain ? 'Main' : 'Sub';
          });

          if (discountPrice > 0) {
            serviceItemDiscountVisibility = true;
          }

          return {
            id: item.id,
            name: item.name,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice ? item.unitPrice.toLocaleString('en-sg', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00',
            discountAmt: discountPrice,
            totalPrice: item.totalPrice ? item.totalPrice.toLocaleString('en-sg', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00',
            Equipments: equipments
          } as ServiceItemResponseModel;
        })
      );

      dataAdditionalServiceItems = additional;
    }

    const technician: string[] = [];
    if (jobDetail.employee && jobDetail.employee.length > 0) {
      jobDetail.employee.map(value => {
        return technician.push(value.displayName);
      });
    } else {
      technician.push('-');
    }

    const vehicle: string[] = [];
    if (jobDetail.vehicleJobs && jobDetail.vehicleJobs.length > 0) {
      jobDetail.vehicleJobs.map(value => {
        return vehicle.push(value.carplateNumber);
      });
    } else {
      vehicle.push('-');
    }

    let jobNotes: any[] = [];
    const fileNames: any[] = [];

    if (jobDetail.jobNotes) {
      await Promise.all(
        jobDetail.jobNotes.map(async value => {
          if (!value.isHide) {
            const media = await JobNoteMediaDao.getJobNoteMediaByJobNoteId(value.id);
            await Promise.all(
              media.rows.map(async row => {
                if (row.fileName && row.fileType === 'image') {
                  fileNames.push(`${tenantKey}/jobs/${row.fileName}`);
                }
              })
            );
          }
        })
      );

      // if (fileNames.length > 0) {
      //   await imgCompressor(fileNames);
      // }

      await Promise.all(
        jobDetail.jobNotes.map(async value => {
          if (!value.isHide) {
            const media = await JobNoteMediaDao.getJobNoteMediaByJobNoteId(value.id);
            const equipments = await EquipmentService.getEquipmentByJobNoteId(Number(value.id));

            const mediaUrls: any[] = [];

            await Promise.all(
              media.rows.map(async row => {
                if (row.fileName && row.fileType === 'image') {
                  const compressedFileName = await compressImageFromS3(row.fileName);
                  const signedFile = await AwsService.s3BucketGetSignedUrl(compressedFileName, 'jobs_resized');
                  // return AwsService.s3BucketGetSignedUrl(row.fileName, 'jobs');
                  mediaUrls.push({ id: row.id, imageUrl: signedFile });
                } else {
                  mediaUrls.push({
                    id: row.id,
                    imageUrl: row.fileType === 'image' ? `https://${DOMAIN}/noimage.png` : `https://${DOMAIN}/videoimage.png`
                  });
                }
              })
            );

            if (mediaUrls.length === 0) {
              mediaUrls.push({ imageUrl: `https://${DOMAIN}/noimage.png` });
            }

            mediaUrls.sort((a, b) => {
              const aIsVideo = a.imageUrl.includes('videoimage.png') ? 1 : 0;
              const bIsVideo = b.imageUrl.includes('videoimage.png') ? 1 : 0;

              if (aIsVideo !== bIsVideo) {
                return aIsVideo - bIsVideo;
              }

              return a.id - b.id;
            });

            const filteredMediaUrls = mediaUrls.reduce<{ imageUrl: string }[]>((acc, item) => {
              if (item.imageUrl.includes('videoimage.png')) {
                if (!acc.some(i => i.imageUrl.includes('videoimage.png'))) {
                  acc.push(item);
                }
              } else {
                acc.push(item);
              }
              return acc;
            }, []);

            jobNotes.push({
              id: value.id,
              notes: value.notes,
              jobNoteType: value.jobNoteType,
              imageUrls: filteredMediaUrls,
              isHide: value.isHide,
              Equipment: equipments,
              employees: technician
            });
          }
        })
      );

      jobNotes = jobNotes.sort((a, b) => a.id - b.id);
    }

    const checklistJobs: ChecklistJobResponseModel[] = [];
    if (jobDetail.ChecklistJob) {
      jobDetail.ChecklistJob.map(value => {
        checklistJobs.push({
          id: value.id,
          jobId: value.jobId,
          name: value.name,
          description: value.description,
          remarks: value.remarks ? value.remarks : '-',
          ChecklistJobItems: value.ChecklistJobItems
        });
      });
    }

    let signatureUrl = '';
    if (jobDetail.signature) {
      signatureUrl = await AwsService.s3BucketGetSignedUrl(jobDetail.signature, 'signature');
    }

    const splitServiceAddress = jobDetail.serviceAddress.split(', ');
    const checkIncludeCharacter = (address: string) => {
      return address.includes('-');
    };

    const floorAndUnitNo = jobDetail.serviceFloorNo ? `#${jobDetail.serviceFloorNo}-${jobDetail.serviceUnitNo},` : '';
    const currentAddress =
      splitServiceAddress.length > 2
        ? checkIncludeCharacter(splitServiceAddress[1])
          ? `${splitServiceAddress[0]}, ${floorAndUnitNo} Singapore ${jobDetail.postalCode}`
          : `${splitServiceAddress[0] || ''}, ${splitServiceAddress[1] || ''}, ${floorAndUnitNo} Singapore ${jobDetail.postalCode}`
        : `${splitServiceAddress[0]}, Singapore ${jobDetail.postalCode}`;

    // const currentAddress = `${splitServiceAddress[0] || ''}, ${splitServiceAddress[1] || ''}, #${jobDetail.serviceFloorNo}-${
    //   jobDetail.serviceUnitNo
    // }, Singapore ${jobDetail.postalCode}`;

    const convertStartTime = format(new Date(jobDetail.startDateTime), 'dd-MM-yyyy hh:mm a');
    const entityContactNumber = jobDetail.entityCountryCode + jobDetail.entityContactNumber;

    const settingPriceVisibility = await SettingService.getSpecificSettings('PRICEREPORTVISIBILITY');
    let priceVisibility = settingPriceVisibility.isActive;
    if (priceVisibility) {
      const clientDetail = await ClientService.getClientById(jobDetail.clientId);
      priceVisibility = clientDetail.priceReportVisibility;
    }

    if (invoice) {
      paymentStatus = invoice.invoiceStatus === 'FULLY PAID' ? 'FULLY PAID' : 'UNPAID';
    } else {
      if (jobDetail.additionalServiceId) {
        paymentStatus = totalCollectedAmount >= totalAmountService && collectedAdditionalAmount >= totalAdditionalAmount ? 'FULLY PAID' : 'UNPAID';
      } else {
        paymentStatus = totalCollectedAmount >= totalAmountService ? 'FULLY PAID' : 'UNPAID';
      }
    }

    dataTables = dataTables.map(value => {
      value.isDiscountVisible = serviceItemDiscountVisibility;
      return value;
    });

    dataAdditionalServiceItems = dataAdditionalServiceItems.map(value => {
      value.isDiscountVisible = serviceItemDiscountVisibility;
      return value;
    });

    const customFields: any[] = [];
    if (jobDetail.CustomFields != null) {
      jobDetail.CustomFields.map(val => {
        customFields.push({
          label: val.label,
          value: val.value
        });
      });
    }

    const jobStatus =
      jobDetail.jobStatus === JobStatus.IN_PROGRESS
        ? 'In Progress'
        : jobDetail.jobStatus.charAt(0).toUpperCase() + jobDetail.jobStatus.slice(1).toLowerCase();

    const contact = jobDetail.ContactPerson.find(contact => contact.isMain === true);

    const contractCollectedAmount = await JobDao.getTotalCollectedAmountByServiceId(row.serviceId);
    const totalContractAmount = row.totalAmountService ? row.totalAmountService : 0;
    const totalCollectedContractAmount = contractCollectedAmount ? contractCollectedAmount.collectedAmount : 0;
    const totalOutstandingContract = totalCollectedContractAmount > totalContractAmount ? 0 : totalContractAmount - totalCollectedContractAmount;

    let totalCollectedAdditionalAmount = 0;
    let totalAdditionalOustanding = 0;

    const additionalItems = await JobDao.getAdditionalItemsByServiceId(row.serviceId);

    if (additionalItems.length > 0) {
      await Promise.all(
        additionalItems.map(async value => {
          const additionalInvoice = await InvoiceService.getInvoiceByServiceId(Number(value.additionalServiceId));

          if (additionalInvoice) {
            const balance = additionalInvoice.invoiceAmount - additionalInvoice.collectedAmount;
            totalCollectedAdditionalAmount = totalCollectedAdditionalAmount + additionalInvoice.collectedAmount;
            totalAdditionalOustanding = totalAdditionalOustanding + balance;
          } else {
            const additional = await ServiceDao.getServiceDetailByIdForJob(Number(value.additionalServiceId));
            const collectedAdditionalAmount = value.additionalCollectedAmount || 0;
            const outStandingAdditionalAmount = (additional.totalAmount || 0) - collectedAdditionalAmount;
            totalCollectedAdditionalAmount = totalCollectedAdditionalAmount + collectedAdditionalAmount;
            totalAdditionalOustanding = totalAdditionalOustanding + outStandingAdditionalAmount;
          }
        })
      );
    }

    const totalOutstanding = totalOutstandingContract + totalAdditionalOustanding;

    const dataBinding = {
      id,
      logoUrl,
      clientName: jobDetail.clientName,
      serviceAddress: currentAddress,
      contactPerson: contact.contactPerson,
      contactNumber: `${contact.countryCode}${contact.contactNumber}`,
      startTime: convertStartTime,
      endTime: jobDetail.endDateTime,
      driverName: technician.join(', '),
      vehicleNumber: vehicle.join(', '),
      jobStatus: jobStatus,
      clientSignature: signatureUrl,
      jobNoteLabel: jobNotes.length > 0 ? 'Job Notes' : '',
      jobNotes: jobNotes,
      priceVisibility: priceVisibility,
      serviceItemDiscountVisibility,
      dataTables,
      jobAmount: jobAmount.toLocaleString('en-sg', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      discountVisiblity: discountAmount > 0 ? true : false,
      discountAmount: discountAmount.toLocaleString('en-sg', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      gstAmount: gstAmount ? gstAmount.toLocaleString('en-sg', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00',
      totalAmount: totalAmount.toLocaleString('en-sg', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      collectedAmount: jobCollectedAmount.toLocaleString('en-sg', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      paymentMethod: jobDetail.paymentMethod ? jobDetail.paymentMethod : '',
      paymentStatus,
      entityName: jobDetail.entityName,
      entityAddress: jobDetail.entityAddress,
      entityContactNumber,
      entityEmail: jobDetail.entityEmail,
      registerNumberGST: jobDetail.registerNumberGST && jobDetail.registerNumberGST != 'N.A' ? jobDetail.registerNumberGST : '-',
      uenNumber: jobDetail.uenNumber ? jobDetail.uenNumber : '-',
      additionalItem: dataAdditionalServiceItems.length > 0 ? 'Additional Items' : '',
      additionalTableHeader:
        dataAdditionalServiceItems.length > 0 ? [{ label1: 'Service Name', label2: 'Qty', label3: 'Unit Price', label4: 'Total Price' }] : [],
      dataAdditionalServiceItems,
      additionalAmount: additionalAmount.toLocaleString('en-sg', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      additionalGstAmount: additionalGstAmount.toLocaleString('en-sg', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      additionalDiscountAmount: additionalDiscountAmount.toLocaleString('en-sg', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      additionalDiscountVisiblity: additionalDiscountAmount > 0 ? true : false,
      totalAdditionalAmount: totalAdditionalAmount.toLocaleString('en-sg', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      collectedAdditionalAmount: collectedAdditionalAmount.toLocaleString('en-sg', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      checklistJobLabel: checklistJobs.length > 0 ? 'Subtask' : '',
      checklistJob: checklistJobs,
      gstTax,
      customFields: customFields,
      totalOutstanding: totalOutstanding ? totalOutstanding.toLocaleString('en-sg', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 0,
      chipsStatus:
        jobDetail.jobStatus === JobStatus.UNASSIGNED
          ? 'chips-unassigned'
          : jobDetail.jobStatus === JobStatus.ASSIGNED
          ? 'chips-assigned'
          : jobDetail.jobStatus === JobStatus.IN_PROGRESS
          ? 'chips-inprogress'
          : jobDetail.jobStatus === JobStatus.CONFIRMED
          ? 'chips-confirmed'
          : jobDetail.jobStatus === JobStatus.COMPLETED
          ? 'chips-completed'
          : jobDetail.jobStatus === JobStatus.CANCELLED
          ? 'chips-cancelled'
          : 'chips-paused',
      // hide contact number for specific tenants (e.g. 'southair')
      hideContactNumber: tenantKey ? tenantKey.toLowerCase().includes('southair') : false
    };

    const { EXECUTABLEPATH } = process.env;

    const puppeteerValue: any = {
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      // headless: 'new',
      maxConnections: 5
    };

    if (EXECUTABLEPATH) {
      puppeteerValue.executablePath = EXECUTABLEPATH;
    }

    const browser = await puppeteer.launch(puppeteerValue);

    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
    });
    page.setDefaultTimeout(50000);
    const htmlFile = fs.readFileSync(path.join(`${__dirname}/../reports/job/`, 'pdf.html'), 'utf-8');
    const template = handlebars.compile(htmlFile);
    const html = template(dataBinding);

    await page.setContent(html, {
      waitUntil: 'networkidle0'
    });

    const pdf = await page.pdf({
      format: 'a4',
      timeout: 0,
      preferCSSPageSize: true,
      printBackground: true
    });
    await page.close();
    await browser.close();
    return pdf;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const getJobDetailForWa = async (tenantKey: string, jobId: number): Promise<{ jobDetail: JobResponseModel }> => {
  LOG.debug('Update Job By WA');

  try {
    return await JobDao.getJobDetailForWa(tenantKey, jobId);
  } catch (err) {
    throw err;
  }
};

export const updateJobStatusByWa = async (tenantKey: string, jobId: number, jobStatus: string): Promise<{ row: JobResponseModel }> => {
  LOG.debug('Update Job By WA');

  try {
    return await JobDao.updateJobStatusByWa(tenantKey, jobId, jobStatus);
  } catch (err) {
    throw err;
  }
};

export const exportSchedule = async (
  jobDate: string,
  vehicleId?: number,
  employeId?: number,
  isRemarksShow?: boolean,
  isNotesShow?: boolean
): Promise<Buffer> => {
  try {
    const { DOMAIN } = process.env;
    let logoUrl = `https://${DOMAIN}/noimage.png`;
    let companyName = '';
    let companyAddress = '';
    let companyContactNumber = '';
    const scheduleDate = format(new Date(jobDate), 'EEEE, dd/MM/yyyy');

    const settings = await SettingDao.getSettings();
    if (settings) {
      await Promise.all(
        settings.map(async setting => {
          if (setting.label === 'CompanyImage') {
            logoUrl = await AwsService.s3BucketGetSignedUrl(setting.value);
          } else if (setting.label === 'CompanyName') {
            companyName = setting.value;
          } else if (setting.label === 'CompanyAddress') {
            companyAddress = setting.value;
          } else if (setting.label === 'CompanyContactNumber') {
            companyContactNumber = maskString(setting.value, '+65 #### ####');
          }
        })
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let dataTables: any[] = [];

    const rows = await JobDao.getJobSchedule(jobDate, vehicleId, employeId);
    if (rows) {
      await Promise.all(
        rows.map(async value => {
          const { row } = await JobDao.getJobDetailById(value.jobId);
          const totalJob = await JobDao.getTotalJobByServiceId(row.serviceId);
          const { jobSequence } = await JobDao.getJobSequence(row.jobId, row.serviceId);
          const employees = row.employee && row.employee.length > 0 ? row.employee.map(obj => obj.displayName).join(', ') : '-';
          const vehicles = row.vehicleJobs && row.vehicleJobs.length > 0 ? row.vehicleJobs.map(obj => obj.carplateNumber).join(', ') : '-';
          let additionalItem: ServiceItemResponseModel[] = [];
          if (value.additionalServiceId) {
            const additionalServiceItems = await ServiceItemDao.getServiceItemByServiceId(value.additionalServiceId);
            additionalItem = additionalServiceItems;
          } else {
            additionalItem = [];
          }

          const scheduleTime = `${format(new Date(value.startDateTime), 'EEE, dd/MM/yyyy hh:mm a')} -  ${format(
            new Date(value.endDateTime),
            'hh:mm a'
          )}`;

          let jobNotesData: any[] = [];
          const jobNotes = row.jobNotes;
          if (jobNotes) {
            await Promise.all(
              jobNotes.map(async value => {
                const media = await JobNoteMediaDao.getJobNoteMediaByJobNoteId(value.id);
                if (media.count == 0) {
                  const equipments = await EquipmentService.getEquipmentByJobNoteId(Number(value.id));
                  return jobNotesData.push({
                    id: value.id,
                    notes: value.notes,
                    jobNoteType: value.jobNoteType,
                    imageUrl: `https://${DOMAIN}/noimage.png`,
                    isHide: value.isHide,
                    Equipment: equipments,
                    employees: employees ? employees : '-'
                  });
                }
                await Promise.all(
                  media.rows.map(async row => {
                    if (row.fileName && row.fileType === 'image') {
                      row.fileName = await AwsService.s3BucketGetSignedUrl(row.fileName, 'jobs');
                    } else {
                      row.fileName = value.fileType === 'image' ? `https://${DOMAIN}/noimage.png` : `https://${DOMAIN}/videoimage.png`;
                    }

                    const equipments = await EquipmentService.getEquipmentByJobNoteId(Number(value.id));
                    return jobNotesData.push({
                      id: value.id,
                      notes: value.notes,
                      jobNoteType: value.jobNoteType,
                      imageUrl: row.fileName,
                      isHide: value.isHide,
                      Equipment: equipments,
                      employees: employees ? employees : '-'
                    });
                  })
                );
              })
            );
            jobNotesData = jobNotesData.sort((a, b) => a.id - b.id);
          }

          const CustomFields: any[] = [];
          if (value.CustomFields != null) {
            value.CustomFields.map(async field => {
              CustomFields.push({
                serviceId: Number(row.serviceId),
                label: field.label,
                value: field.value
              });
            });
          }

          //function to get colspan for row custom field
          const totalColumn = 2 + CustomFields.length;
          const colspan = 12 / totalColumn;

          dataTables.push({
            jobId: value.jobId,
            startDateTime: new Date(value.startDateTime),
            scheduleTime,
            remarks: value.remarks ? value.remarks : '-',
            serviceName: value.serviceName,
            clientName: value.clientName,
            clientRemarks: value.clientRemarks ? value.clientRemarks : '-',
            contactPerson: value.contactPerson,
            contactNumber: value.contactNumber,
            serviceAddress: value.serviceAddress,
            employees: employees ? employees : '-',
            vehicles: vehicles ? vehicles : '-',
            contractTitle: value.serviceName,
            jobStatus: value.jobStatus === 'IN_PROGRESS' ? 'IN PROGRESS' : value.jobStatus,
            invoiceNumber: value.invoiceNumber ? value.invoiceNumber : '-',
            ServiceItem: value.ServiceItem,
            AdditionalServiceItem: additionalItem,
            haveAdditionalItem: additionalItem.length > 0 ? true : false,
            isJobNotesEmpty: jobNotesData.length === 0 ? true : false,
            jobtNotes: jobNotesData,
            collectedAmount: row.collectedAmount
              ? row.collectedAmount.toLocaleString('en-sg', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
              : 0,
            paymentMethod: row.paymentMethod ? row.paymentMethod : 'UNPAID',
            isRemarksShow: isRemarksShow,
            isNotesShow: isNotesShow,
            totalJob: totalJob ? totalJob : 0,
            sequenceJob: jobSequence ? Number(jobSequence) : 0,
            customFields: CustomFields,
            colspan
          });
        })
      );
      dataTables = dataTables.sort((a, b) => a.startDateTime - b.startDateTime);
    }

    const dataBinding = { logoUrl, companyName, companyAddress, companyContactNumber, scheduleDate, dataTables };

    const { EXECUTABLEPATH } = process.env;

    const puppeteerValue: any = {
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      // headless: 'new',
      maxConnections: 5
    };

    if (EXECUTABLEPATH) {
      puppeteerValue.executablePath = EXECUTABLEPATH;
    }

    const browser = await puppeteer.launch(puppeteerValue);

    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
    });
    page.setDefaultTimeout(50000);
    const htmlFile = fs.readFileSync(path.join(`${__dirname}/../reports/schedule/`, 'pdf.html'), 'utf-8');
    const template = handlebars.compile(htmlFile);
    const html = template(dataBinding);

    await page.setContent(html, {
      waitUntil: 'networkidle0'
    });

    const pdf = await page.pdf({
      format: 'a4',
      timeout: 0,
      preferCSSPageSize: true,
      printBackground: true,
      landscape: true
    });
    await page.close();
    await browser.close();
    return pdf;
  } catch (err) {
    console.log(err);
  }
};

export const assignContract = async (query: JobBody): Promise<void> => {
  LOG.debug('Assign Contract');

  try {
    const { serviceId, selectedVehicles, selectedEmployees, isAssignFirstJob } = query;
    const jobs = await JobDao.getJobByServiceId(serviceId, 'UNASSIGNED');

    if (isAssignFirstJob) {
      const firstJob = jobs[0];
      const jobDetail = await JobDao.getJobById(firstJob.id);
      const { row } = await JobDao.getJobDetailById(firstJob.id);

      await jobDetail.update({ jobStatus: 'ASSIGNED' });

      if (selectedVehicles && selectedVehicles.length > 0) {
        await VehicleJobDao.deleteData(firstJob.id);
        // eslint-disable-next-line
        const vehicleJobData: any[] = [];
        // eslint-disable-next-line
        selectedVehicles.map((value: any) => {
          vehicleJobData.push({ vehicleId: value.id, jobId: firstJob.id });
        });

        await VehicleJobDao.create(vehicleJobData);
      } else {
        if (firstJob.jobStatus === JobStatus.UNASSIGNED || firstJob.jobStatus === JobStatus.CONFIRMED) {
          await VehicleJobDao.deleteData(firstJob.id);
        }
      }

      if (selectedEmployees && selectedEmployees.length > 0) {
        await UserProfileJobDao.deleteData(firstJob.id);
        // eslint-disable-next-line
        const userProfileJobData: any[] = [];
        // eslint-disable-next-line
        selectedEmployees.map(async (value: any) => {
          userProfileJobData.push({ userProfileId: value.id, jobId: firstJob.id });
          const currentUser = await UserProfileDao.getById(value.id);
          const employeeName = currentUser.getDataValue('displayName');
          const tokenNotification = currentUser.getDataValue('token');
          const address = row.serviceAddress;
          if (tokenNotification) {
            const message = {
              title: 'New Job Assigned',
              body: `Hi ${employeeName}, you have a new job assigned to you on ${jobDetail.startDateTime} at ${address}. Please check job details for more information.`
            };

            await Notification.sendTechnicianNotif(tokenNotification, message, {
              jobId: String(firstJob.id),
              jobType: row.serviceType,
              jobStatus: 'ASSIGNED',
              startDateTime: firstJob.startDateTime.toString()
            });
            FirestoreService.fetchUser(value);
          }
        });

        await UserProfileJobDao.create(userProfileJobData);
      } else {
        if (firstJob.jobStatus === JobStatus.UNASSIGNED || firstJob.jobStatus === JobStatus.CONFIRMED) {
          await UserProfileJobDao.deleteData(firstJob.id);
        }
      }
    } else {
      await Promise.all(
        jobs.map(async job => {
          const jobDetail = await JobDao.getJobById(job.id);
          const { row } = await JobDao.getJobDetailById(job.id);

          await jobDetail.update({ jobStatus: 'ASSIGNED' });

          if (selectedVehicles && selectedVehicles.length > 0) {
            await VehicleJobDao.deleteData(job.id);
            // eslint-disable-next-line
            const vehicleJobData: any[] = [];
            // eslint-disable-next-line
            selectedVehicles.map((value: any) => {
              vehicleJobData.push({ vehicleId: value.id, jobId: job.id });
            });

            await VehicleJobDao.create(vehicleJobData);
          } else {
            if (job.jobStatus === JobStatus.UNASSIGNED || job.jobStatus === JobStatus.CONFIRMED) {
              await VehicleJobDao.deleteData(job.id);
            }
          }

          if (selectedEmployees && selectedEmployees.length > 0) {
            await UserProfileJobDao.deleteData(job.id);
            // eslint-disable-next-line
            const userProfileJobData: any[] = [];
            // eslint-disable-next-line
            selectedEmployees.map(async (value: any) => {
              userProfileJobData.push({ userProfileId: value.id, jobId: job.id });
              const currentUser = await UserProfileDao.getById(value.id);
              const employeeName = currentUser.getDataValue('displayName');
              const tokenNotification = currentUser.getDataValue('token');
              const address = row.serviceAddress;
              if (tokenNotification) {
                const message = {
                  title: 'New Job Assigned',
                  body: `Hi ${employeeName}, you have a new job assigned to you on ${jobDetail.startDateTime} at ${address}. Please check job details for more information.`
                };

                await Notification.sendTechnicianNotif(tokenNotification, message, {
                  jobId: String(job.id),
                  jobType: row.serviceType,
                  jobStatus: 'ASSIGNED',
                  startDateTime: job.startDateTime.toString()
                });
                FirestoreService.fetchUser(value);
              }
            });

            await UserProfileJobDao.create(userProfileJobData);
          } else {
            if (job.jobStatus === JobStatus.UNASSIGNED || job.jobStatus === JobStatus.CONFIRMED) {
              await UserProfileJobDao.deleteData(job.id);
            }
          }
        })
      );
    }

    return;
  } catch (err) {
    throw err;
  }
};

export const updateJobServiceItems = async (jobId: number, serviceItems: ServiceItem[]): Promise<{ row: JobResponseModel }> => {
  LOG.debug('Editing Job Service Items');

  try {
    for (const value of serviceItems) {
      if (value.isDeleted) {
        await ServiceItemDao.deleteServiceItemById(value.id);
      }
      if (value.id === 0 || value.id == null) {
        const createdItem = await ServiceItemDao.createServiceItem(value);
        await ServiceItemJobDao.createWithoutTransaction([{ serviceItemId: createdItem.id, jobId: jobId }]);
        //saving service item with equipment
        if (value.Equipments && value.Equipments.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const serviceItemEquipment: any[] = [];
          Promise.all(
            value.Equipments.map(val => {
              return serviceItemEquipment.push({ serviceItemId: createdItem.id, equipmentId: val.id });
            })
          );

          await ServiceItemEquipmentDao.create(serviceItemEquipment);
        }
      } else {
        const item = await ServiceItemDao.getServiceItemById(value.id);
        item.update({
          name: value.name,
          description: value.description,
          quantity: value.quantity,
          unitPrice: value.unitPrice,
          discountAmt: value.discountAmt,
          totalPrice: Number(value.totalPrice).toFixed(2),
          idQboWithGST: value.idQboWithGST ? value.idQboWithGST : null,
          IdQboWithoutGST: value.IdQboWithoutGST ? value.IdQboWithoutGST : null
        });

        if (value.Equipments && value.Equipments.length > 0) {
          await ServiceItemEquipmentDao.deleteDataByServiceItemId(value.id);
          const serviceItemEquipment: any[] = [];
          Promise.all(
            value.Equipments.map(val => {
              return serviceItemEquipment.push({ serviceItemId: value.id, equipmentId: val.id });
            })
          );

          await ServiceItemEquipmentDao.create(serviceItemEquipment);
        }
      }
    }

    const { row } = await getJobDetailById(jobId);
    const service = await ServiceDao.getServiceById(row.serviceId);
    const invoice = await InvoiceDao.getInvoiceByServiceId(row.serviceId);
    const newServiceItems = await ServiceItemDao.getServiceItemByServiceId(row.serviceId);

    const needGST = service.needGST;
    let originalAmount = 0;
    const discountAmount = service.discountAmount;
    const gst = (service.gstTax || 0) / 100;
    let gstAmount = 0;
    let totalAmount = 0;

    if (newServiceItems && newServiceItems.length > 0) {
      newServiceItems.map(value => {
        return (originalAmount = Number((originalAmount + Number(value.totalPrice)).toFixed(2)));
      });
    }

    totalAmount = Number((originalAmount - discountAmount).toFixed(2));
    if (needGST) {
      gstAmount = Number((totalAmount * gst).toFixed(2));
      totalAmount = Number((totalAmount + gstAmount).toFixed(2));
    }

    service.update({
      originalAmount,
      discountAmount,
      gstAmount,
      totalAmount
    });

    if (invoice) {
      invoice.update({
        invoiceAmount: totalAmount,
        updateInvoice: new Date()
      });
    }

    return await getJobDetailById(jobId);
  } catch (err) {
    throw err;
  }
};

export const cancelJob = async (id: number, isRecalculate: boolean): Promise<{ row: JobResponseModel }> => {
  LOG.debug('Editing Job with recalculate or not');

  const job = await JobDao.getJobById(id);
  let isInvoiceExist = false;

  const mainInvoice = await InvoiceDao.getInvoiceByServiceId(Number(job.getDataValue('serviceId')));
  let additionalInvoice = null;
  if (job.getDataValue('additionalServiceId')) {
    additionalInvoice = await InvoiceDao.getInvoiceByServiceId(Number(job.getDataValue('additionalServiceId')));
  }

  if (!job) {
    throw new JobNotFoundError(id);
  }
  try {
    if (job.jobStatus === JobStatus.ASSIGNED) {
      const detailJob = await getJobDetailById(id);
      const selectedEmployees = await UserProfileJobDao.getByJobId(id);
      if (selectedEmployees && selectedEmployees.length > 0) {
        // eslint-disable-next-line
        selectedEmployees.map(async (value: any) => {
          const currentUser = await UserProfileDao.getById(value.userProfileId);
          const employeeName = currentUser.getDataValue('displayName');
          const tokenNotification = currentUser.getDataValue('token');
          const address = detailJob.row.serviceAddress;
          if (tokenNotification) {
            const message = {
              title: 'New Job cancelled',
              body: `Hi ${employeeName}, your assigned job on ${detailJob.row.startDateTime} at ${address} has been cancelled. Please contact admin for more information.`
            };

            await Notification.sendTechnicianNotif(tokenNotification, message, {
              jobId: String(id),
              jobType: detailJob.row.serviceType,
              jobStatus: 'CANCELLED',
              startDateTime: detailJob.row.startDateTime
            });
          }
        });
      }
    }

    if (mainInvoice) {
      isInvoiceExist = true;
      await job.update({ jobStatus: JobStatus.CANCELLED });
      const jobDetail = await getJobDetailById(id);
      const newJobDetail = { row: jobDetail.row, isInvoiceExist: isInvoiceExist };

      return newJobDetail;
    }

    if (additionalInvoice) {
      isInvoiceExist = true;
      await job.update({ jobStatus: JobStatus.CANCELLED });
      const jobDetail = await getJobDetailById(id);
      const newJobDetail = { row: jobDetail.row, isInvoiceExist: isInvoiceExist };

      return newJobDetail;
    }

    if (isRecalculate) {
      const { row } = await getJobDetailById(id);
      const jobDetail = row;
      const service = await ServiceService.getServiceDetailById(jobDetail.serviceId);

      const serviceItems = jobDetail.ServiceItem;

      Promise.all(
        serviceItems.map(async value => {
          const item = await ServiceItemDao.getServiceItemById(value.id);
          item.update({ quantity: 0, unitPrice: 0, discountAmt: 0, totalPrice: 0 });
        })
      );

      const jobAmount = row.jobAmount || 0;
      const contractAmount = row.originalAmountService || 0;
      const discountAmount = row.discountAmount || 0;
      const needGST = row.needGST || false;
      const gst = (row.gstTax || 0) / 100;
      let newOriginalAmount = 0;
      let newGstAmount = 0;
      let newTotalAmount = 0;

      newOriginalAmount = Number((contractAmount - jobAmount).toFixed(2));
      newTotalAmount = Number((contractAmount - jobAmount - discountAmount).toFixed(2));
      if (needGST) {
        newGstAmount = Number((newTotalAmount * gst).toFixed(2));
        newTotalAmount = Number((newTotalAmount + newGstAmount).toFixed(2));
      }

      service.update({ originalAmount: newOriginalAmount, gstAmount: newGstAmount, totalAmount: newTotalAmount });
    }
    await job.update({ jobStatus: JobStatus.CANCELLED, isSynchronize: false });
    const jobDetail = await getJobDetailById(id);
    const newJobDetail = { row: jobDetail.row, isInvoiceExist: isInvoiceExist };
    const row = jobDetail.row;

    return newJobDetail;
  } catch (err) {
    throw err;
  }
};

export const sendEmail = async (id: number, contactPerson?: string[]): Promise<void> => {
  try {
    const { row } = await getJobDetailById(id);
    const jobDetail = row;

    const jobDateTime = `${format(new Date(jobDetail.startDateTime), 'dd-MM-yyyy hh:mm a')} - ${format(
      new Date(jobDetail.endDateTime),
      'dd-MM-yyyy hh:mm a'
    )}`;
    const serviceAddress = jobDetail.serviceAddress.split(', ');
    const firstLineAddress = `${serviceAddress[0] || ''}, ${serviceAddress[1] || ''}`;
    const secondLineAddress = `#${jobDetail.serviceFloorNo}-${jobDetail.serviceUnitNo}, Singapore ${jobDetail.postalCode}`;
    const address = `${serviceAddress[0] || ''}, ${serviceAddress[1] || ''}, #${jobDetail.serviceFloorNo}-${jobDetail.serviceUnitNo}, Singapore ${
      jobDetail.postalCode
    }`;

    const entityAddress = jobDetail.entityAddress || '';
    const splitEntityAddress = entityAddress.split(',');
    const newEntityAddress =
      splitEntityAddress.length > 1
        ? `${splitEntityAddress[0]}, ${splitEntityAddress[1]}, Singapore, ${splitEntityAddress[2]}`
        : `${splitEntityAddress[0]}, Singapoore`;

    const jobReportFile = await exportPdf(id);

    const contactEmail = contactPerson ? contactPerson : [];

    let logoUrl;
    if (jobDetail.entityLogo) {
      logoUrl = await AwsService.s3BucketGetSignedUrl(jobDetail.entityLogo, 'entities');
    }

    const { jobSequence } = await JobDao.getJobSequence(row.jobId, row.serviceId);
    const template = await SettingService.getSpecificSettings('JOBEMAILTEMPLATE', 'JobEmailTemplate');

    const contacts: any = [];
    const serviceContact = await ServiceContactDao.getByserviceId(jobDetail.serviceId);
    jobDetail.ContactPerson.map(val => {
      const matchingServiceContact = serviceContact.find(contact => contact.contactPersonId === val.id);
      if (matchingServiceContact) {
        contacts.push(val.contactPerson);
      }
    });

    const replacementValues: Record<string, string> = {
      clientName: jobDetail.clientName,
      contactPerson: contacts.join(', '),
      jobDateTime: jobDateTime,
      serviceAddress: address,
      jobSequence: jobSequence ? jobSequence : 0,
      jobAmount: jobDetail.jobAmount ? `$${jobDetail.jobAmount}` : '$0'
    };

    const emailBody = template.value.replace(/{([^}]+)}/g, (match, placeholder) => {
      return replacementValues[placeholder] || match;
    });

    const sendEmail = await EmailService.sendJobCompletedEmail(
      jobDetail.jobId,
      jobDetail.entityName,
      jobDetail.clientName,
      jobDateTime,
      firstLineAddress,
      secondLineAddress,
      contactEmail,
      jobReportFile,
      logoUrl,
      jobDetail.entityEmail,
      `${jobDetail.entityCountryCode}${jobDetail.entityContactNumber}`,
      newEntityAddress,
      emailBody
    );

    return sendEmail;
  } catch (err) {
    throw err;
  }
};

export const exportCsv = async (query: JobQueryParams): Promise<any[]> => {
  LOG.debug('Searching job with Pagination');

  const { rows } = await JobDao.exportCsv(query);

  const results: JobCsvData[] = [];

  if (rows) {
    await Promise.all(
      rows.map(async row => {
        let jobAmount = 0;
        let jobGstAmount = 0;
        let jobTotalAmount = 0;
        let additionalAmount = 0;
        let additionalDiscountAmount = 0;
        let additionalGstAmount = 0;
        let additionalTotalAmount = 0;
        const totalJob = row.totalJob ? row.totalJob : 0;
        const jobDiscountAmount = Number((row.discountAmount / totalJob).toFixed(2));
        const needGST = row.needGST;
        const gst = (row.serviceGstTax || 0) / 100;
        const serviceItemsList: any[] = [];
        const serviceItemsQtyList: any[] = [];
        const serviceItemsPriceList: any[] = [];
        const serviceItemsDescList: any[] = [];
        const additionalServiceItemsList: any = [];
        const additionalServiceItemsDescriptionList: any = [];
        const additionalServiceItemsQtyList: any = [];
        const additionalServiceItemsPriceList: any = [];

        if (row.ServiceItem) {
          for (const item of row.ServiceItem) {
            const discountPrice = item.discountAmt || 0;
            const totalPrice = item.quantity * Number(item.unitPrice) - discountPrice;
            jobAmount += Number(totalPrice.toFixed(2));
            serviceItemsList.push(`${item.name}`);
            serviceItemsPriceList.push(`${Number(item.unitPrice).toFixed(2)}`);
            serviceItemsQtyList.push(`${item.quantity}`);
            serviceItemsDescList.push(`${item.description}`);
          }
        }

        if (row.additionalServiceId) {
          additionalDiscountAmount = row.additionalDiscountAmount;
          row.additionalInvoiceNumber = row.additionalInvoiceNumber ? row.additionalInvoiceNumber : '-';
          row.additionalInvoiceStatus = row.additionalInvoiceStatus ? row.additionalInvoiceStatus : '-';
        }

        if (row.AdditionalServiceItem) {
          for (const item of row.AdditionalServiceItem) {
            const discountPrice = item.discountAmt || 0;
            const totalPrice = item.quantity * Number(item.unitPrice) - discountPrice;
            additionalAmount += Number(totalPrice.toFixed(2));
            additionalServiceItemsList.push(`${item.name}`);
            additionalServiceItemsDescriptionList.push(`${item.description}`);
            additionalServiceItemsPriceList.push(`${Number(item.unitPrice).toFixed(2)}`);
            additionalServiceItemsQtyList.push(`${item.quantity}`);
          }
        }

        if (needGST) {
          const newJobAmount = Number((jobAmount - jobDiscountAmount).toFixed(2));
          jobGstAmount = Number((newJobAmount * gst).toFixed(2));
          jobTotalAmount = Number((newJobAmount + jobGstAmount).toFixed(2));

          const newAdditionalAmount = Number((additionalAmount - additionalDiscountAmount).toFixed(2));
          additionalGstAmount = Number((newAdditionalAmount * gst).toFixed(2));
          additionalTotalAmount = Number((newAdditionalAmount + additionalGstAmount).toFixed(2));
        } else {
          jobTotalAmount = Number((jobAmount - jobDiscountAmount).toFixed(2));
          additionalTotalAmount = Number((additionalAmount - additionalDiscountAmount).toFixed(2));
        }

        if (row.JobExpenses) {
          const items: string[] = [];
          for (const item of row.JobExpenses) {
            if (item.JobExpensesItems) {
              for (const vl of item.JobExpensesItems) {
                items.push(`${vl.itemName} : $${vl.price.toFixed(2)}`);
              }
            }
          }
          row.expensesItems = items.length > 0 ? items.join(', ') : '-';
        }

        let actualDuration = 0;
        if (row.jobHistories) {
          const historyStartTime = row.jobHistories.find((value: any) => value.jobStatus === 'IN_PROGRESS');
          const historyEndTime = row.jobHistories.find((value: any) => value.jobStatus === 'COMPLETED');
          const startDate = historyStartTime ? new Date(historyStartTime.dateTime) : null;
          const endDate = historyEndTime ? new Date(historyEndTime.dateTime) : null;
          row.actualStartTime = startDate ? format(startDate, 'dd-MM-yyyy hh:mm a') : '-';
          row.actualEndTime = endDate ? format(endDate, 'dd-MM-yyyy hh:mm a') : '-';
          if (startDate && endDate && !isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
            actualDuration = Math.max(Math.floor((endDate.getTime() - startDate.getTime()) / 60000), 1);
          }
        }

        results.push({
          jobId: row.jobId,
          clientName: row.clientName,
          serviceName: row.serviceName,
          jobStatus: row.jobStatus,
          jobType: row.serviceType,
          jobDate: format(new Date(row.startDateTime), 'dd-MM-yyyy'),
          startTime: `${format(new Date(`${row.startDateTime}`), 'dd-MM-yyyy hh:mm a')}`,
          endTime: `${format(new Date(`${row.endDateTime}`), 'dd-MM-yyyy hh:mm a')}`,
          actualStartTime: row.actualStartTime ? row.actualStartTime : '-',
          actualEndTime: row.actualEndTime ? row.actualEndTime : '-',
          actualDuration: actualDuration > 0 ? `${actualDuration}` : '-',
          serviceAddress: row.serviceAddress,
          assignedVehicle: row.vehicles ? row.vehicles.join(', ') : '-',
          assignedEmployee: row.employees ? row.employees.join(', ') : '-',
          serviceType: row.serviceType,
          invoiceNumber: row.invoiceNumber || '-',
          invoiceStatus: row.invoiceStatus || '-',
          additionalInvoiceNumber: row.additionalInvoiceNumber || '-',
          additionalInvoiceStatus: row.additionalInvoiceStatus || '-',
          totalServiceAmount: Number(row.totalServiceAmount ? row.totalServiceAmount.toFixed(2) : 0),
          jobAmount: Number(jobAmount ? jobAmount.toFixed(2) : 0),
          jobDiscountAmount: Number(jobDiscountAmount ? jobDiscountAmount.toFixed(2) : 0),
          jobGstAmount: Number(jobGstAmount ? jobGstAmount.toFixed(2) : 0),
          totalJobAmount: Number(jobTotalAmount ? jobTotalAmount.toFixed(2) : 0),
          additionalAmount: Number(additionalAmount ? additionalAmount.toFixed(2) : 0),
          additionalDiscountAmount: Number(additionalDiscountAmount ? additionalDiscountAmount.toFixed(2) : 0),
          additionalGstAmount: Number(additionalGstAmount ? additionalGstAmount.toFixed(2) : 0),
          totalAdditionalAmount: Number(additionalTotalAmount ? additionalTotalAmount.toFixed(2) : 0),
          totalAdditionalAmountBeforeGst: Number((additionalAmount - additionalDiscountAmount).toFixed(2)),
          totalJobAndAdditionalAmount: Number((jobTotalAmount + additionalTotalAmount).toFixed(2)),
          collectedAmount: Number(row.jobCollectedAmount ? row.jobCollectedAmount.toFixed(2) : 0),
          additionalCollectedAmount: Number(row.additionalCollectedAmount ? row.additionalCollectedAmount.toFixed(2) : 0),
          serviceItems: serviceItemsList.length > 0 ? serviceItemsList.join(', ') : '-',
          serviceItemsDescription: serviceItemsDescList.length > 0 ? serviceItemsDescList.join(', ') : '-',
          serviceItemsQty: serviceItemsQtyList.length > 0 ? serviceItemsQtyList.join(', ') : '-',
          serviceItemsPrice: serviceItemsPriceList.length > 0 ? serviceItemsPriceList.join(', ') : '-',
          additionalServiceItems: additionalServiceItemsList.length > 0 ? additionalServiceItemsList.join(', ') : '-',
          additionalServiceItemsDescription:
            additionalServiceItemsDescriptionList.length > 0 ? additionalServiceItemsDescriptionList.join(', ') : '-',
          additionalServiceItemsQty: additionalServiceItemsQtyList.length > 0 ? additionalServiceItemsQtyList.join(', ') : '-',
          additionalServiceItemsPrice: additionalServiceItemsPriceList.length > 0 ? additionalServiceItemsPriceList.join(', ') : '-',
          totalCompletedJobs: row.doneJob ? row.doneJob : 0,
          totalJob: totalJob,
          paymentMethod:
            Number((jobTotalAmount + additionalTotalAmount).toFixed(2)) === 0 ? 'Not Chargeable' : row.paymentMethod ? row.paymentMethod : '-',
          expensesItems: row.expensesItems ? row.expensesItems : '-',
          salesPerson: row.salesPerson ? row.salesPerson : '-',
          agentName: row.agentName ? row.agentName : '-',
          entityName: row.entityName ? row.entityName : '-',
          customFieldLabel1: row.CustomFields?.[0]?.label || '-',
          customFieldValue1: row.CustomFields?.[0]?.value || '-',
          customFieldLabel2: row.CustomFields?.[1]?.label || '-',
          customFieldValue2: row.CustomFields?.[1]?.value || '-',
          contactPerson: row.contactPerson || '-',
          contactNumber: `${row.contactCountryCode || ''} ${row.contactNumber || '-'}`,
          contactEmail: row.contactEmail || '-',
          billingAddress: row.billingAddress || '-'
        });
      })
    );
  }

  return results;
};

export const getLastJob = async (): Promise<any> => {
  LOG.debug('Get last job');

  const { id } = await JobDao.getLastId();
  const { row } = await getJobDetailById(id);
  const jobDetail = row;

  const jobDateTime = `${format(new Date(jobDetail.startDateTime), 'dd-MM-yyyy hh:mm a')} - ${format(
    new Date(jobDetail.endDateTime),
    'dd-MM-yyyy hh:mm a'
  )}`;
  const serviceAddress = jobDetail.serviceAddress.split(', ');
  const address = `${serviceAddress[0] || ''}, ${serviceAddress[1] || ''}, #${jobDetail.serviceFloorNo}-${jobDetail.serviceUnitNo}, Singapore ${
    jobDetail.postalCode
  }`;

  const entityAddress = jobDetail.entityAddress || '';
  const splitEntityAddress = entityAddress.split(',');
  const newEntityAddress =
    splitEntityAddress.length > 1
      ? `${splitEntityAddress[0]}, ${splitEntityAddress[1]}, Singapore, ${splitEntityAddress[2]}`
      : `${splitEntityAddress[0]}, Singapoore`;

  // const contact = jobDetail.ContactPerson.find(contact => contact.isMain == true);
  const contacts: any = [];
  const serviceContact = await ServiceContactDao.getByserviceId(row.serviceId);
  row.ContactPerson.map(val => {
    const matchingServiceContact = serviceContact.find(contact => contact.contactPersonId === val.id);
    if (matchingServiceContact) {
      contacts.push(val.contactPerson);
    }
  });

  let logoUrl;
  if (jobDetail.entityLogo) {
    logoUrl = await AwsService.s3BucketGetSignedUrl(jobDetail.entityLogo, 'entities');
  }

  const { jobSequence } = await JobDao.getJobSequence(row.jobId, row.serviceId);

  const rows = {
    jobId: jobDetail.jobId,
    clientName: jobDetail.clientName,
    entityName: jobDetail.entityName,
    jobDateTime: jobDateTime,
    serviceAddress: address,
    contactPerson: contacts.join(', '),
    logoUrl: logoUrl ? logoUrl : null,
    entityEmail: jobDetail.entityEmail,
    entityContactNumber: `${jobDetail.entityCountryCode}${jobDetail.entityContactNumber}`,
    entityAddress: newEntityAddress,
    jobAmount: jobDetail.jobAmount ? `$${jobDetail.jobAmount}` : '$0',
    jobSequence: jobSequence ? Number(jobSequence) : 0
  };

  return rows;
};

export const addJobSignature = async (jobId: number, signature: string): Promise<any> => {
  LOG.debug('Add Job Signature');

  const job = await JobDao.getJobById(jobId);

  return await job.update({ signature });
};

export const hasJobsInProgressByClientId = async (clientId: number): Promise<boolean> => {
  return await JobDao.hasJobsInProgressByClientId(clientId);
};

export const hasJobsInProgressByServiceId = async (serviceId: number): Promise<boolean> => {
  return await JobDao.hasJobsInProgressByServiceId(serviceId);
};

export const summaryJobCount = async (): Promise<any> => {
  LOG.debug('Summary job count');
  try {
    const today = format(new Date(), 'yyyy-MM-dd');
    const unassigned = await JobDao.jobInformation(today, today, JobStatus.UNASSIGNED, true);
    const assigned = await JobDao.jobInformation(today, today, JobStatus.ASSIGNED, true);
    const confirmed = await JobDao.jobInformation(today, today, JobStatus.CONFIRMED, true);
    const inprogress = await JobDao.jobInformation(today, today, JobStatus.IN_PROGRESS, true);
    const completed = await JobDao.jobInformation(today, today, JobStatus.COMPLETED, true);
    const cancelled = await JobDao.jobInformation(today, today, JobStatus.CANCELLED, true);
    const result = {
      unassignedCount: unassigned ? Number(unassigned.count) : 0,
      confirmedCount: confirmed ? Number(confirmed.count) : 0,
      assignedCount: assigned ? Number(assigned.count) : 0,
      inprogressCount: inprogress ? Number(inprogress.count) : 0,
      completedCount: completed ? Number(completed.count) : 0,
      cancelledCount: cancelled ? Number(cancelled.count) : 0
    };
    return result;
  } catch (err) {
    throw err;
  }
};

export const updateSyncStatus = async (
  jobIds: number[],
  syncId?: number,
  startDateTime?: Date | string,
  endDateTime?: Date | string,
  jobStatus?: string
): Promise<void> => {
  LOG.debug('Update sync status and syncId for multiple jobs');

  await Promise.all(
    jobIds.map(async jobId => {
      const job = await JobDao.getJobById(jobId);
      await job.update({ isSynchronize: true, syncId, startDateTime, endDateTime, jobStatus });
    })
  );
};

export const getLastInProgressJobByUserProfileId = async (userId: number): Promise<any> => {
  const jobHistory = await JobHistoryDao.getLastInProgressJobIdByUserProfileId(userId);
  const jobId = jobHistory ? jobHistory.jobId : null;
  if (jobId) {
    const { row } = await JobDao.getJobDetailById(jobId);
    if (row && row.jobStatus == JobStatus.IN_PROGRESS) {
      return row;
    }
  }
};

export const getJobBySyncId = async (syncId: number): Promise<any> => {
  LOG.debug('Get job by syncId');

  const job = await JobDao.getJobBySyncId(syncId);

  if (!job) {
    return { job: null };
  }

  return job;
};

export const getPreviousJobsByClientId = async (query: JobQueryParams): Promise<any[]> => {
  LOG.debug('Get previous jobs by clientId');

  const jobs = await JobDao.getPreviousJobsByClient(query);

  return jobs;
};
