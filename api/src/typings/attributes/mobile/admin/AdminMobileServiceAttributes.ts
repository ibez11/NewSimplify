/* eslint-disable @typescript-eslint/no-explicit-any */
import Service from '../../../../database/models/Service';
import { ServiceResponseModel } from '../../../ResponseFormats';
import { ServiceBody } from '../../../body/ServiceBody';
import { getJobSequence } from '../../../../database/dao/JobDao';
import { getServiceItemByJobId } from '../../../../database/dao/ServiceItemDao';
import { getEquipmentByServiceItemId } from '../../../../database/dao/EquipmentDao';
import { format } from 'date-fns';

interface AdminMobileServiceAttributes {
  getAll: (param: ServiceResponseModel[]) => Promise<ServiceBody[]>;
  get: (param: Service) => Promise<ServiceBody>;
}

const AdminMobileServiceAttributes: AdminMobileServiceAttributes = {
  getAll: async (param: ServiceResponseModel[]): Promise<ServiceBody[]> => {
    const results: any[] = [];
    if (param) {
      await Promise.all(
        param.map(async val => {
          results.push({
            id: val.id,
            serviceType: val.contractType,
            completedJob: Number(val.completed),
            totalJob: val.totalJob,
            serviceTitle: val.contractTitle,
            serviceAddress: val.serviceAddress.toString(),
            JobLabels: val.JobLabels,
            clientName: val.clientName.toString(),
            serviceStatus: val.contractStatus.toUpperCase()
          });
        })
      );
    }
    return results.sort((a: any, b: any) => b.id - a.id);
  },
  get: async (param: Service): Promise<ServiceBody> => {
    const Jobs: any[] = [];
    await Promise.all(
      param.Jobs?.map(async val => {
        const items = await getServiceItemByJobId(val.id);
        items.map(async item => {
          item.Equipments = await getEquipmentByServiceItemId(item.id);
        });
        const jobAmount = items.reduce((acc, val) => acc + Number(val.totalPrice), 0);
        const { jobSequence } = await getJobSequence(val.id, param.id);
        Jobs.push({
          id: val.id,
          startDateTime: format(new Date(val.startDateTime), 'yyyy-MM-dd HH:mm:ss'),
          endDateTime: format(new Date(val.endDateTime), 'yyyy-MM-dd HH:mm:ss'),
          jobStatus: val.jobStatus,
          ServiceItems: items,
          jobAmount: jobAmount,
          occurance: Number(jobSequence)
        });
      })
    );

    const res: ServiceBody = {
      id: param.id,
      serviceType: param.serviceType,
      serviceNumber: param.serviceNumber,
      serviceTitle: param.serviceTitle,
      description: param.description || '-',
      termCondition: param.termCondition,
      serviceStatus: param.serviceStatus.toUpperCase(),
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
      Jobs: Jobs ? Jobs.sort((a: any, b: any) => a.occurance - b.occurance) : [],
      CustomFields: param.CustomFields,
      ContactPersons: param.ContactPersons,
      Schedule: param.Schedules[0]
    };

    return res;
  }
};

export default AdminMobileServiceAttributes;
