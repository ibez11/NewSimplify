import Logger from '../Logger';
import ServiceItem from '../database/models/ServiceItem';
import * as ServiceItemDao from '../database/dao/ServiceItemDao';
import * as ServiceDao from '../database/dao/ServiceDao';
import * as ServiceItemJobDao from '../database/dao/ServiceItemJobDao';
import * as JobDao from '../database/dao/JobDao';
import * as ServiceItemTemplateDao from '../database/dao/ServiceItemTemplateDao';
import * as ServiceItemEquipmentDao from '../database/dao/ServiceItemEquipmentDao';
import * as EquipmentService from '../services/EquipmentService';
import ServiceItemNotFoundError from '../errors/ServiceItemNotFoundError';
import ServiceItemNotEditableError from '../errors/ServiceItemNotEditableError';
import { EquipmentResponseModel, ServiceItemResponseModel } from '../typings/ResponseFormats';
import JobNotFoundError from '../errors/JobNotFoundError';

const LOG = new Logger('ServiceItemService.ts');

export const getServiceItemByJobId = async (jobId: number): Promise<ServiceItemResponseModel[]> => {
  LOG.debug('Get service item by jobId');

  try {
    const serviceItems = await ServiceItemDao.getServiceItemByJobId(jobId);

    await Promise.all(
      serviceItems.map(async item => {
        //get equipments by service item id
        const equipments = await EquipmentService.getEquipmentByServiceItemId(item.id);
        item.Equipments = equipments;
      })
    );

    return serviceItems;
  } catch (err) {
    throw err;
  }
};

export const getServiceItemByServiceId = (serviceId: number): Promise<ServiceItemResponseModel[]> => {
  LOG.debug('Get service item by serviceId');

  try {
    return ServiceItemDao.getServiceItemByServiceId(serviceId);
  } catch (err) {
    throw err;
  }
};

export const editServiceItem = async (
  serviceItemId: number,
  name: string,
  description?: string,
  quantity?: number,
  unitPrice?: number,
  discountAmount?: number,
  Equipments?: EquipmentResponseModel[]
): Promise<ServiceItem> => {
  LOG.debug('Edit service item by serviceItemId');

  try {
    const serviceItem = await ServiceItemDao.getServiceItemById(serviceItemId);

    if (!serviceItem) {
      throw new ServiceItemNotFoundError(serviceItemId);
    }

    const serviceItemDetail = await ServiceItemDao.getDetailServiceItemById(serviceItemId);

    if (serviceItemDetail[0].serviceType !== 'ADHOC' || serviceItemDetail[0].invoiceNumber) {
      throw new ServiceItemNotEditableError(serviceItemId);
    }

    const discountAmt = discountAmount ? discountAmount : 0;
    const totalPriceItem = Number((quantity * unitPrice - discountAmt).toFixed(2));
    await serviceItem.update({
      name,
      description,
      quantity,
      unitPrice,
      discountAmt,
      totalPrice: totalPriceItem
    });

    if (quantity || unitPrice) {
      const serviceId = serviceItemDetail[0].serviceId;
      const currentService = await ServiceDao.getServiceById(serviceId);
      const allServiceItems = serviceItemDetail[0].ServiceItems;
      let originalAmount = 0;
      allServiceItems.map(value => {
        originalAmount += value.id === serviceItemId ? totalPriceItem : Number(value.totalPrice);
      });

      const serviceDiscountAmount = currentService.getDataValue('discountAmount');
      const needGST = currentService.getDataValue('needGST');
      const gst = (currentService.gstTax || 0) / 100;
      const currentDiscount = serviceDiscountAmount > originalAmount ? originalAmount : serviceDiscountAmount;
      const newAmount = Number((originalAmount - currentDiscount).toFixed(2));
      const gstAmount = needGST ? newAmount * gst : 0;
      const totalAmount = Number((newAmount + gstAmount).toFixed(2));
      await currentService.update({ originalAmount, gstAmount, totalAmount });
    }

    if (Equipments && Equipments.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const serviceItemEquipment: any[] = [];
      await ServiceItemEquipmentDao.deleteDataByServiceItemId(serviceItemId);
      await Promise.all(
        Equipments.map(value => {
          return serviceItemEquipment.push({ serviceItemId, equipmentId: value.id });
        })
      );
      await ServiceItemEquipmentDao.create(serviceItemEquipment);
    } else {
      await ServiceItemEquipmentDao.deleteDataByServiceItemId(serviceItemId);
    }

    return ServiceItemDao.getServiceItemById(serviceItemId);
  } catch (err) {
    throw err;
  }
};

/**
 * To delete Service Item (hard delete)
 *
 * @param serviceItemId of the Skill Template to be deleted
 *
 * @returns void
 */
export const deleteServiceItem = async (id: number): Promise<void> => {
  await ServiceItemDao.deleteServiceItemById(id);
};

export const addJobServiceItems = async (id: number, serviceItem: ServiceItem): Promise<ServiceItemResponseModel[]> => {
  LOG.debug('Adding Job Service Items');

  const { row } = await JobDao.getJobDetailById(id);

  if (!row) {
    throw new JobNotFoundError(id);
  }

  const jobDetail = row;
  try {
    const scheduleId = jobDetail.ServiceItem[0].scheduleId;
    const serviceId = jobDetail.serviceId;

    const serviceItemMaster = await ServiceItemTemplateDao.getPaginated(0, 5, serviceItem.name);
    if (serviceItemMaster.count > 0) {
      serviceItem.idQboWithGST = Number(serviceItemMaster.rows[0].getDataValue('idQboWithGST'));
      serviceItem.IdQboWithoutGST = Number(serviceItemMaster.rows[0].getDataValue('IdQboWithoutGST'));
    }

    serviceItem.serviceId = serviceId;
    serviceItem.scheduleId = scheduleId;
    serviceItem.totalPrice = Number(serviceItem.totalPrice.toFixed(2));
    delete serviceItem.id;

    const createdItem = await ServiceItemDao.createServiceItemWithoutTransaction(serviceItem);
    await ServiceItemJobDao.createWithoutTransaction([{ jobId: id, serviceItemId: createdItem.id }]);

    //saving service item with equipment
    if (serviceItem.Equipments && serviceItem.Equipments.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const serviceItemEquipment: any[] = [];
      Promise.all(
        serviceItem.Equipments.map(value => {
          return serviceItemEquipment.push({ serviceItemId: createdItem.id, equipmentId: value.id });
        })
      );

      await ServiceItemEquipmentDao.create(serviceItemEquipment);
    }

    const service = await ServiceDao.getServiceById(jobDetail.serviceId);
    const newServiceItems = await ServiceItemDao.getServiceItemByServiceId(row.serviceId);

    const needGST = service.needGST;
    let originalAmount = 0;
    const discountAmount = service.discountAmount;
    const gst = (service.gstTax || 0) / 100;
    let gstAmount = 0;
    let totalAmount = 0;

    if (newServiceItems && newServiceItems.length > 0) {
      Promise.all(
        newServiceItems.map(value => {
          return (originalAmount = Number((originalAmount + Number(value.totalPrice)).toFixed(2)));
        })
      );
    }

    totalAmount = Number((originalAmount - discountAmount).toFixed(2));
    if (needGST) {
      gstAmount = Number((totalAmount * gst).toFixed(2));
    }
    totalAmount = Number((totalAmount + gstAmount).toFixed(2));

    service.update({
      originalAmount,
      discountAmount,
      gstAmount,
      totalAmount
    });

    return await getServiceItemByJobId(id);
  } catch (err) {
    throw err;
  }
};
