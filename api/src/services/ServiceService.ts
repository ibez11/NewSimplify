/* eslint-disable @typescript-eslint/no-explicit-any */
import Logger from '../Logger';
import * as ServiceDao from '../database/dao/ServiceDao';
import * as InvoiceDao from '../database/dao/InvoiceDao';
import * as JobDao from '../database/dao/JobDao';
import * as ServiceItemDao from '../database/dao/ServiceItemDao';
import * as ServiceSkillDao from '../database/dao/ServiceSkillDao';
import * as ServiceItemJobDao from '../database/dao/ServiceItemJobDao';
import * as ScheduleDao from '../database/dao/ScheduleDao';
import * as ChecklistJobDao from '../database/dao/ChecklistJobDao';
import * as ChecklistJobItemDao from '../database/dao/ChecklistJobItemDao';
import * as JobLabelDao from '../database/dao/JobLabelDao';
import * as ServiceItemEquipmentDao from '../database/dao/ServiceItemEquipmentDao';
import * as AwsService from './AwsService';
import * as SettingService from './SettingService';
import * as EquipmentService from './EquipmentService';
import * as GstTemplateService from './GstTemplateService';
import * as EmailService from './EmailService';
import * as CustomFieldDao from '../database/dao/CustomFieldDao';
import * as ContactPersonDao from '../database/dao/ContactPersonDao';
import * as ServiceContactDao from '../database/dao/ServiceContactDao';
import * as UserProfileDao from '../database/dao/UserProfileDao';
import * as UserProfileJobDao from '../database/dao/UserProfileJobDao';
import * as ServiceTemplateDao from '../database/dao/ServiceTemplateDao';
import * as VehicleJobDao from '../database/dao/VehicleJobDao';
import * as ClientService from './ClientService';

import { sequelize } from '../config/database';
import { ServiceTypes, ServiceStatus, DiscountTypes } from '../database/models/Service';
import Job, { JobStatus } from '../database//models/Job';
import { InvoiceStatus } from '../database/models/Invoice';
import Schedule, { RepeatType } from '../database/models/Schedule';
import ChecklistJob from '../database/models/ChecklistJob';
import Service from '../database/models/Service';
import JobLabel from '../database/models/JobLabel';
import ServiceItem from '../database/models/ServiceItem';
import {
  ServiceResponseModel,
  ServiceSkillResponseModel,
  JobGenerateResponseModel,
  ContractCsvResponseModel,
  CustomFieldResponseModel,
  ContactPersonResponseModel
} from '../typings/ResponseFormats';

import ServiceNotFoundError from '../errors/ServiceNotFoundError';
import ServiceNotEditableError from '../errors/ServiceNotEditableError';
import ServiceItemNotFoundError from '../errors/ServiceItemNotFoundError';
import ServiceHaveInProgessJobError from '../errors/ServiceHaveInProgessJobError';
import JobNotFoundError from '../errors/JobNotFoundError';

import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';
import { format, addDays, isSameDay, getDay, differenceInMonths, addMonths, addYears } from 'date-fns';

import { scheduling, publicHolidays } from '../utils';
import { ServiceQueryParams } from '../typings/params/ServiceQueryParams';
import { ServiceBody } from '../typings/body/ServiceBody';
import * as InvoiceService from './InvoiceService';
import puppeteer from 'puppeteer';
import ClientAttributes from '../typings/attributes/ClientAttributes';
import * as Notification from './NotificationService';
import JobHaveOtherInProgressError from '../errors/JobHaveOtherInProgressError';
import HaveUnpaidInvoicesError from '../errors/HaveUnpaidInvoicesError';
import { PdfTemplateOptionsBody } from '../typings/body/PdfTemplateOptionsBody';
import * as PdfTemplateOptionsService from './PdfTemplateOptionsService';

const LOG = new Logger('ServiceService.ts');

/**
 * Search service with query and optional pagination
 *
 * @param query interface of service query params
 *
 * @returns the total counts and the data for current page
 */
export const searchServicesWithPagination = async (query: ServiceQueryParams): Promise<{ rows: ServiceResponseModel[]; count: number }> => {
  LOG.debug('Searching Services with Pagination');

  const { rows, count } = await ServiceDao.getPaginated(query);

  await Promise.all(
    rows.map(async res => {
      if (res.invoiceId) {
        res.collectedAmount = Number(res.invoiceCollectedAmount);
      } else {
        const { collectedAmount } = await JobDao.getTotalCollectedAmountByServiceId(res.id);
        res.collectedAmount = collectedAmount;
      }

      const serviceItems = await ServiceItemDao.getServiceItemByServiceId(res.id);
      res.ServiceItems = serviceItems.sort((a, b) => a.id - b.id);

      const { rows } = await ContactPersonDao.getByClientId(res.clientId);
      const contact = rows.find(contact => contact.isMain === true);
      res.contactNumber = contact.contactNumber;
      res.countryCode = contact.countryCode;
      res.JobLabels = await JobLabelDao.getJobLabelByServiceId(res.id);
    })
  );

  return { rows, count };
};

/**
 * Search service with query and optional pagination
 *
 * @param query interface of service query params
 *
 * @returns the total counts and the data for current page
 */
export const exportCsv = async (query: ServiceQueryParams): Promise<any[]> => {
  LOG.debug('Searching Services with Pagination');

  const { rows } = await ServiceDao.exportCsv(query);

  const results: ContractCsvResponseModel[] = [];

  if (rows) {
    await Promise.all(
      rows.map(async row => {
        const contractCollectedAmount = await JobDao.getTotalCollectedAmountByServiceId(row.id);
        const totalContractAmount = row.amount ? row.amount : 0;
        const totalCollectedContractAmount = contractCollectedAmount ? contractCollectedAmount.collectedAmount : 0;
        const totalOutstandingContract = totalCollectedContractAmount > totalContractAmount ? 0 : totalContractAmount - totalCollectedContractAmount;
        row.collectedAmount = contractCollectedAmount ? contractCollectedAmount.collectedAmount : 0;
        row.outstandingAmount = totalOutstandingContract;

        results.push({
          id: row.id,
          clientName: row.clientName[0],
          contractTitle: row.contractTitle[0],
          contractType: row.contractType[0],
          startDate: format(new Date(row.startDate), 'dd/MM/yyyy'),
          endDate: format(new Date(row.endDate), 'dd/MM/yyyy'),
          createdDate: format(new Date(row.createdDate), 'dd/MM/yyyy'),
          entity: row.entity[0],
          contractAmount: row.amount,
          invoiceNumber: row.invoiceNo[0] ? row.invoiceNo[0] : '-',
          paymentStatus: row.invoiceStatus[0] ? row.invoiceStatus[0] : '-',
          contractStatus: row.contractStatus[0] ? row.contractStatus[0] : '-',
          collectedAmount: row.collectedAmount,
          outstandingAmount: row.outstandingAmount,
          customFieldLabel1: row.CustomFields?.[0]?.label || '-',
          customFieldValue1: row.CustomFields?.[0]?.value || '-',
          customFieldLabel2: row.CustomFields?.[1]?.label || '-',
          customFieldValue2: row.CustomFields?.[1]?.value || '-'
        });
      })
    );
  }
  return results;
};

export const getServiceDetailById = async (id: number): Promise<Service> => {
  LOG.debug('Getting service detail by id');

  const service = await ServiceDao.getServiceDetailById(id);
  if (!service) {
    throw new ServiceNotFoundError(id);
  }

  try {
    const firstJob = service.Jobs[0];
    await Promise.all(
      service.Schedules.map(async schedule => {
        const newItems: ServiceItem[] = [];
        if (schedule.ServiceItems) {
          await Promise.all(
            schedule.ServiceItems.map(async (item: ServiceItem) => {
              //get equipments by service item id
              const equipments = await EquipmentService.getEquipmentByServiceItemId(item.id);
              item.setDataValue('Equipments', equipments);

              const findSame = newItems.find(
                findItem => item.id !== findItem.id && findItem.name === item.name && findItem.description === item.description
              );

              if (!findSame) {
                newItems.push(item);
              }
              return newItems.sort((a, b) => a.id - b.id);
            })
          );
          schedule.setDataValue('ServiceItems', newItems);
          if (service.serviceType !== ServiceTypes.ADDITIONAL) {
            if (firstJob.startDateTime && firstJob.endDateTime) {
              schedule.setDataValue('startDateTime', new Date(firstJob.startDateTime));
              schedule.setDataValue('endDateTime', new Date(firstJob.endDateTime));
            }
          }
        }
        return schedule;
      })
    );

    await Promise.all(
      service.Jobs.map(async val => {
        await Promise.all(
          val.ChecklistJob.map(async items => {
            items.ChecklistItems.sort((a, b) => a.id - b.id);
          })
        );
      })
    );

    const contacts = await ServiceContactDao.getByserviceId(service.id);
    const serviceContact: ContactPersonResponseModel[] = [];
    await Promise.all(
      service.Client.ContactPersons.map(async val => {
        const matchingContact = contacts.find(contact => contact.contactPersonId === val.id);
        if (matchingContact) {
          serviceContact.push(val);
        }
      })
    );

    serviceContact.sort((a, b) => {
      if (a.isMain && !b.isMain) {
        return -1;
      } else if (!a.isMain && b.isMain) {
        return 1;
      } else {
        return 0;
      }
    });

    service.ContactPersons = serviceContact;

    return service;
  } catch (err) {
    throw err;
  }
};

/** Get detail of service that has been processed */
export const getServiceFullDetailsById = async (id: number): Promise<ServiceResponseModel> => {
  LOG.debug('Getting Service full details from id');

  const service = await ServiceDao.getServiceFullDetailsById(id);

  if (!service) {
    throw new ServiceNotFoundError(id);
  }

  return service;
};

/**
 * To delete service (hard delete)
 *
 * @param id of the service to be deleted
 *
 * @returns void
 */
// eslint-disable-next-line
export const deleteService = async (serviceId: number): Promise<any> => {
  LOG.debug('Deleting Quotation');

  const hasJobsInprogress = await JobDao.hasJobsInProgressByServiceId(serviceId);
  if (hasJobsInprogress) {
    throw new JobHaveOtherInProgressError();
  }

  const hasUnpaidInvoices = await InvoiceDao.hasUnpaidInvoicesByServiceId(serviceId);
  if (hasUnpaidInvoices) {
    throw new HaveUnpaidInvoicesError();
  }

  try {
    const service = await getServiceDetailById(Number(serviceId));
    await ServiceDao.deleteServiceById(serviceId);
    return service;
  } catch (err) {
    throw err;
  }
};

/**
 * Create a new service in the system, based on user input
 *
 * @param serviceTypes of the new service
 * @param serviceNumber of the service
 * @param serviceTitle of the service
 * @param description of the service
 * @param termStart of the service
 * @param termEnd of the service
 * @param invoiceNumber of the service
 * @param discountType of the service
 * @param discountAmount of the service
 * @param remarks of the service
 * @param termCondition of the service
 * @param clientId of the service
 * @param serviceAddressId of the service
 * @param entityId of the service
 *
 * @returns ServiceModel
 */

export const createService = async (req: ServiceBody): Promise<Service> => {
  LOG.debug('Creating new contract service');

  const transaction = await sequelize.transaction();
  let service: Service;

  try {
    if (req.clientId === 0) {
      const newClient = await ClientService.createClient(req.ClientBody);
      req.clientId = newClient.id;

      const ServiceAddresses = newClient.ServiceAddresses;

      ServiceAddresses.map(async value => {
        req.serviceAddressId = value.id;
      });

      const ContactPersons = newClient.ContactPersons;
      await Promise.all(
        ContactPersons.map(val => {
          req.ContactPersons.map(value => {
            return (value.id = val.id);
          });
        })
      );
    }

    service = await ServiceDao.createService(req);

    const newId = '' + service.id;
    const pad = '0000';
    const serviceNumber = pad.substring(0, pad.length - newId.length) + newId;
    await service.update({ serviceNumber: serviceNumber });

    await Promise.all(
      req.Schedules.map(async schedule => {
        const newSchedule = await ScheduleDao.createScheduleWithoutTransaction(
          service.id,
          schedule.startDateTime,
          schedule.endDateTime,
          schedule.repeatType,
          schedule.repeatEvery,
          schedule.repeatOnDate,
          schedule.repeatOnDay,
          schedule.repeatOnWeek,
          schedule.repeatOnMonth,
          schedule.repeatEndType,
          schedule.repeatEndAfter,
          schedule.repeatEndOnDate
        );

        if (schedule.ServiceItems) {
          schedule.ServiceItems.map(item => {
            item.serviceId = service.id;
            item.scheduleId = newSchedule.id;
          });
        }
      })
    );

    const { jobs } = scheduling(req.Schedules);

    if (req.isNextDay) {
      const jobDates: any[] = [];
      jobs.map(val => jobDates.push(val.startDateTime));
      const ph = await publicHolidays(jobDates);

      const holidaysDate = req.holidaysDate !== undefined && req.holidaysDate.length > 0 ? req.holidaysDate : ph;
      if (holidaysDate && holidaysDate.length > 0) {
        holidaysDate.map(value => {
          const getIndex = jobs.findIndex(job => isSameDay(new Date(job.startDateTime), new Date(value.date)));
          const getJob = jobs.find(job => isSameDay(new Date(job.startDateTime), new Date(value.date)));
          if (getIndex !== -1) {
            let newStartJobDate = new Date(getJob.startDateTime);
            let newEndJobDate = new Date(getJob.endDateTime);

            // eslint-disable-next-line no-loop-func
            while (getDay(newStartJobDate) === 0 || holidaysDate.some(value => isSameDay(new Date(value.date), newStartJobDate))) {
              newStartJobDate = addDays(newStartJobDate, 1);
              newEndJobDate = addDays(newEndJobDate, 1);
            }

            jobs[getIndex].startDateTime = format(newStartJobDate, 'yyyy-MM-dd HH:mm:00');
            jobs[getIndex].endDateTime = format(newEndJobDate, 'yyyy-MM-dd HH:mm:00');
          }
          return jobs;
        });
      }
    }

    if (req.skills) {
      const ServiceSkills: ServiceSkillResponseModel[] = [];

      await Promise.all(
        req.skills.map(async skill => {
          ServiceSkills.push({ serviceId: Number(service.id), skill: skill.name });
        })
      );

      await ServiceSkillDao.bulkCreateServiceSkill(ServiceSkills, transaction);
    }

    if (req.CustomFields) {
      const CustomFields: CustomFieldResponseModel[] = [];

      await Promise.all(
        req.CustomFields.map(async field => {
          if (field.label !== '') {
            CustomFields.push({ serviceId: Number(service.id), label: field.label, value: field.value });
          }
        })
      );

      await CustomFieldDao.bulkCreateCustomField(CustomFields, transaction);
    }

    if (req.ContactPersons) {
      // eslint-disable-next-line
      const contacts: any[] = [];
      // eslint-disable-next-line
      req.ContactPersons.map((value: any) => contacts.push({ serviceId: service.id, contactPersonId: value.id }));

      await ServiceContactDao.create(contacts);
    }

    await service.update({ totalJob: jobs.length });
    await transaction.commit();

    if (req.selectedEmployees && req.selectedEmployees.length > 0) {
      if (req.isAssignFirstJob) {
        jobs[0].jobStatus = JobStatus.ASSIGNED;
      } else {
        jobs.map(val => {
          val.jobStatus = JobStatus.ASSIGNED;
        });
      }
    }

    await createJobWithoutTransaction(jobs, service, req.Checklists, req.JobLabels);

    const newService = await getServiceDetailById(service.id);
    const employees = req.selectedEmployees;
    const vehicles = req.selectedVehicles;

    const newJobs: Job[] = [];
    if (req.isAssignFirstJob) {
      newJobs.push(newService.Jobs[0]);
    } else {
      newJobs.push(...newService.Jobs);
    }

    if (employees && employees.length > 0) {
      // eslint-disable-next-line
      const userProfileJobData: any[] = [];
      newJobs.map(job => {
        // eslint-disable-next-line
        employees.map(async (value: any) => {
          userProfileJobData.push({ userProfileId: value.id, jobId: job.id });
          const currentUser = await UserProfileDao.getById(value.id);
          const employeeName = currentUser.getDataValue('displayName');
          const tokenNotification = currentUser.getDataValue('token');
          const address = req.serviceAddressId;
          if (tokenNotification) {
            const message = {
              title: 'New Job Assigned',
              body: `Hi ${employeeName}, you have a new job assigned to you on ${job.startDateTime} at ${address}. Please check job details for more information.`
            };

            await Notification.sendTechnicianNotif(tokenNotification, message, {
              jobId: String(job.id),
              jobType: service.serviceType,
              jobStatus: 'ASSIGNED',
              startDateTime: job.startDateTime.toString()
            });
          }
        });
      });

      await UserProfileJobDao.create(userProfileJobData);
    }

    if (vehicles && vehicles.length > 0) {
      newJobs.map(async job => {
        // eslint-disable-next-line
        const vehicleJobData: any[] = [];
        // eslint-disable-next-line
        vehicles.map((value: any) => {
          vehicleJobData.push({ vehicleId: value.id, jobId: job.id });
        });

        await VehicleJobDao.create(vehicleJobData);
      });
    }

    return await getServiceDetailById(service.id);
  } catch (err) {
    if (transaction) {
      await transaction.rollback().catch(async () => {
        await ServiceDao.deleteServiceById(Number(service.id));
      });
    } else {
      await ServiceDao.deleteServiceById(Number(service.id));
    }

    throw err;
  }
};

export const convertToService = async (id: number, req: ServiceBody): Promise<Service> => {
  LOG.debug('Creating new contract service');

  const invoice = await InvoiceDao.getInvoiceByServiceId(id);
  if (invoice) {
    const invoiceStatus = invoice.getDataValue('invoiceStatus');
    if (invoice && invoiceStatus === InvoiceStatus.FULLY_PAID) {
      throw new ServiceNotEditableError(id);
    }
  }
  const service = await ServiceDao.getServiceDetailById(id);
  if (service.serviceType === ServiceTypes.CONTRACT) {
    return await getServiceDetailById(service.id);
  }

  const transaction = await sequelize.transaction();

  try {
    const startDate = format(new Date(req.termStart), 'yyyy-MM-dd');
    const endTime = format(new Date(req.termEnd), 'HH:mm:00');

    const schedules: Schedule[] = [];
    schedules.push(req.Schedule);
    schedules.map(val => {
      val.startDateTime = req.termStart;
      val.endDateTime = new Date(`${startDate} ${endTime}`);
    });

    const { jobs } = scheduling(schedules);

    if (req.isNextDay) {
      const jobDates: any[] = [];
      jobs.map(val => jobDates.push(val.startDateTime));
      const ph = await publicHolidays(jobDates);
      ph.map(value => {
        const getIndex = jobs.findIndex(job => isSameDay(new Date(job.startDateTime), new Date(value.date)));
        const getJob = jobs.find(job => isSameDay(new Date(job.startDateTime), new Date(value.date)));
        if (getIndex !== -1) {
          let newStartJobDate = new Date(getJob.startDateTime);
          let newEndJobDate = new Date(getJob.endDateTime);

          // eslint-disable-next-line no-loop-func
          while (getDay(newStartJobDate) === 0 || ph.some(value => isSameDay(new Date(value.date), newStartJobDate))) {
            newStartJobDate = addDays(newStartJobDate, 1);
            newEndJobDate = addDays(newEndJobDate, 1);
          }

          jobs[getIndex].startDateTime = format(newStartJobDate, 'yyyy-MM-dd HH:mm:00');
          jobs[getIndex].endDateTime = format(newEndJobDate, 'yyyy-MM-dd HH:mm:00');
        }
        return jobs;
      });
    }

    const firstJob = await JobDao.getLastJobByServiceId(id);

    firstJob.update({
      startDateTime: jobs[0].startDateTime,
      endDateTime: jobs[0].endDateTime
    });

    await ServiceItemJobDao.deleteServiceItemJob(firstJob.id);
    await ScheduleDao.deleteScheduleByServiceId(id);
    await Promise.all(
      schedules.map(async schedule => {
        const newSchedule = await ScheduleDao.createScheduleWithoutTransaction(
          id,
          req.termStart,
          req.termEnd,
          schedule.repeatType,
          schedule.repeatEvery,
          schedule.repeatOnDate,
          schedule.repeatOnDay,
          schedule.repeatOnWeek,
          schedule.repeatOnMonth,
          schedule.repeatEndType,
          schedule.repeatEndAfter,
          schedule.repeatEndOnDate
        );

        if (schedule.ServiceItems) {
          schedule.ServiceItems.map(async item => {
            item.serviceId = service.id;
            item.scheduleId = newSchedule.id;
            const newServiceItem = await ServiceItemDao.createServiceItemWithoutTransaction(item);
            await ServiceItemJobDao.createWithoutTransaction([{ jobId: firstJob.id, serviceItemId: newServiceItem.id }]);

            if (item.Equipments) {
              const serviceItemEquipment: any[] = [];
              if (item.Equipments && item.Equipments.length > 0) {
                item.Equipments.map(value => {
                  return serviceItemEquipment.push({ serviceItemId: newServiceItem.id, equipmentId: value.id });
                });

                await ServiceItemEquipmentDao.createWithoutTransaction(serviceItemEquipment);
              }
            }
          });
        }
      })
    );

    let serviceAmount = 0;
    let gstAmount = service.gstAmount;
    if (service.needGST) {
      const gst = (req.gstTax || 0) / 100;
      const totalAmount = Number((req.contractAmount - req.discountAmount).toFixed(2));

      gstAmount = Number((totalAmount * gst).toFixed(2));
      serviceAmount = Number((totalAmount + gstAmount).toFixed(2));
    } else {
      serviceAmount = Number((req.contractAmount - req.discountAmount).toFixed(2));
    }

    service.update({
      serviceType: ServiceTypes.CONTRACT,
      serviceStatus: ServiceStatus.CONFIRMED,
      termStart: req.termStart,
      termEnd: req.termEnd,
      originalAmount: req.contractAmount,
      discountAmount: req.discountAmount,
      totalAmount: serviceAmount,
      gstTax: req.gstTax ? req.gstTax : service.gstTax,
      gstAmount: gstAmount,
      totalJob: jobs.length,
      contractSign: req.contractSign
    });

    if (req.serviceTemplateId) {
      const serviceTemplate = await ServiceTemplateDao.getServiceTemplateById(req.serviceTemplateId);
      service.update({
        serviceTitle: serviceTemplate.name,
        description: serviceTemplate.description,
        termCondition: serviceTemplate.termCondition
      });
    }

    await transaction.commit();
    await createJobWithoutTransaction(jobs.slice(1), service);

    if (req.isSendReportToClientEmail) {
      const contacts: any = [];
      const serviceContact = await ServiceContactDao.getByserviceId(id);
      service.Client.ContactPersons.map(val => {
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

    return await getServiceDetailById(service.id);
  } catch (err) {
    throw err;
  }
};

export const createJobWithoutTransaction = async (
  jobs: JobGenerateResponseModel[],
  service: Service,
  Checklists?: ChecklistJob[],
  JobLabels?: JobLabel[]
): Promise<void> => {
  for (const job of jobs) {
    try {
      job.serviceId = service.id;

      const newJob = await JobDao.createJobWithouTransaction(job.startDateTime, job.endDateTime, job.jobStatus, service.id);
      const serviceItems = job.ServiceItems;

      for (const item of serviceItems) {
        delete item.id;

        item.quantity = Number(isNaN(item.quantity) ? 0 : Number(item.quantity));
        item.unitPrice = Number(isNaN(item.unitPrice) ? 0 : Number(item.unitPrice));
        item.discountAmt = Number(isNaN(item.discountAmt) ? 0 : Number(item.discountAmt));
        item.totalPrice = Number(isNaN(item.totalPrice) ? 0 : Number(item.totalPrice));

        const newServiceItem = await ServiceItemDao.createServiceItemWithoutTransaction(item);
        await ServiceItemJobDao.createWithoutTransaction([{ jobId: newJob.id, serviceItemId: newServiceItem.id }]);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const serviceItemEquipment: any[] = [];
        if (item.Equipments && item.Equipments.length > 0) {
          item.Equipments.map(value => {
            return serviceItemEquipment.push({ serviceItemId: newServiceItem.id, equipmentId: value.id });
          });

          await ServiceItemEquipmentDao.createWithoutTransaction(serviceItemEquipment);
        }
      }

      if (Checklists) {
        Checklists.map(async checklist => {
          const newJobChecklist = await ChecklistJobDao.createChecklistJobWithoutTransaction(
            newJob.id,
            checklist.name,
            checklist.description,
            checklist.remarks
          );
          const checklistItems = checklist.ChecklistItems;

          if (checklistItems) {
            checklistItems.map(item => {
              delete item.id;

              item.checklistJobId = newJobChecklist.id;
              item.status = false;
            });

            await ChecklistJobItemDao.bulkCreateChecklistJobItemWithoutTransaction(checklistItems);
          }
        });
      }

      if (JobLabels) {
        const currentJobLabels = JobLabels;

        currentJobLabels.map(label => {
          delete label.id;
          label.jobId = newJob.id;
        });

        await JobLabelDao.bulkCreateJobLabelWithoutTransaction(currentJobLabels);
      }
    } catch (err) {
      throw err;
    }
  }
};

/**
 * To edit a new service in the system, based on user input
 *
 * @param description of the service
 * @param termStart of the service
 * @param termEnd of the service
 * @param clientId of the service
 * @param serviceAddressId of the service
 * @param entityId of the service
 *
 * @returns void
 */

export const editServiceDetail = async (id: number, req: ServiceBody): Promise<Service> => {
  LOG.debug('Editing Service');

  const service = await ServiceDao.getServiceById(id);
  const currentJobs = (await JobDao.getJobDetailByServiceId(id)).sort((a, b) => a.id - b.id);
  const jobId = currentJobs.map(a => a.id);
  let totalJob = service.totalJob;

  if (!service) {
    throw new ServiceNotFoundError(id);
  }

  if (service.Invoice.length > 0 && service.Invoice[0].invoiceStatus === InvoiceStatus.FULLY_PAID) {
    throw new ServiceNotEditableError(id);
  }

  // if (service.isJobCompleted || service.Invoice.length > 0) {
  //   throw new ServiceNotEditableError(id);
  // }

  try {
    const {
      serviceType,
      serviceStatus,
      serviceTitle,
      description,
      needGST,
      termStart,
      termEnd,
      serviceAddressId,
      entityId,
      gstTax,
      salesPerson,
      termCondition,
      skills,
      Checklists,
      contractDiscount,
      gstAmount,
      isNewGenerated,
      Schedules,
      isNextDay,
      holidaysDate,
      CustomFields,
      issueDate,
      expiryDate,
      ContactPersons
    } = req;

    const newDiscountAmount = contractDiscount !== undefined ? contractDiscount : service.discountAmount !== undefined ? service.discountAmount : 0;

    let newGstAmount = gstAmount || service.gstAmount || 0;
    let newTotalAmount = 0;
    newTotalAmount = Number((service.originalAmount - newDiscountAmount).toFixed(2));
    req.needGST = req.needGST || service.needGST;

    if (skills) {
      const ServiceSkills: ServiceSkillResponseModel[] = [];

      await Promise.all(
        req.skills.map(skill => {
          ServiceSkills.push({ serviceId: Number(service.id), skill: skill.name });
        })
      );

      await ServiceSkillDao.deleteServiceSkillByServiceId(service.id);
      await ServiceSkillDao.bulkCreateServiceSkill(ServiceSkills);
    }

    if (isNewGenerated) {
      //checking is there completed job
      const isNotUnassigned = currentJobs.find(value => value.jobStatus !== JobStatus.UNASSIGNED);
      if (!isNotUnassigned) {
        //THIS IS OLD FLOW AND DO DELETE
        await ServiceItemDao.deleteServiceItemByServiceId(service.id);
        await ScheduleDao.deleteScheduleByServiceId(service.id);
        await JobDao.deteleJobByServiceId(service.id);

        await Promise.all(
          Schedules.map(async schedule => {
            const newSchedule = await ScheduleDao.createSchedule(
              service.id,
              schedule.startDateTime,
              schedule.endDateTime,
              schedule.repeatType,
              schedule.repeatEvery,
              schedule.repeatOnDate,
              schedule.repeatOnDay,
              schedule.repeatOnWeek,
              schedule.repeatOnMonth,
              schedule.repeatEndType,
              schedule.repeatEndAfter,
              schedule.repeatEndOnDate
            );

            schedule.ServiceItems.map(item => {
              item.serviceId = service.id;
              item.scheduleId = newSchedule.id;

              item.quantity = Number(isNaN(item.quantity) ? 0 : Number(item.quantity));
              item.unitPrice = Number(isNaN(item.unitPrice) ? 0 : Number(item.unitPrice));
              item.discountAmt = Number(isNaN(item.discountAmt) ? 0 : Number(item.discountAmt));
              item.totalPrice = Number(isNaN(item.totalPrice) ? 0 : Number(item.totalPrice));
            });
          })
        );

        const { jobs } = scheduling(Schedules);

        if (isNextDay) {
          const jobDates: any[] = [];
          jobs.map(val => jobDates.push(val.startDateTime));
          const ph = await publicHolidays(jobDates);

          const holidaysDate = req.holidaysDate ? ph : [];
          if (holidaysDate && holidaysDate.length > 0) {
            holidaysDate.map(value => {
              const getIndex = jobs.findIndex(job => isSameDay(new Date(job.startDateTime), new Date(value.date)));
              const getJob = jobs.find(job => isSameDay(new Date(job.startDateTime), new Date(value.date)));
              if (getIndex !== -1) {
                let newStartJobDate = new Date(getJob.startDateTime);
                let newEndJobDate = new Date(getJob.endDateTime);

                // eslint-disable-next-line no-loop-func
                while (getDay(newStartJobDate) === 0 || holidaysDate.some(value => isSameDay(new Date(value.date), newStartJobDate))) {
                  newStartJobDate = addDays(newStartJobDate, 1);
                  newEndJobDate = addDays(newEndJobDate, 1);
                }

                jobs[getIndex].startDateTime = format(newStartJobDate, 'yyyy-MM-dd HH:mm:00');
                jobs[getIndex].endDateTime = format(newEndJobDate, 'yyyy-MM-dd HH:mm:00');
              }
              return jobs;
            });
          }
        }

        await Promise.all(
          jobs.map(async job => {
            job.serviceId = service.id;

            const newJob = await JobDao.createJob(job.startDateTime, job.endDateTime, job.jobStatus, service.id);
            const serviceItems = job.ServiceItems;

            for (const item of serviceItems) {
              delete item.id;
              const newServiceItem = await ServiceItemDao.createServiceItem(item);
              await ServiceItemJobDao.create([{ jobId: newJob.id, serviceItemId: newServiceItem.id }]);

              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const serviceItemEquipment: any[] = [];
              if (item.Equipments && item.Equipments.length > 0) {
                item.Equipments.map(value => {
                  return serviceItemEquipment.push({ serviceItemId: newServiceItem.id, equipmentId: value.id });
                });

                await ServiceItemEquipmentDao.create(serviceItemEquipment);
              } else {
                await ServiceItemEquipmentDao.deleteDataByServiceItemId(newServiceItem.id);
              }
            }

            if (Checklists) {
              await Promise.all(
                Checklists.map(async checklist => {
                  delete checklist.id;
                  const newJobChecklist = await ChecklistJobDao.createChecklistJob(
                    newJob.id,
                    checklist.name,
                    checklist.description,
                    checklist.remarks
                  );
                  const checklistItems = checklist.ChecklistItems;

                  checklistItems.map(item => {
                    delete item.id;
                    item.checklistJobId = newJobChecklist.id;
                    item.status = false;
                  });

                  await ChecklistJobItemDao.bulkCreateChecklistJobItem(checklistItems);
                })
              );
            }
          })
        );

        totalJob = jobs.length;
      } else {
        //TODO: THIS IS NEW FLOW PLEASE CHECK REGULARLY AND DO DELETE
        await Promise.all(
          Schedules.map(async schedule => {
            let newSchedule = schedule;
            if (schedule.id !== 0) {
              newSchedule = await ScheduleDao.getScheduleById(Number(schedule.id));
              newSchedule.update(schedule);
            } else {
              newSchedule = await ScheduleDao.createScheduleWithoutTransaction(
                service.id,
                schedule.startDateTime,
                schedule.endDateTime,
                schedule.repeatType,
                schedule.repeatEvery,
                schedule.repeatOnDate,
                schedule.repeatOnDay,
                schedule.repeatOnWeek,
                schedule.repeatOnMonth,
                schedule.repeatEndType,
                schedule.repeatEndAfter,
                schedule.repeatEndOnDate
              );
            }

            if (schedule.ServiceItems) {
              schedule.ServiceItems.map(item => {
                item.serviceId = service.id;
                item.scheduleId = newSchedule.id;
              });
            }
          })
        );

        const { jobs } = scheduling(Schedules);
        if (isNextDay) {
          const jobDates: any[] = [];
          jobs.map(val => jobDates.push(val.startDateTime));
          const ph = await publicHolidays(jobDates);

          const holidaysDate = req.holidaysDate ? ph : [];
          if (holidaysDate && holidaysDate.length > 0) {
            Promise.all(
              holidaysDate.map(value => {
                const getIndex = jobs.findIndex(job => isSameDay(new Date(job.startDateTime), new Date(value.date)));
                const getJob = jobs.find(job => isSameDay(new Date(job.startDateTime), new Date(value.date)));
                if (getIndex !== -1) {
                  let newStartJobDate = new Date(getJob.startDateTime);
                  let newEndJobDate = new Date(getJob.endDateTime);
                  // eslint-disable-next-line no-loop-func
                  while (getDay(newStartJobDate) === 0 || holidaysDate.some(value => isSameDay(new Date(value.date), newStartJobDate))) {
                    newStartJobDate = addDays(newStartJobDate, 1);
                    newEndJobDate = addDays(newEndJobDate, 1);
                  }
                  jobs[getIndex].startDateTime = format(newStartJobDate, 'yyyy-MM-dd HH:mm:00');
                  jobs[getIndex].endDateTime = format(newEndJobDate, 'yyyy-MM-dd HH:mm:00');
                }
                return jobs;
              })
            );
          }
        }

        const totalCurrentJobs = currentJobs.length;
        const totalGeneratedJobs = jobs.length;

        if (totalGeneratedJobs >= totalCurrentJobs) {
          await Promise.all(
            jobs.map(async (generate, index) => {
              const oldJob = currentJobs[index];
              const { startDateTime, endDateTime, jobStatus, ServiceItems } = generate;

              if (oldJob) {
                const getJob = await JobDao.getJobById(currentJobs[index].id);
                const { id, jobStatus } = getJob;

                if (jobStatus === JobStatus.UNASSIGNED || jobStatus === JobStatus.CONFIRMED || jobStatus === JobStatus.ASSIGNED) {
                  getJob.update({ startDateTime: startDateTime, endDateTime: endDateTime });

                  await ServiceItemDao.deleteServiceItemByJobId(id);

                  for (const item of ServiceItems) {
                    delete item.id;
                    const newServiceItem = await ServiceItemDao.createServiceItem(item);
                    await ServiceItemJobDao.create([{ jobId: id, serviceItemId: newServiceItem.id }]);
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const serviceItemEquipment: any[] = [];
                    if (item.Equipments && item.Equipments.length > 0) {
                      item.Equipments.map((value: any) => {
                        return serviceItemEquipment.push({ serviceItemId: newServiceItem.id, equipmentId: value.id });
                      });
                      await ServiceItemEquipmentDao.create(serviceItemEquipment);
                    } else {
                      await ServiceItemEquipmentDao.deleteDataByServiceItemId(newServiceItem.id);
                    }
                  }

                  if (Checklists) {
                    await Promise.all(
                      Checklists.map(async checklist => {
                        delete checklist.id;
                        const newJobChecklist = await ChecklistJobDao.createChecklistJob(
                          id,
                          checklist.name,
                          checklist.description,
                          checklist.remarks
                        );
                        const checklistItems = checklist.ChecklistItems;

                        checklistItems.map(item => {
                          delete item.id;
                          item.checklistJobId = newJobChecklist.id;
                          item.status = false;
                        });

                        await ChecklistJobItemDao.bulkCreateChecklistJobItem(checklistItems);
                      })
                    );
                  }
                }
              } else {
                const newJob = await JobDao.createJob(startDateTime, endDateTime, jobStatus, service.id);

                for (const item of ServiceItems) {
                  delete item.id;
                  const newServiceItem = await ServiceItemDao.createServiceItem(item);
                  await ServiceItemJobDao.create([{ jobId: newJob.id, serviceItemId: newServiceItem.id }]);
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const serviceItemEquipment: any[] = [];
                  if (item.Equipments && item.Equipments.length > 0) {
                    item.Equipments.map((value: any) => {
                      return serviceItemEquipment.push({ serviceItemId: newServiceItem.id, equipmentId: value.id });
                    });
                    await ServiceItemEquipmentDao.create(serviceItemEquipment);
                  } else {
                    await ServiceItemEquipmentDao.deleteDataByServiceItemId(newServiceItem.id);
                  }
                }

                if (Checklists) {
                  await Promise.all(
                    Checklists.map(async checklist => {
                      delete checklist.id;
                      const newJobChecklist = await ChecklistJobDao.createChecklistJob(
                        newJob.id,
                        checklist.name,
                        checklist.description,
                        checklist.remarks
                      );
                      const checklistItems = checklist.ChecklistItems;

                      checklistItems.map(item => {
                        delete item.id;
                        item.checklistJobId = newJobChecklist.id;
                        item.status = false;
                      });

                      await ChecklistJobItemDao.bulkCreateChecklistJobItem(checklistItems);
                    })
                  );
                }
              }
            })
          );
        } else {
          await Promise.all(
            currentJobs.map(async (current, index) => {
              const newJob = jobs[index];
              const { id } = current;

              if (newJob) {
                const getJob = await JobDao.getJobById(id);
                const { jobStatus } = getJob;
                const { startDateTime, endDateTime, ServiceItems } = newJob;

                if (jobStatus === JobStatus.UNASSIGNED || jobStatus === JobStatus.CONFIRMED || jobStatus === JobStatus.ASSIGNED) {
                  getJob.update({ startDateTime: startDateTime, endDateTime: endDateTime });
                  await ServiceItemDao.deleteServiceItemByJobId(id);

                  for (const item of ServiceItems) {
                    delete item.id;
                    const newServiceItem = await ServiceItemDao.createServiceItem(item);
                    await ServiceItemJobDao.create([{ jobId: id, serviceItemId: newServiceItem.id }]);
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const serviceItemEquipment: any[] = [];
                    if (item.Equipments && item.Equipments.length > 0) {
                      item.Equipments.map((value: any) => {
                        return serviceItemEquipment.push({ serviceItemId: newServiceItem.id, equipmentId: value.id });
                      });
                      await ServiceItemEquipmentDao.create(serviceItemEquipment);
                    } else {
                      await ServiceItemEquipmentDao.deleteDataByServiceItemId(newServiceItem.id);
                    }
                  }

                  if (Checklists) {
                    await Promise.all(
                      Checklists.map(async checklist => {
                        delete checklist.id;
                        const newJobChecklist = await ChecklistJobDao.createChecklistJob(
                          id,
                          checklist.name,
                          checklist.description,
                          checklist.remarks
                        );
                        const checklistItems = checklist.ChecklistItems;

                        checklistItems.map(item => {
                          delete item.id;
                          item.checklistJobId = newJobChecklist.id;
                          item.status = false;
                        });

                        await ChecklistJobItemDao.bulkCreateChecklistJobItem(checklistItems);
                      })
                    );
                  }
                }
              } else {
                await ServiceItemDao.deleteServiceItemByJobId(id);
                await JobDao.deleteJobById([id]);
              }
            })
          );
        }

        //get differenceJobs
        // const { newJobs, oldJobs } = compareDateTimeArrays(jobs, currentJobs);
        // const { newJobs, oldJobs } = compareJobDateTime(currentJobs, jobs);

        // console.log(
        //   'oldJobs',
        //   oldJobs.map(value => value.startDateTime)
        // );
        // console.log(
        //   'newJobs',
        //   newJobs.map(value => value.startDateTime)
        // );

        // //for update old jobs data
        // await Promise.all(
        //   oldJobs.map(async job => {
        //     const currentServiceItems = await ServiceItemDao.getServiceItemByJobId(job.id);
        //     const generateServiceItems = job.ServiceItems;

        //     const serviceItems = generateServiceItems.filter((generate: any) => {
        //       const findSame = currentServiceItems.find(item => item.name === generate.name);
        //       generate.id = findSame ? findSame.id : generate.id;
        //       return generate;
        //     });

        //     console.log('---olds', format(new Date(job.startDateTime), 'dd-MM-yyyy HH:mm a'));

        //     for (const item of serviceItems) {
        //       if (item.id !== 0) {
        //         const getItem = await ServiceItemDao.getServiceItemById(item.id);
        //         getItem.update(item);
        //       } else {
        //         const newServiceItem = await ServiceItemDao.createServiceItem(item);
        //         await ServiceItemJobDao.create([{ jobId: job.id, serviceItemId: newServiceItem.id }]);
        //         // eslint-disable-next-line @typescript-eslint/no-explicit-any
        //         const serviceItemEquipment: any[] = [];
        //         if (item.Equipments && item.Equipments.length > 0) {
        //           item.Equipments.map((value: any) => {
        //             return serviceItemEquipment.push({ serviceItemId: newServiceItem.id, equipmentId: value.id });
        //           });
        //           await ServiceItemEquipmentDao.create(serviceItemEquipment);
        //         } else {
        //           await ServiceItemEquipmentDao.deleteDataByServiceItemId(newServiceItem.id);
        //         }
        //       }
        //     }
        //   })
        // );

        // //for create new jobs
        // await Promise.all(
        //   newJobs.map(async job => {
        //     job.serviceId = service.id;
        //     const newJob = await JobDao.createJob(job.startDateTime, job.endDateTime, job.jobStatus, service.id);
        //     const serviceItems = job.ServiceItems;
        //     console.log('---new', format(new Date(job.startDateTime), 'dd-MM-yyyy HH:mm a'));

        //     for (const item of serviceItems) {
        //       delete item.id;
        //       const newServiceItem = await ServiceItemDao.createServiceItem(item);
        //       await ServiceItemJobDao.create([{ jobId: newJob.id, serviceItemId: newServiceItem.id }]);
        //       // eslint-disable-next-line @typescript-eslint/no-explicit-any
        //       const serviceItemEquipment: any[] = [];
        //       if (item.Equipments && item.Equipments.length > 0) {
        //         item.Equipments.map((value: any) => {
        //           return serviceItemEquipment.push({ serviceItemId: newServiceItem.id, equipmentId: value.id });
        //         });
        //         await ServiceItemEquipmentDao.create(serviceItemEquipment);
        //       } else {
        //         await ServiceItemEquipmentDao.deleteDataByServiceItemId(newServiceItem.id);
        //       }
        //     }

        //     if (Checklists) {
        //       await Promise.all(
        //         Checklists.map(async checklist => {
        //           delete checklist.id;
        //           const newJobChecklist = await ChecklistJobDao.createChecklistJob(
        //             newJob.id,
        //             checklist.name,
        //             checklist.description,
        //             checklist.remarks
        //           );
        //           const checklistItems = checklist.ChecklistItems;

        //           checklistItems.map(item => {
        //             delete item.id;
        //             item.checklistJobId = newJobChecklist.id;
        //             item.status = false;
        //           });

        //           await ChecklistJobItemDao.bulkCreateChecklistJobItem(checklistItems);
        //         })
        //       );
        //     }
        //   })
        // );

        totalJob = jobs.length;
      }
    } else {
      if (Checklists) {
        await Promise.all(
          jobId.map(value => {
            Checklists.map(async checklist => {
              delete checklist.id;
              const newJobChecklist = await ChecklistJobDao.createChecklistJob(value, checklist.name, checklist.description, checklist.remarks);
              const checklistItems = checklist.ChecklistItems;

              checklistItems.map(item => {
                delete item.id;
                item.checklistJobId = newJobChecklist.id;
              });

              await ChecklistJobItemDao.bulkCreateChecklistJobItem(checklistItems);
            });
          })
        );
      }
    }
    const { originalAmount } = await ServiceItemDao.sumServiceItemByServiceId(id);
    newTotalAmount = Number((originalAmount - newDiscountAmount).toFixed(2));

    if (needGST) {
      newGstAmount = Number(((newTotalAmount * gstTax) / 100).toFixed(2));
      newTotalAmount = newTotalAmount + newGstAmount;
    } else {
      newGstAmount = 0;
    }

    if (CustomFields && CustomFields.length > 0) {
      const customFields: CustomFieldResponseModel[] = [];
      await CustomFieldDao.deleteCustomFieldByServiceId(service.id);

      await Promise.all(
        CustomFields.map(val => {
          if (val.label !== '') {
            customFields.push({ serviceId: Number(service.id), label: val.label, value: val.value });
          }
        })
      );

      await CustomFieldDao.bulkCreateCustomField(customFields);
    }

    if (ContactPersons) {
      await ServiceContactDao.deleteData(service.id);
      // eslint-disable-next-line
      const contacts: any[] = [];
      // eslint-disable-next-line
      ContactPersons.map((value: any) => contacts.push({ serviceId: service.id, contactPersonId: value.id }));

      await ServiceContactDao.create(contacts);
    }

    await service.update({
      serviceType,
      serviceStatus,
      serviceTitle,
      description,
      needGST: needGST,
      termStart,
      termEnd,
      serviceAddressId,
      entityId,
      gstTax,
      salesPerson,
      termCondition,
      originalAmount,
      discountAmount: newDiscountAmount,
      gstAmount: newGstAmount,
      totalAmount: newTotalAmount,
      totalJob,
      issueDate,
      expiryDate
    });

    return await getServiceDetailById(id);
  } catch (err) {
    throw err;
  }
};

export const confirmService = async (id: number): Promise<ServiceResponseModel> => {
  LOG.debug('Confirm Service');

  const service = await ServiceDao.getServiceById(id);

  if (!service) {
    throw new ServiceNotFoundError(id);
  }

  try {
    await service.update({ serviceStatus: ServiceStatus.CONFIRMED });

    return await getServiceFullDetailsById(id);
  } catch (err) {
    throw err;
  }
};

export const cancelService = async (id: number): Promise<ServiceResponseModel> => {
  LOG.debug('Cancel Service');

  const service = await ServiceDao.getServiceById(id);

  if (!service) {
    throw new ServiceNotFoundError(id);
  }

  try {
    const inProgressJob = await JobDao.getJobByServiceId(id, JobStatus.IN_PROGRESS);

    if (inProgressJob.length > 0) {
      throw new ServiceHaveInProgessJobError(id);
    }

    const unCompletedJob = await JobDao.getUnCompletedJobByServiceId(id);

    if (unCompletedJob.length > 0) {
      await Promise.all(
        unCompletedJob.map(async job => {
          await job.update({
            jobStatus: JobStatus.CANCELLED
          });
          const detailJob = await JobDao.getJobDetailById(job.id);
          const selectedEmployees = await UserProfileJobDao.getByJobId(job.id);
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
                  body: `Hi ${employeeName}, your assigned job on ${detailJob.row.startDateTime} at ${address} is cancelled. Please contact admin for more information.`
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
        })
      );
    }

    if (service.Invoice) {
      await Promise.all(
        service.Invoice.map(async invoice => {
          await invoice.update({
            invoiceStatus: InvoiceStatus.VOID
          });
        })
      );
    }

    await service.update({
      serviceStatus: ServiceStatus.CANCELLED
    });

    return await getServiceFullDetailsById(id);
  } catch (err) {
    throw err;
  }
};

/**
 * Create a new additional service in the system, based on user input
 *
 * @param serviceTypes of the new service
 * @param serviceNumber of the service
 * @param serviceTitle of the service
 * @param description of the service
 * @param termStart of the service
 * @param termEnd of the service
 * @param invoiceNumber of the service
 * @param discountType of the service
 * @param discountAmount of the service
 * @param remarks of the service
 * @param clientId of the service
 * @param serviceAddressId of the service
 * @param entityId of the service
 *
 * @returns ServiceModel
 */

export const createAdditionalService = async (req: ServiceBody): Promise<Service> => {
  LOG.debug('Creating Service additional');

  try {
    const lastId = await ServiceDao.getLastId();
    const newId = '' + (lastId.id + 1);
    const pad = '0000';

    const job = await JobDao.getJobById(req.jobId);

    const service = await ServiceDao.getServiceDetailByIdForJob(Number(job.serviceId));
    const needGST = service.needGST;
    const defaultGst = await GstTemplateService.getDefaultGst();
    const gst = (defaultGst.tax || 0) / 100;

    if (!job) {
      throw new JobNotFoundError(req.jobId);
    }

    let gstAmount = 0;
    let totalAmount = 0;
    const discount = req.discountAmount || req.discountAmount !== null ? req.discountAmount : 0;

    const contractAmount = req.ServiceItems.reduce((accumulator, value) => {
      return accumulator + value.totalPrice;
    }, 0);

    totalAmount = Number((contractAmount - discount).toFixed(2));

    if (needGST) {
      gstAmount = Number((totalAmount * gst).toFixed(2));
      totalAmount = Number((totalAmount + gstAmount).toFixed(2));
    }
    req.serviceNumber = pad.substring(0, pad.length - newId.length) + newId;
    req.serviceType = ServiceTypes.ADDITIONAL;
    req.serviceTitle = 'Variation Order';
    req.serviceStatus = ServiceStatus.CONFIRMED;
    req.termStart = new Date();
    req.termEnd = new Date();
    req.contractAmount = contractAmount;
    req.discountType = DiscountTypes.NA;
    req.clientId = service.clientId;
    req.serviceAddressId = service.serviceAddressId;
    req.entityId = service.entityId;
    req.gstAmount = gstAmount;
    req.totalAmount = totalAmount;
    req.discountAmount = discount;
    req.gstTax = needGST ? defaultGst.tax || 0 : 0;
    req.totalJob = 1;

    const additional = await ServiceDao.createService(req);

    await job.update({
      additionalServiceId: additional.id
    });

    const schedule = await ScheduleDao.createSchedule(
      additional.id,
      job.startDateTime,
      job.endDateTime,
      RepeatType.ADDITIONAL,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null
    );

    const newServiceItems = await Promise.all(
      req.ServiceItems.map(async value => {
        value.serviceId = additional.id;
        value.scheduleId = schedule.id;
        delete value.id;

        return value;
      })
    );

    const filterServiceItems = newServiceItems.filter(value => {
      return value.isDeleted != true;
    });

    //saving service item with equipment
    await Promise.all(
      filterServiceItems.map(async item => {
        const createdItem = await ServiceItemDao.createServiceItem(item);

        if (item.Equipments && item.Equipments.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const serviceItemEquipment: any[] = [];
          item.Equipments.map(value => {
            return serviceItemEquipment.push({ serviceItemId: createdItem.id, equipmentId: value.id });
          });

          await ServiceItemEquipmentDao.create(serviceItemEquipment);
        } else {
          await ServiceItemEquipmentDao.deleteDataByServiceItemId(createdItem.id);
        }
      })
    );

    return await getServiceDetailById(additional.id);
  } catch (err) {
    throw err;
  }
};

export const deleteAdditionalService = async (jobId: number, additionalServiceId: number): Promise<void> => {
  const job = await JobDao.getJobById(jobId);
  await job.update({
    additionalServiceId: null
  });
  await ServiceDao.deleteServiceById(additionalServiceId);
  await ServiceItemDao.deleteServiceItemById(additionalServiceId);
};

export const exportPdf = async (id: number, query?: PdfTemplateOptionsBody): Promise<Buffer> => {
  try {
    const service = await getServiceDetailById(id);
    let serviceItemDiscountVisibility = false;
    const quotationPdfOption = query ? query : await PdfTemplateOptionsService.getPdfTemplateOptionsByFileName('quotation');

    let logoUrl = '';
    if (service.Entity.logo) {
      logoUrl = await AwsService.s3BucketGetSignedUrl(service.Entity.logo, 'entities');
    }

    // eslint-disable-next-line
    let contractData: any[] = [];
    const jobs = service.Jobs;

    if (jobs.length > 0) {
      await Promise.all(
        jobs.map(async job => {
          const items = job.getDataValue('serviceItemsJob');
          items.sort((a, b) => a.id - b.id);

          if (items) {
            await Promise.all(
              items.map(async (serviceItem, index) => {
                const discountPrice = serviceItem.discountAmt ? serviceItem.discountAmt : 0;
                const equipments = await EquipmentService.getEquipmentByServiceItemId(serviceItem.id);
                Promise.all(
                  equipments.map(val => {
                    val.type = val.isMain ? 'Main' : 'Sub';
                  })
                );

                if (discountPrice > 0) {
                  serviceItemDiscountVisibility = true;
                }

                contractData.push({
                  jobDate: `${format(new Date(job.startDateTime), quotationPdfOption.tableOptionId == 1 ? 'dd MMM yyyy' : 'MMM yyyy')}`,
                  name: serviceItem.name,
                  serviceItemId: serviceItem.id,
                  description: serviceItem.description,
                  quantity: serviceItem.quantity,
                  unitPrice: serviceItem.unitPrice.toLocaleString('en-sg', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                  discountPrice: discountPrice.toLocaleString('en-sg', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                  totalPrice: serviceItem.totalPrice.toLocaleString('en-sg', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                  Equipments: equipments,
                  rowNumber: index + 1,
                  jobStartDateTime: format(new Date(job.startDateTime), 'dd MMM yyyy')
                });
              })
            );
          }
        })
      );
    } else {
      const parentJob = await JobDao.getJobDetailByAdditionalServiceId(id);
      const { row } = await JobDao.getJobDetailById(parentJob.id);
      const additionalJob = row;
      const items = additionalJob.AdditionalServiceItem;

      if (items) {
        await Promise.all(
          items.map(async (serviceItem, index) => {
            const discountPrice = serviceItem.discountAmt ? serviceItem.discountAmt : 0;
            const equipments = await EquipmentService.getEquipmentByServiceItemId(serviceItem.id);

            if (discountPrice > 0) {
              serviceItemDiscountVisibility = true;
            }

            contractData.push({
              jobDate: `${format(new Date(additionalJob.startDateTime), quotationPdfOption.tableOptionId == 1 ? 'dd MMM yyyy' : 'MMM yyyy')}`,
              name: serviceItem.name,
              serviceItemId: serviceItem.id,
              description: serviceItem.description,
              quantity: serviceItem.quantity,
              unitPrice: serviceItem.unitPrice.toLocaleString('en-sg', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
              discountPrice: discountPrice.toLocaleString('en-sg', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
              totalPrice: serviceItem.totalPrice.toLocaleString('en-sg', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
              Equipments: equipments,
              rowNumber: index + 1,
              jobStartDateTime: format(new Date(additionalJob.startDateTime), 'dd MMM yyyy')
            });
          })
        );
      }
    }

    contractData = contractData.sort((now, next) => {
      const nowDate = new Date(now.jobStartDateTime);
      const nextDate = new Date(next.jobStartDateTime);

      if (nowDate < nextDate) {
        return -1;
      }
      if (nowDate > nextDate) {
        return 1;
      }
      // If jobDate is the same, compare by serviceItemId
      if (now.serviceItemId < next.serviceItemId) {
        return -1;
      }
      if (now.serviceItemId > next.serviceItemId) {
        return 1;
      }
      return 0;
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const collatedData: { [key: string]: any } = {};
    contractData = contractData.map((value, index) => {
      value.isDiscountVisible = serviceItemDiscountVisibility;
      const { name, description } = value;
      const key = `${name}-${description}`;

      if (!collatedData[key]) {
        collatedData[key] = { ...value };
      } else {
        collatedData[key].quantity += value.quantity;
        collatedData[key].unitPrice = value.unitPrice;
        collatedData[key].totalPrice = (parseFloat(collatedData[key].totalPrice) + parseFloat(value.totalPrice)).toFixed(2);
      }
      value.rowNumber = index + 1;
      return value;
    });

    let rowNumber = 1;
    for (const key in collatedData) {
      collatedData[key].rowNumber = rowNumber++;
    }

    const entityPhone = service.Entity.countryCode + service.Entity.contactNumber;
    const collateItems = await SettingService.getSpecificSettings('COLLATEITEMS');
    const customFields: any[] = [];
    if (service.CustomFields.length > 0) {
      service.CustomFields.map(val => {
        customFields.push({
          label: val.label,
          value: val.value
        });
      });
    }

    let dataBinding: any = {
      id,
      logoUrl: logoUrl ? logoUrl : 'simplify_logo2C.png',
      entityName: service.Entity.name,
      entityAddress: service.Entity.address,
      entityPhone,
      entityEmail: service.Entity.email,
      registerNumberGST: service.Entity.registerNumberGST && service.Entity.registerNumberGST != 'N.A' ? service.Entity.registerNumberGST : '-',
      uenNumber: service.Entity.uenNumber ? service.Entity.uenNumber : '-',
      clientName: service.Client.name,
      billingAddress: service.Client.billingAddress,
      billingUnitFloor: service.Client.billingUnitNo ? `#${service.Client.billingFloorNo}-${service.Client.billingUnitNo}` : '-',
      billingPostal: `Singapore ${service.Client.billingPostal}`,
      serviceAddress: service.ServiceAddress.address,
      serviceUnitFloor: service.ServiceAddress.unitNo ? `#${service.ServiceAddress.floorNo}-${service.ServiceAddress.unitNo}` : '-',
      servicePostal: `Singapore ${service.ServiceAddress.postalCode}`,
      serviceType: service.serviceType === 'ADDITIONAL' ? 'VARIATION ORDER' : 'QUOTATION',
      termStart: format(new Date(service.termStart), 'dd MMM yyyy'),
      termEnd: format(new Date(service.termEnd), 'dd MMM yyyy'),
      serviceNumber: service.serviceNumber,
      serviceTitle: service.serviceTitle,
      description: service.description ? service.description : '-',
      contractData,
      collatedData,
      collateItems: collateItems.isActive,
      originalAmount: service.originalAmount.toLocaleString('en-sg', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      discountAmount: service.discountAmount.toLocaleString('en-sg', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      gstAmount: service.gstAmount.toLocaleString('en-sg', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      totalAmount: service.totalAmount.toLocaleString('en-sg', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      termCondition: service.termCondition,
      discountVisiblity: service.discountAmount > 0 ? true : false,
      serviceItemDiscountVisibility,
      gstTax: service.gstTax,
      salesPerson: service.salesPerson || '-',
      customFields: customFields,
      issueDate: service.issueDate ? `${format(new Date(service.issueDate), 'dd MMM yyyy')}` : '-',
      expiryDate: service.expiryDate ? `${format(new Date(service.expiryDate), 'dd MMM yyyy')}` : '-',
      contractTerm: format(new Date(service.termStart), 'dd MMM yyyy') + ' - ' + format(new Date(service.termEnd), 'dd MMM yyyy')
    };

    const compileTemplate = (directory: string, optionId: number, data: any) => {
      const filePath = path.join(__dirname, `../reports/contract/${directory}`, `option-${optionId}.html`);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const compiledTemplate = handlebars.compile(fileContent);
      return new handlebars.SafeString(compiledTemplate(data));
    };

    dataBinding = {
      ...dataBinding,
      headerOption: compileTemplate('header', quotationPdfOption.headerOptionId, dataBinding),
      clientInfoOption: compileTemplate('clientInformation', quotationPdfOption.clientInfoOptionId, dataBinding),
      termsConditionOption: compileTemplate('termsCondition', quotationPdfOption.tncOptionId, dataBinding),
      signatureOption: compileTemplate('signature', quotationPdfOption.signatureOptionId, dataBinding)
    };

    const { EXECUTABLEPATH } = process.env;

    const puppeteerValue: any = {
      args: ['--no-sandbox', '--disable-dev-shm-usage'],
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
    page.setDefaultTimeout(5000);

    const htmlFile = fs.readFileSync(path.join(`${__dirname}/../reports/contract/`, `pdf.html`), 'utf-8');
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
    throw err;
  }
};

/**
 * Update additional service in the system, based on user input
 *
 * @param id of the service
 * @param ServiceItems of the service
 * @param discountAmount of the service
 *
 * @returns ServiceModel
 */

export const updateAdditionalService = async (id: number, req: ServiceBody): Promise<Service> => {
  LOG.debug('Updating Service additional');

  try {
    const currentService = await ServiceDao.getServiceById(id);
    const invoice = await InvoiceDao.getInvoiceByServiceId(id);
    const schedule = await ScheduleDao.getScheduleByServiceId(id);

    if (invoice) {
      const invoiceStatus = invoice.getDataValue('invoiceStatus');
      if (invoice && invoiceStatus === InvoiceStatus.FULLY_PAID) {
        throw new ServiceNotEditableError(id);
      }
    }

    const needGST = currentService.getDataValue('needGST');
    const gst = currentService.getDataValue('gstTax') / 100;
    let originalAmount = 0;
    let gstAmount = 0;
    let totalAmount = 0;
    const discount = req.discountAmount ? req.discountAmount : 0;

    await Promise.all(
      req.ServiceItems.map(async (value: ServiceItem) => {
        if (value.isDeleted) {
          await ServiceItemDao.deleteServiceItemById(value.id);
        } else {
          const totalPriceItem = value.totalPrice;

          if (value.id > 0) {
            const serviceItem = await ServiceItemDao.getServiceItemById(value.id);

            if (!serviceItem) {
              throw new ServiceItemNotFoundError(value.id);
            }

            await serviceItem.update({
              name: value.name,
              description: value.description,
              quantity: value.quantity,
              unitPrice: value.unitPrice,
              totalPrice: value.totalPrice.toFixed(2),
              idQboWithGST: value.idQboWithGST ? value.idQboWithGST : null,
              IdQboWithoutGST: value.IdQboWithoutGST ? value.IdQboWithoutGST : null
            });
          } else {
            value.serviceId = id;
            value.scheduleId = schedule[0].id;
            value.totalPrice = Number(totalPriceItem.toFixed(2));
            delete value.id;

            const createdItem = await ServiceItemDao.createServiceItem(value);
            value.id = createdItem.id;
          }
          originalAmount += Number(totalPriceItem.toFixed(2));

          if (value.Equipments && value.Equipments.length > 0) {
            //delete service item equipment by service item id
            await ServiceItemEquipmentDao.deleteDataByServiceItemId(value.id);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const serviceItemEquipment: any[] = [];
            value.Equipments.map(equipment => {
              return serviceItemEquipment.push({ serviceItemId: value.id, equipmentId: equipment.id });
            });

            await ServiceItemEquipmentDao.create(serviceItemEquipment);
          } else {
            await ServiceItemEquipmentDao.deleteDataByServiceItemId(value.id);
          }
        }
      })
    );

    // await ServiceItemDao.bulkCreateServiceItem(ServiceItems.filter(val => !val.id));

    totalAmount = Number((originalAmount - discount).toFixed(2));
    if (needGST) {
      gstAmount = Number((totalAmount * gst).toFixed(2));
      totalAmount = Number((totalAmount + gstAmount).toFixed(2));
    }

    await currentService.update({ originalAmount, discountAmount: discount, gstAmount, totalAmount });

    if (invoice) {
      await invoice.update({ invoiceAmount: totalAmount });
      // call function to syncing invoice
      await InvoiceService.syncingInvoiceUpdate(invoice.id);
    }

    return await getServiceDetailById(id);
  } catch (err) {
    throw err;
  }
};

export const getSchedulesById = async (id: number): Promise<Schedule[]> => {
  LOG.debug('Getting schedules by id');

  const schedules = await ScheduleDao.getScheduleByServiceId(id);

  await Promise.all(
    schedules.map(async value => {
      const serviceItems = await ServiceItemDao.getServiceItemByScheduleId(value.id);
      const filterServiceItems = serviceItems
        .filter((item, index, self) => index === self.findIndex(obj => obj.name === item.name))
        .sort((a, b) => a.id - b.id);

      await Promise.all(
        filterServiceItems.map(async (item: ServiceItem) => {
          const equipments = await EquipmentService.getEquipmentByServiceItemId(item.id);
          item.Equipments = equipments;
          return item;
        })
      );

      value.setDataValue('ServiceItems', filterServiceItems);
      return value;
    })
  );

  return schedules;
};

export const getRenewService = async (id: number): Promise<{ service: Service; jobs: JobGenerateResponseModel[] }> => {
  LOG.debug('Getting service detail by id');

  const service = await ServiceDao.getServiceDetailById(id);
  const defaultGst = await GstTemplateService.getDefaultGst();

  if (!service) {
    throw new ServiceNotFoundError(id);
  }

  try {
    const serviceDuration = differenceInMonths(new Date(service.termEnd), new Date(service.termStart));
    const serviceType = service.serviceType;

    //set new amount
    const gst = (defaultGst.tax || 0) / 100;
    const needGST = service.needGST;
    const originalAmount = service.originalAmount || 0;
    const discountAmount = service.discountAmount || 0;
    let serviceAmount = 0;
    let gstAmount = 0;
    let totalAmount = 0;

    if (needGST) {
      serviceAmount = Number((originalAmount - discountAmount).toFixed(2));
      gstAmount = Number((serviceAmount * gst).toFixed(2));
      totalAmount = Number((originalAmount - discountAmount + gstAmount).toFixed(2));
    } else {
      serviceAmount = Number((originalAmount - discountAmount).toFixed(2));
      totalAmount = Number(serviceAmount.toFixed(2));
    }

    service.gstTax = needGST ? defaultGst.tax || 0 : 0;
    service.gstAmount = gstAmount;
    service.totalAmount = totalAmount;

    let newTermStart: Date;
    let newTermEnd: Date;

    if (serviceType === 'ADHOC') {
      newTermStart = new Date();
      newTermEnd = addMonths(newTermStart, serviceDuration);
    } else {
      newTermStart = addYears(new Date(service.termStart), 1);
      newTermEnd = addYears(new Date(service.termEnd), 1);
    }

    service.setDataValue('termStart', newTermStart);
    service.setDataValue('termEnd', newTermEnd);

    service.serviceStatus = ServiceStatus.PENDING;

    await Promise.all(
      service.Schedules.map(async schedule => {
        const newItems: ServiceItem[] = [];
        const startTime = format(schedule.startDateTime, 'HH:mm:ss');
        const endTime = format(schedule.endDateTime, 'HH:mm:ss');

        let newStartDateTime: Date;
        let newEndDateTime: Date;
        let newRepeatEndOnDate: Date;
        if (serviceType === 'ADHOC') {
          newStartDateTime = new Date(`${format(new Date(), 'yyyy-MM-dd')} ${startTime}`);
          newEndDateTime = new Date(`${format(new Date(), 'yyyy-MM-dd')} ${endTime}`);
          newRepeatEndOnDate = new Date();
        } else {
          newStartDateTime = addYears(schedule.startDateTime, 1);
          newEndDateTime = addYears(schedule.endDateTime, 1);
          newRepeatEndOnDate = addYears(new Date(schedule.repeatEndOnDate), 1);
        }

        schedule.setDataValue('startDateTime', newStartDateTime);
        schedule.setDataValue('endDateTime', newEndDateTime);
        schedule.setDataValue('repeatEndOnDate', newRepeatEndOnDate);

        if (schedule.ServiceItems) {
          const items = schedule.ServiceItems;

          await Promise.all(
            items.map(async (item: ServiceItem) => {
              //get equipments by service item id
              const equipments = await EquipmentService.getEquipmentByServiceItemId(item.id);
              item.setDataValue('Equipments', equipments);
              // item.setDataValue('id', 0);
              item.setDataValue('serviceId', 0);
              item.setDataValue('scheduleId', 0);

              const findSame = newItems.find(findItem => findItem.name === item.name && findItem.description === item.description);

              if (!findSame) {
                newItems.push(item);
              }
              // return newItems.sort((a, b) => a.name.localeCompare(b.name));
            })
          );
          newItems.sort((a, b) => a.id - b.id);
          // keep original id order for sorting, then clear ids so renewed items are treated as new
          newItems.forEach(item => {
            item.setDataValue('id', 0);
          });

          schedule.setDataValue('ServiceItems', newItems);
        }

        return schedule;
      })
    );

    const { jobs } = scheduling(service.Schedules);

    let i = 0;
    let currentScheduleId = 0;
    jobs.map(value => {
      const newItems: ServiceItem[] = [];
      value.ServiceItems.map(item => {
        const findSame = newItems.find(findItem => findItem.name === item.name && findItem.description === item.description);
        currentScheduleId = item.scheduleId;
        item.setDataValue('scheduleIndex', i);

        if (currentScheduleId !== item.scheduleId) {
          currentScheduleId = item.scheduleId;
          i++;
        }

        if (!findSame) {
          newItems.push(item);
        }
      });

      value.ServiceItems = newItems;
      return value;
    });

    const defaultContactPersons = await ClientAttributes.getEmail(await ClientService.getClientById(service.clientId), Number(service.id));
    const contacts = defaultContactPersons.ContactPersons.find(contact => contact.isDefault === true);
    service.setDataValue('ContactPersons', [contacts]);

    // const renewService: ServiceBody = {
    //   id: 0,
    //   serviceType: service.serviceType,
    //   serviceNumber: service.serviceNumber,
    //   serviceTitle: service.serviceTitle,
    //   description: service.description,
    //   serviceStatus: service.serviceStatus,
    //   needGST: service.Entity.needGST,
    //   termStart: service.termStart,
    //   termEnd: service.termEnd,
    //   contractAmount: service.originalAmount,
    //   contractDiscount: service.discountAmount,
    //   grandTotal: service.totalAmount,
    //   skills: service.ServiceSkills,
    //   serviceAddress: service.ServiceAddress.address,
    //   postalCode: service.ServiceAddress.postalCode,
    //   billingAddress: service.Client.billingAddress,
    //   billingPostalCode: service.Client.billingPostal,
    //   clientName: service.Client.name,
    //   entityName: service.Entity.name,
    //   clientType: service.Client.clientType,
    //   salesPerson: service.salesPerson || '',
    //   Jobs: service.Jobs || []
    // };

    // console.log(renewService);

    return { service, jobs };
  } catch (err) {
    throw err;
  }
};

export const updateRenewServiceStatus = async (id: number, renewedServiceId: number): Promise<Service> => {
  LOG.debug('Updating Service Renew Status');
  const service = await ServiceDao.getServiceById(id);

  if (!service) {
    throw new ServiceNotFoundError(id);
  }

  try {
    service.update({ isRenewed: true, renewedServiceId });
    return await getServiceDetailById(id);
  } catch (err) {
    throw err;
  }
};

export const sendEmail = async (id: number, contactEmail: string[]): Promise<void> => {
  try {
    const service = await getServiceDetailById(id);

    const template = await SettingService.getSpecificSettings('CONTRACTEMAILTEMPLATE', 'ContractEmailTemplate');

    const replacementValues: Record<string, string> = {
      clientName: service.Client.name,
      quotationNumber: service.serviceNumber,
      quotationTitle: service.serviceTitle,
      serviceAddress: service.ServiceAddress.address,
      quotationTerm: format(new Date(service.termStart), 'dd-MM-yyyy') + ' to ' + format(new Date(service.termEnd), 'dd-MM-yyyy'),
      quotationAmount: `$${service.totalAmount}`,
      contactPerson: service.ContactPersons.some(contact => contact.isMain)
        ? service.ContactPersons.find(contact => contact.isMain).contactPerson
        : ''
    };

    const emailBody = template.value.replace(/{([^}]+)}/g, (match, placeholder) => {
      return replacementValues[placeholder] || match;
    });

    const serviceFile = await exportPdf(id);

    let logoUrl;
    if (service.Entity.logo) {
      logoUrl = await AwsService.s3BucketGetSignedUrl(service.Entity.logo, 'entities');
    }

    const entityPhone = service.Entity.countryCode + service.Entity.contactNumber;

    const sendEmail = await EmailService.sendServiceEmail(
      contactEmail,
      service.Client.name,
      service.serviceNumber,
      service.serviceTitle,
      serviceFile,
      service.Entity.name,
      logoUrl,
      service.Entity.email,
      entityPhone,
      service.Entity.address,
      emailBody,
      service.ServiceAddress.address
    );

    return sendEmail;
  } catch (err) {
    throw err;
  }
};

export const getLastService = async (): Promise<any> => {
  try {
    const { id } = await ServiceDao.getLastId();
    const service = await getServiceDetailById(id);

    let logoUrl;
    if (service.Entity.logo) {
      logoUrl = await AwsService.s3BucketGetSignedUrl(service.Entity.logo, 'entities');
    }

    const entityPhone = service.Entity.countryCode + service.Entity.contactNumber;

    const rows = {
      contactEmail: service.ContactPersons ? service.ContactPersons.find(contact => contact.isMain).contactEmail : null,
      clientName: service.Client.name,
      serviceNumber: service.serviceNumber,
      serviceTitle: service.serviceTitle,
      serviceAddress: service.ServiceAddress.address,
      entityName: service.Entity.name,
      contractTerm: format(new Date(service.termStart), 'dd-MM-yyyy') + ' to ' + format(new Date(service.termEnd), 'dd-MM-yyyy'),
      contractAmount: `$${service.totalAmount}`,
      logoUrl: logoUrl ? logoUrl : null,
      entityEmail: service.Entity.email,
      entityPhone: entityPhone,
      entityAddress: service.Entity.address,
      contactPerson: service.ContactPersons ? service.ContactPersons.find(contact => contact.isMain).contactPerson : null
    };

    return rows;
  } catch (err) {
    throw err;
  }
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const generateSchedule = async (schedule: any, isNextDay?: boolean): Promise<any> => {
  LOG.info('Generate schedule');

  try {
    const { jobs } = scheduling(schedule);

    if (isNextDay) {
      const jobDates: any[] = [];
      jobs.map(val => jobDates.push(val.startDateTime));
      const ph = await publicHolidays(jobDates);

      const holidaysDate = ph;
      if (holidaysDate.length > 0) {
        holidaysDate.map(value => {
          const getIndex = jobs.findIndex(job => isSameDay(new Date(job.startDateTime), new Date(value.date)));
          const getJob = jobs.find(job => isSameDay(new Date(job.startDateTime), new Date(value.date)));
          if (getIndex !== -1) {
            let newStartJobDate = new Date(getJob.startDateTime);
            let newEndJobDate = new Date(getJob.endDateTime);

            // eslint-disable-next-line no-loop-func
            while (getDay(newStartJobDate) === 0 || holidaysDate.some(value => isSameDay(new Date(value.date), newStartJobDate))) {
              newStartJobDate = addDays(newStartJobDate, 1);
              newEndJobDate = addDays(newEndJobDate, 1);
            }

            jobs[getIndex].startDateTime = format(newStartJobDate, 'yyyy-MM-dd HH:mm:00');
            jobs[getIndex].endDateTime = format(newEndJobDate, 'yyyy-MM-dd HH:mm:00');
          }
          return jobs;
        });
      }
    }

    return jobs;
  } catch (err) {
    throw err;
  }
};

export const getByServiceNumber = async (tenant: string, serviceNumber: number): Promise<any> => {
  try {
    return await ServiceDao.getServiceDetailByServiceNumber(tenant, serviceNumber);
  } catch (err) {
    throw err;
  }
};

export const getByServiceAddressId = async (serviceAddressId: number): Promise<any> => {
  try {
    return await ServiceDao.getServicesByServiceAddressId(serviceAddressId);
  } catch (err) {
    throw err;
  }
};
