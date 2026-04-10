import Service from '../../database/models/Service';
import { ServiceBody } from '../body/ServiceBody';

interface ServiceAttributes {
  get: (param: Service) => ServiceBody;
}

const ServiceAttributes: ServiceAttributes = {
  get: (param: Service): ServiceBody => {
    const res: ServiceBody = {
      id: param.id,
      serviceType: param.serviceType,
      serviceNumber: param.serviceNumber,
      serviceTitle: param.serviceTitle,
      description: param.description || '-',
      termCondition: param.termCondition,
      serviceStatus: param.serviceStatus,
      contractAmount: param.originalAmount,
      contractDiscount: param.discountAmount,
      totalAmount: param.originalAmount - param.discountAmount,
      grandTotal: param.totalAmount,
      gstTax: param.gstTax,
      gstAmount: param.gstAmount,
      needGST: param.needGST,
      termStart: param.termStart,
      termEnd: param.termEnd,
      issueDate: param.issueDate,
      expiryDate: param.expiryDate,
      salesPerson: param.salesPerson || '-',
      skills: param.ServiceSkills ? param.ServiceSkills.map(val => val.skill) : [],
      serviceAddressId: param.ServiceAddress.id,
      serviceAddress: `${param.ServiceAddress.address}, ${param.ServiceAddress.country}`,
      postalCode: param.ServiceAddress.postalCode,
      billingAddress: `${param.Client.billingAddress}, ${param.ServiceAddress.country}`,
      billingPostalCode: param.Client.billingPostal,
      clientId: param.Client.id,
      clientName: param.Client.name,
      entityId: param.Entity.id,
      entityName: param.Entity.name,
      clientType: param.Client.clientType,
      clientAgent: param.Client.Agent ? param.Client.Agent.name : '-',
      clientRemarks: param.Client.remarks || '-',
      invoiceId: param.Invoice.length > 0 ? param.Invoice[0].id : null,
      invoiceNumber: param.Invoice.length > 0 ? param.Invoice[0].invoiceNumber : null,
      invoiceStatus: param.Invoice.length > 0 ? param.Invoice[0].invoiceStatus : '',
      Jobs: param.Jobs,
      CustomFields: param.CustomFields,
      ContactPersons: param.ContactPersons
    };

    return res;
  }
};

export default ServiceAttributes;
