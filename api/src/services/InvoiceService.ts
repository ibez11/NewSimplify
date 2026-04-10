/* eslint-disable @typescript-eslint/no-explicit-any */
import Logger from '../Logger';
import * as AwsService from './AwsService';
import * as InvoiceDao from '../database/dao/InvoiceDao';
import * as UserProfileDao from '../database/dao/UserProfileDao';
import * as JobDao from '../database/dao/JobDao';
import * as ServiceItemDao from '../database/dao/ServiceItemDao';
import * as ServiceDao from '../database/dao/ServiceDao';
import * as InvoiceHistoryService from './InvoiceHistoryService';
import * as CollectedAmountHistoryService from '../services/CollectedAmountHistoryService';
import * as UserProfileJobDao from '../database/dao/UserProfileJobDao';
import * as CollectedAmountHistoryDao from '../database/dao/CollectedAmountHistoryDao';
import * as ContactPersonDao from '../database/dao/ContactPersonDao';
import { ServiceTypes } from '../database/models/Service';
import Invoice from '../database/models/Invoice';
import InvoiceNotFoundError from '../errors/InvoiceNotFoundError';
// import InvoiceCollectedAmountError from '../errors/InvoiceCollectedAmountError';
import { DuplicatedInvoiceError, DuplicatedInvoiceNumberError } from '../errors/DuplicatedInvoiceError';
import * as SettingService from '../services/SettingService';

import { format, startOfWeek, subMonths, startOfMonth, lastDayOfMonth } from 'date-fns';
import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';
import * as EmailService from './EmailService';
import { InvoiceCsvResponseModel, InvoiceDetailResponseModel } from '../typings/ResponseFormats';
import { InvoiceBody } from '../typings/body/InvoiceBody';
import puppeteer from 'puppeteer';
import { JobStatus, PaymentMethod } from '../database/models/Job';
import * as PdfTemplateOptionsService from './PdfTemplateOptionsService';
import { PdfTemplateOptionsBody } from '../typings/body/PdfTemplateOptionsBody';

const LOG = new Logger('InvoiceService');

/**
 * Search Invoice with query and optional pagination
 *
 * @param s offset for pagination search
 * @param l limit for pagination search
 * @param q query for searching
 *
 * @returns the total counts and the data for current page
 */
export const searchInvoiceWithPagination = async (
  offset: number,
  limit?: number,
  q?: string,
  startDate?: Date,
  endDate?: Date,
  isSynchronize?: boolean,
  needGST?: boolean,
  invoiceStatus?: string | [],
  orderBy?: string
): Promise<{ rows: Invoice[]; count: number }> => {
  LOG.debug('Searching Invoices with Pagination');
  return await InvoiceDao.getPaginated(offset, limit, q, startDate, endDate, isSynchronize, needGST, invoiceStatus, orderBy);
};

export const invoiceZapier = async (
  offset: number,
  limit?: number,
  q?: string,
  isSynchronize?: boolean,
  needGST?: boolean,
  orderBy?: string
): Promise<InvoiceBody[]> => {
  LOG.debug('Searching Invoices for zapier');
  const result = await InvoiceDao.getInvoiceZapier(offset, limit, q, isSynchronize, needGST, orderBy);
  await Promise.all(
    result.map(async val => {
      const { rows } = await ContactPersonDao.getByClientId(val.clientId);
      const contact = rows.find(contact => contact.isMain === true);
      val.clientEmail = contact ? contact.contactEmail : '';
    })
  );
  return result;
};

export const exportCsv = async (
  offset: number,
  limit?: number,
  q?: string,
  startDate?: Date,
  endDate?: Date,
  isSynchronize?: boolean,
  needGST?: boolean,
  invoiceStatus?: string | [],
  orderBy?: string
): Promise<any[]> => {
  LOG.debug('Searching Invoices with Pagination');

  const { rows } = await InvoiceDao.getDataCsv(offset, limit, q, startDate, endDate, isSynchronize, needGST, invoiceStatus, orderBy);

  const results: InvoiceCsvResponseModel[] = [];

  if (rows) {
    await Promise.all(
      rows.map(async row => {
        results.push({
          invoiceNumber: row.invoiceNumber,
          clientName: row.Service.Client.name,
          invoiceTitle: row.Service.serviceTitle,
          invoiceDate: format(new Date(row.createdAt), 'dd-MM-yyyy'),
          totalAmount: row.invoiceAmount,
          collectedAmount: row.collectedAmount,
          invoiceStatus: row.invoiceStatus,
          entityName: row.Service.Entity.name,
          customFieldLabel1: row.Service.CustomFields?.[0]?.label || '-',
          customFieldValue1: row.Service.CustomFields?.[0]?.value || '-',
          customFieldLabel2: row.Service.CustomFields?.[1]?.label || '-',
          customFieldValue2: row.Service.CustomFields?.[1]?.value || '-'
        });
      })
    );
  }

  // return await InvoiceDao.getDataCsv(offset, limit, q, startDate, endDate, isSynchronize, needGST, invoiceStatus, orderBy);
  return results;
};

/**
 * Check if a invoice number exists
 *
 * @param invoiceNumber of the required invoice
 *
 * @returns boolean
 */
export const isInvoiceExistsByInvoiceNumber = async (invoiceNumber: string): Promise<boolean> => {
  return (await InvoiceDao.countByInvoiceNumber(invoiceNumber)) > 0;
};

/**
 * Check if there is invoice in service
 *
 * @param serviceId of the required invoice
 *
 * @returns boolean
 */
export const isInvoiceExistsByServiceId = async (serviceId: number): Promise<boolean> => {
  return (await InvoiceDao.countByServiceId(serviceId)) > 0;
};

/**
 * Create a new invoice in the system, based on user input
 *
 * @param invoiceNumber of the new invoice
 * @param termStart of the new invoice
 * @param termEnd of the new invoice
 * @param invoiceAmount of the new invoice
 * @param serviceId of the new invoice
 *
 * @returns invoice
 */
export const createInvoice = async (
  invoiceNumber: string,
  serviceId: number,
  invoiceDate: Date,
  userId: number,
  attnTo?: string
): Promise<Invoice> => {
  LOG.debug('Creating Invoice');

  if (await isInvoiceExistsByInvoiceNumber(invoiceNumber)) {
    throw new DuplicatedInvoiceNumberError();
  }

  if (await isInvoiceExistsByServiceId(serviceId)) {
    throw new DuplicatedInvoiceError();
  }

  try {
    const service = await ServiceDao.getServiceDetailById(serviceId);
    let invoiceCollectedAmount = 0;

    if (service.serviceType === ServiceTypes.ADDITIONAL) {
      const { additionalCollectedAmount } = await JobDao.getAdditionalCollectedAmountByAdditionalServiceId(serviceId);
      invoiceCollectedAmount = additionalCollectedAmount;
    } else {
      const { collectedAmount } = await JobDao.getTotalCollectedAmountByServiceId(serviceId);
      invoiceCollectedAmount = collectedAmount;
    }

    const userProfile = await UserProfileDao.getById(userId);
    const description = `Invoice has been created by ADMIN ${userProfile.displayName}`;
    const invoice = await InvoiceDao.create(
      invoiceNumber,
      format(new Date(service.termStart), 'yyyy-MM-dd'),
      format(new Date(service.termEnd), 'yyyy-MM-dd'),
      service.totalAmount,
      invoiceCollectedAmount,
      serviceId,
      userProfile.displayName,
      invoiceDate,
      attnTo
    );
    await InvoiceHistoryService.createInvoiceHistory(userId, invoice.id, 'Created', description);
    return invoice;
  } catch (err) {
    throw err;
  }
};

export const getInvoiceByServiceId = (serviceId: number): Promise<Invoice> => {
  return InvoiceDao.getInvoiceByServiceId(serviceId);
};

/**
 * edit a invoice in the system, based on user input
 *
 * @param invoiceNumber of the invoice
 * @param invoiceStatus of the invoice
 * @param collectedAmount of the invoice
 * @param chargeAmount of the invoice
 * @param chargeAmount of the invoice
 *
 * @returns ServiceItemTemplatesModel
 */
export const editInvoice = async (
  id: number,
  invoiceNumber: string,
  collectedAmount: number,
  chargeAmount?: number,
  paymentMethod?: string,
  invoiceStatus?: string,
  isSynchronize?: boolean,
  remarks?: string,
  isUpdateCollectedAmount?: boolean,
  isUpdateInvoiceNumber?: boolean,
  userId?: number,
  termEnd?: Date,
  dueDate?: string,
  chequeNumber?: string,
  invoiceDate?: Date,
  attnTo?: string
): Promise<InvoiceDetailResponseModel> => {
  LOG.debug('Editing Invoice');

  if (isUpdateInvoiceNumber) {
    if (await isInvoiceExistsByInvoiceNumber(invoiceNumber)) {
      throw new DuplicatedInvoiceNumberError();
    }
  }
  const invoice = await InvoiceDao.getInvoiceById(id);

  if (!invoice) {
    throw new InvoiceNotFoundError(id);
  }

  try {
    if (isUpdateCollectedAmount) {
      // create invoice history and collected amount history
      const currentUser = await UserProfileDao.getUserFullDetails(userId);
      let description = '';

      await CollectedAmountHistoryService.createCollectedAmountHistory(
        Number(invoice.serviceId),
        currentUser.displayName,
        collectedAmount,
        paymentMethod,
        id,
        null,
        false
      );

      if (invoiceStatus === 'UNPAID') {
        collectedAmount = 0;
        description = `${currentUser.role} ${currentUser.displayName} changed invoice to (UNPAID)`;
      } else {
        description =
          invoiceStatus === 'FULLY PAID'
            ? `Payment Received fully $${collectedAmount} collected by ${currentUser.role} ${currentUser.displayName} (${
                paymentMethod === PaymentMethod.CHEQUE ? `CHEQUE, No. ${chequeNumber}` : paymentMethod
              })`
            : `Partial Payment $${collectedAmount} collected by ${currentUser.role} ${currentUser.displayName} ${
                paymentMethod ? ` (${paymentMethod === PaymentMethod.CHEQUE ? `CHEQUE, No. ${chequeNumber}` : paymentMethod})` : ''
              }`;
        collectedAmount += invoice.collectedAmount;
      }

      await InvoiceHistoryService.createInvoiceHistory(currentUser.id, invoice.id, invoiceStatus, description);
      // call function to syncing invoice
      await syncingInvoiceUpdate(invoice.id);
    }

    await invoice.update({
      invoiceNumber,
      collectedAmount: collectedAmount > invoice.invoiceAmount ? invoice.invoiceAmount : collectedAmount,
      chargeAmount,
      paymentMethod: paymentMethod ? paymentMethod.toUpperCase() : invoice.paymentMethod,
      invoiceStatus,
      isSynchronize,
      remarks,
      termEnd,
      dueDate,
      chequeNumber,
      invoiceDate,
      attnTo
    });

    return await getFullDetailById(id);
  } catch (err) {
    throw err;
  }
};

/**
 * edit a invoice in the system, based on user input
 *
 * @param isSynchronize of the invoice
 *
 * @returns ServiceItemTemplatesModel
 */
export const syncingInvoice = async (id: number, isSynchronize: boolean, userId: number): Promise<InvoiceDetailResponseModel> => {
  LOG.debug('Editing Invoice');

  const invoice = await InvoiceDao.getInvoiceById(id);

  if (!invoice) {
    throw new InvoiceNotFoundError(id);
  }

  try {
    // create invoice history
    const currentUser = await UserProfileDao.getUserFullDetails(userId);
    const description = `Invoice has been syncronized by ADMIN ${currentUser.displayName}`;
    await InvoiceHistoryService.createInvoiceHistory(userId, invoice.id, 'Syncronized', description);

    if (!invoice.isSynchronize) {
      await invoice.update({
        isSynchronize,
        newInvoice: new Date()
      });
    }
    return await getFullDetailById(id);
  } catch (err) {
    throw err;
  }
};

export const syncingInvoiceUpdate = async (id: number): Promise<void> => {
  LOG.debug('Editing Invoice');

  const invoice = await InvoiceDao.getInvoiceById(id);

  if (!invoice) {
    throw new InvoiceNotFoundError(id);
  }

  try {
    await invoice.update({
      updateInvoice: new Date()
    });
  } catch (err) {
    throw err;
  }
};

export const getDetailById = async (id: number): Promise<Invoice> => {
  LOG.debug('Getting Invoice Details by Id');

  const invoice = await InvoiceDao.getFullDetail(id);

  if (!invoice) {
    throw new InvoiceNotFoundError(id);
  }

  if (invoice) {
    let jobs = invoice.Service.Jobs;

    if (invoice.Service.serviceType === ServiceTypes.ADDITIONAL) {
      jobs = await JobDao.getJobByAdditionalServiceId(invoice.Service.id);
    }

    await Promise.all(
      jobs.map(async job => {
        let items = await ServiceItemDao.getServiceItemByJobId(job.id);
        let collectedAmount = job.collectedAmount ? job.collectedAmount : 0;
        if (invoice.Service.serviceType === ServiceTypes.ADDITIONAL) {
          items = await ServiceItemDao.getServiceItemByServiceId(Number(job.additionalServiceId));
          collectedAmount = job.additionalCollectedAmount ? job.additionalCollectedAmount : 0;
        }

        let jobAmount = 0;
        items.map(async item => {
          jobAmount += Number(item.totalPrice);
        });

        const discount = (invoice.Service.discountAmount / invoice.Service.totalJob).toFixed(2);
        const gst = (invoice.Service.gstAmount / invoice.Service.totalJob).toFixed(2);
        const totalAmount = (Number(jobAmount) - Number(discount) + Number(gst)).toFixed(2);

        job.setDataValue('totalServiceItem', items.length);
        job.setDataValue('serviceItemsJob', items);
        job.setDataValue('jobAmount', jobAmount.toString());
        job.setDataValue('totalAmount', totalAmount);
        job.setDataValue('collectedAmount', collectedAmount);
        job.setDataValue('collectedBy', job.collectedBy);
        job.setDataValue('chequeNumber', job.chequeNumber || '');
      })
    );

    invoice.Service.Jobs = jobs;
  }

  return invoice;
};

export const getFullDetailById = async (id: number): Promise<InvoiceDetailResponseModel> => {
  LOG.debug('Getting Invoice Details by Id');

  const invoice = await InvoiceDao.getInvoiceById(id);

  if (!invoice) {
    throw new InvoiceNotFoundError(id);
  }

  const invoiceDetail = await getDetailById(id);
  const invoiceHistory = await InvoiceHistoryService.getHistoryByInvoiceId(Number(id));

  const result: InvoiceDetailResponseModel = {
    id: invoiceDetail.id,
    invoiceNumber: invoiceDetail.invoiceNumber,
    invoiceStatus: invoiceDetail.invoiceStatus,
    invoiceAmount: invoiceDetail.invoiceAmount,
    invoiceRemarks: invoiceDetail.remarks,
    createdAt: invoiceDetail.createdAt,
    termEnd: invoiceDetail.termEnd,
    dueDate: invoiceDetail.dueDate,
    Client: invoiceDetail.Service.Client,
    Job: invoiceDetail.Service.Jobs.sort((a, b) => a.id - b.id),
    contractId: invoiceDetail.Service.id,
    contractAmount: invoiceDetail.Service.originalAmount || 0,
    contractDiscount: invoiceDetail.Service.discountAmount || 0,
    gstTax: invoiceDetail.Service.gstTax,
    gst: invoiceDetail.Service.gstAmount || 0,
    totalCollectedAmount: invoiceDetail.collectedAmount || 0,
    totalOutstandingAmount: invoiceDetail.invoiceAmount - invoice.collectedAmount,
    InvoiceHistory: invoiceHistory,
    newInvoice: invoiceDetail.newInvoice,
    updateInvoice: invoiceDetail.updateInvoice,
    chequeNumber: invoiceDetail.chequeNumber,
    invoiceDate: invoiceDetail.invoiceDate,
    attnTo: invoiceDetail.attnTo
  };

  return result;
};

export const exportPdf = async (id: number, query?: PdfTemplateOptionsBody): Promise<Buffer> => {
  try {
    const invoice = await getDetailById(id);
    const { DOMAIN } = process.env;
    const invoicePdfOption = query ? query : await PdfTemplateOptionsService.getPdfTemplateOptionsByFileName('invoice');

    let logoUrl = `https://${DOMAIN}/simplify_logo2C.png`;
    if (invoice.Service.Entity.logo) {
      logoUrl = await AwsService.s3BucketGetSignedUrl(invoice.Service.Entity.logo, 'entities');
    }

    let qrImage = '';
    if (invoice.Service.Entity.qrImage) {
      qrImage = await AwsService.s3BucketGetSignedUrl(invoice.Service.Entity.qrImage, 'entities');
    }

    //eslint-disable-next-line
    let contractData: any[] = [];

    if (invoice.Service.serviceType === ServiceTypes.ADDITIONAL) {
      const job = await JobDao.getJobDetailByAdditionalServiceId(invoice.Service.id);
      const ServiceItem = await ServiceItemDao.getServiceItemByServiceId(invoice.Service.id);

      if (ServiceItem) {
        ServiceItem.map(serviceItem => {
          contractData.push({
            jobDate: format(new Date(job.startDateTime), invoicePdfOption.tableOptionId == 1 ? 'dd MMM yyyy' : 'MMM yyyy'),
            name: serviceItem.name,
            description: serviceItem.description,
            quantity: serviceItem.quantity,
            unitPrice: serviceItem.unitPrice,
            totalPrice: serviceItem.totalPrice.toLocaleString('en-sg', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          });
        });
      }
    } else {
      const jobs = await JobDao.getJobByServiceId(invoice.serviceId);

      if (jobs) {
        await Promise.all(
          // eslint-disable-next-line
          jobs.map(async (job: any) => {
            const ServiceItem = await ServiceItemDao.getServiceItemByJobId(job.id);

            if (ServiceItem) {
              ServiceItem.map(serviceItem => {
                contractData.push({
                  id: job.id,
                  jobDate: format(new Date(job.startDateTime), invoicePdfOption.tableOptionId == 1 ? 'dd MMM yyyy' : 'MMM yyyy'),
                  name: serviceItem.name,
                  description: serviceItem.description,
                  quantity: serviceItem.quantity,
                  unitPrice: serviceItem.unitPrice.toLocaleString('en-sg', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                  totalPrice: serviceItem.totalPrice.toLocaleString('en-sg', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                });
              });
            }
          })
        );
      }
    }

    const balance = invoice.invoiceAmount - invoice.collectedAmount;
    const totalAmount = invoice.Service.originalAmount - invoice.Service.discountAmount;
    //sort job by Date
    contractData = contractData.sort((a, b) => a.id - b.id);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const collatedData: { [key: string]: any } = {};
    contractData = contractData.map(value => {
      const { name, description } = value;
      const key = `${name}-${description}`;

      if (!collatedData[key]) {
        collatedData[key] = { ...value };
      } else {
        collatedData[key].quantity += value.quantity;
        collatedData[key].unitPrice = value.unitPrice;
        collatedData[key].totalPrice = (parseFloat(collatedData[key].totalPrice) + parseFloat(value.totalPrice)).toFixed(2);
      }
      return value;
    });

    const entityContactNumber = invoice.Service.Entity.countryCode + invoice.Service.Entity.contactNumber;
    const gstTax = invoice.Service.gstTax;
    const registerNumberGST =
      invoice.Service.Entity.registerNumberGST && invoice.Service.Entity.registerNumberGST != 'N.A' ? invoice.Service.Entity.registerNumberGST : '-';
    const isDiscountVisible = invoice.Service.discountAmount > 0 ? true : false;
    const collateItems = await SettingService.getSpecificSettings('COLLATEITEMS');

    const customFields: any[] = [];
    if (invoice.Service.CustomFields != null) {
      invoice.Service.CustomFields.map(val => {
        customFields.push({
          label: val.label,
          value: val.value
        });
      });
    }

    let dataBinding: any = {
      logoUrl: logoUrl,
      qrImage: qrImage ? qrImage : null,
      entityName: invoice.Service.Entity.name,
      entityAddress: invoice.Service.Entity.address,
      entityContactNumber,
      entityEmail: invoice.Service.Entity.email,
      registerNumberGST: registerNumberGST,
      uenNumber: invoice.Service.Entity.uenNumber ? invoice.Service.Entity.uenNumber : '-',
      invoiceFooter: invoice.Service.Entity.invoiceFooter ? invoice.Service.Entity.invoiceFooter : null,
      clientName: invoice.Service.Client.name,
      billingAddress: invoice.Service.Client.billingAddress.toLowerCase().replace(/\b\w/g, firstChar => firstChar.toUpperCase()),
      serviceAddress: invoice.Service.ServiceAddress.address.toLowerCase().replace(/\b\w/g, firstChar => firstChar.toUpperCase()),
      invoiceNo: invoice.invoiceNumber,
      createdDate: format(new Date(invoice.invoiceDate), 'dd MMM yyyy'),
      termStart: format(new Date(invoice.termStart), 'dd MMM yyyy'),
      termEnd: format(new Date(invoice.termEnd), 'dd MMM yyyy'),
      dueDate: invoice.dueDate,
      contractNo: invoice.Service.serviceTitle,
      contractData,
      collatedData,
      collateItems: collateItems.isActive,
      originalAmount: invoice.Service.originalAmount.toLocaleString('en-sg', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      discountAmount: invoice.Service.discountAmount.toLocaleString('en-sg', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      isDiscountVisible: isDiscountVisible,
      gstAmount: invoice.Service.gstAmount.toLocaleString('en-sg', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      amountDue: balance.toLocaleString('en-sg', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      invoiceAmount: totalAmount.toLocaleString('en-sg', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      collectedAmount: invoice.collectedAmount.toLocaleString('en-sg', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      gstTax,
      salesPerson: invoice.Service.salesPerson || '-',
      invoiceStatus: invoice.invoiceStatus.toLowerCase().replace(/\b\w/g, firstChar => firstChar.toUpperCase()),
      chipStatus:
        invoice.invoiceStatus === 'FULLY PAID'
          ? 'fully'
          : invoice.invoiceStatus === 'PARTIALLY PAID'
          ? 'partially'
          : invoice.invoiceStatus === 'UNPAID'
          ? 'unpaid'
          : 'cancelled',
      colspan: collateItems.isActive ? 3 : 4,
      customFields: customFields,
      attnTo: invoice.attnTo || '-'
    };

    const compileTemplate = (directory: string, optionId: number, data: any) => {
      const filePath = path.join(__dirname, `../reports/invoice/${directory}`, `option-${optionId}.html`);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const compiledTemplate = handlebars.compile(fileContent);
      return new handlebars.SafeString(compiledTemplate(data));
    };

    dataBinding = {
      ...dataBinding,
      headerOption: compileTemplate('header', invoicePdfOption.headerOptionId, dataBinding),
      clientInfoOption: compileTemplate('clientInformation', invoicePdfOption.clientInfoOptionId, dataBinding),
      termsConditionOption: compileTemplate('termsCondition', invoicePdfOption.tncOptionId, dataBinding)
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
    const htmlFile = fs.readFileSync(path.join(`${__dirname}/../reports/invoice/`, 'pdf.html'), 'utf-8');
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

// eslint-disable-next-line
export const getInvoiceInformation = async (): Promise<any> => {
  LOG.debug('Invoice Invoice Information');

  try {
    const today = format(new Date(), 'yyyy-MM-dd');
    const lastMonth = subMonths(new Date(), 1);
    const firstInWeek = format(startOfWeek(new Date()), 'yyyy-MM-dd');
    const startDateLastMonth = format(startOfMonth(lastMonth), 'yyyy-MM-dd');
    const endDateLastMonth = format(lastDayOfMonth(lastMonth), 'yyyy-MM-dd');

    let invoiceInfo = await InvoiceDao.getInvoiceInformation(today, firstInWeek, startDateLastMonth, endDateLastMonth);

    if (invoiceInfo.length === 0) {
      invoiceInfo = [
        {
          invoiceToday: 0,
          valueInvoiceToday: 0,
          invoiceThisWeek: 0,
          valueInvoiceThisWeek: 0,
          invoiceLastMonth: 0,
          valueInvoiceLastMonth: 0,
          unpaidInvoice: 0,
          valueUnpaidInvoice: 0
        }
      ];
    }

    return {
      invoiceToday: invoiceInfo[0].invoiceToday ? invoiceInfo[0].invoiceToday : 0,
      valueInvoiceToday: invoiceInfo[0].valueInvoiceToday ? invoiceInfo[0].valueInvoiceToday : 0,
      invoiceThisWeek: invoiceInfo[0].invoiceThisWeek ? invoiceInfo[0].invoiceThisWeek : 0,
      valueInvoiceThisWeek: invoiceInfo[0].valueInvoiceThisWeek ? invoiceInfo[0].valueInvoiceThisWeek : 0,
      invoiceLastMonth: invoiceInfo[0].invoiceLastMonth ? invoiceInfo[0].invoiceLastMonth : 0,
      valueInvoiceLastMonth: invoiceInfo[0].valueInvoiceLastMonth ? invoiceInfo[0].valueInvoiceLastMonth : 0,
      unpaidInvoice: invoiceInfo[0].unpaidInvoice ? invoiceInfo[0].unpaidInvoice : 0,
      valueUnpaidInvoice: invoiceInfo[0].valueUnpaidInvoice ? invoiceInfo[0].valueUnpaidInvoice : 0
    };
  } catch (err) {
    throw err;
  }
};

export const sendEmail = async (id: number, userId: number, contactPerson: string[]): Promise<void> => {
  try {
    const invoiceDetail = await getDetailById(id);
    const contacts = invoiceDetail.Service.Client.ContactPersons.find(contact => contact.isMain == true);
    const clientEmail = contacts.contactEmail;
    const clientName = invoiceDetail.Service.Client.name;
    const entityName = invoiceDetail.Service.Entity.name;
    const entityEmail = invoiceDetail.Service.Entity.email;
    const entityContactNumber = `${invoiceDetail.Service.Entity.countryCode}${invoiceDetail.Service.Entity.contactNumber}`;
    const entityAddress = invoiceDetail.Service.Entity.address;

    const template = await SettingService.getSpecificSettings('INVOICEEMAILTEMPLATE', 'InvoiceEmailTemplate');

    const replacementValues: Record<string, string> = {
      clientName: clientName,
      invoiceNumber: invoiceDetail.invoiceNumber,
      quotationTitle: invoiceDetail.Service.serviceTitle,
      contactPerson: contacts.contactPerson,
      termEnd: format(new Date(invoiceDetail.Service.termEnd), 'dd-MM-yyyy'),
      invoiceAmount: `$${invoiceDetail.invoiceAmount}`
    };

    const emailBody = template.value.replace(/{([^}]+)}/g, (match, placeholder) => {
      return replacementValues[placeholder] || match;
    });

    const invoiceFile = await exportPdf(id);

    const contactEmail = contactPerson ? [contacts.contactEmail] : [];

    if (invoiceDetail.Service.Client.ContactPersons) {
      invoiceDetail.Service.Client.ContactPersons.map(additional => {
        return contactEmail.push(additional.contactEmail);
      });
    }

    let logoUrl;
    if (invoiceDetail.Service.Entity.logo) {
      logoUrl = await AwsService.s3BucketGetSignedUrl(invoiceDetail.Service.Entity.logo, 'entities');
    }

    const sendEmail = await EmailService.sendInvoiceEmail(
      contactEmail,
      clientName,
      invoiceDetail.invoiceNumber,
      invoiceDetail.Service.serviceTitle,
      invoiceFile,
      entityName,
      logoUrl,
      entityEmail,
      entityContactNumber,
      entityAddress,
      emailBody
    );

    // create invoice history and collected amount history
    const currentUser = await UserProfileDao.getUserFullDetails(userId);
    const description = `Invoice has been sent to client email by ADMIN ${currentUser.displayName}`;
    await InvoiceHistoryService.createInvoiceHistory(currentUser.id, id, 'Sent to Client', description);

    return sendEmail;
  } catch (err) {
    throw err;
  }
};

//delete invoice by id
export const deleteInvoice = async (invoiceId: number): Promise<Invoice> => {
  const invoice = await InvoiceDao.getInvoiceById(invoiceId);
  await CollectedAmountHistoryDao.softDeleteByInvoiceId(invoiceId);
  await InvoiceDao.deleteInvoice(invoiceId);

  return invoice;
};

export const getLastInvoice = async (): Promise<any> => {
  try {
    const { id } = await InvoiceDao.getLastId();
    const invoiceDetail = await getDetailById(id);
    const contacts = invoiceDetail.Service.Client.ContactPersons.find(contact => contact.isMain == true);

    let logoUrl;
    if (invoiceDetail.Service.Entity.logo) {
      logoUrl = await AwsService.s3BucketGetSignedUrl(invoiceDetail.Service.Entity.logo, 'entities');
    }

    const rows = {
      clientEmail: contacts ? contacts.contactEmail : null,
      clientName: invoiceDetail.Service.Client.name,
      invoiceNumber: invoiceDetail.invoiceNumber,
      serviceTitle: invoiceDetail.Service.serviceTitle,
      entityName: invoiceDetail.Service.Entity.name,
      logoUrl: logoUrl ? logoUrl : null,
      entityEmail: invoiceDetail.Service.Entity.email,
      entityContactNumber: `${invoiceDetail.Service.Entity.countryCode}${invoiceDetail.Service.Entity.contactNumber}`,
      entityAddress: invoiceDetail.Service.Entity.address,
      termEnd: format(new Date(invoiceDetail.Service.termEnd), 'dd-MM-yyyy'),
      invoiceAmount: `$${invoiceDetail.invoiceAmount}`,
      contactPerson: contacts ? contacts.contactPerson : null
    };

    return rows;
  } catch (err) {
    throw err;
  }
};

export const hasUnpaidInvoicesByClientId = async (clientId: number): Promise<boolean> => {
  return await InvoiceDao.hasUnpaidInvoicesByClientId(clientId);
};

export const hasUnpaidInvoicesByServiceId = async (serviceId: number): Promise<boolean> => {
  return await InvoiceDao.hasUnpaidInvoicesByServiceId(serviceId);
};
