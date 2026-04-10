/* eslint-disable @typescript-eslint/no-explicit-any */
import Equipment from '../../database/models/Equipment';
import { EquipmentResponseModel } from '../ResponseFormats';
import * as EquipmentDao from '../../database/dao/EquipmentDao';

interface EquipmentAttributes {
  getEquipmentByServiceAddressIdWeb: (param: EquipmentResponseModel[]) => Promise<EquipmentResponseModel[]>;
  getEquipmentByServiceAddressIdMobile: (param: EquipmentResponseModel[], isActive?: any) => Promise<EquipmentResponseModel[]>;
  getCountEquipmentByServiceAddressIdMobile: (param: EquipmentResponseModel[]) => Promise<{ count: number }>;
}

const EquipmentAttributes: EquipmentAttributes = {
  getEquipmentByServiceAddressIdWeb: async (param: Equipment[]): Promise<EquipmentResponseModel[]> => {
    const result: EquipmentResponseModel[] = [];
    if (param) {
      let index = 0;
      for (const val of param) {
        val.setDataValue('index', index);
        if (val.isActive) {
          result.push(val);
        }

        const detailEquipment = await EquipmentDao.getEquipmentByMainId(val.id, true);
        if (detailEquipment && detailEquipment.length > 0) {
          for (const sub of detailEquipment) {
            sub.setDataValue('index', index);
            result.push(sub);
          }
        }
        index++;
      }
    }
    return result;
  },
  getEquipmentByServiceAddressIdMobile: async (param: Equipment[], isActive?: boolean): Promise<EquipmentResponseModel[]> => {
    if (param) {
      let index = 1;
      for (const val of param) {
        val.setDataValue('index', index);
        const result: Equipment[] = [];
        const detailEquipment = await EquipmentDao.getEquipmentByMainId(val.id, isActive);
        if (detailEquipment && detailEquipment.length > 0) {
          for (const sub of detailEquipment) {
            result.push(sub);
          }
        }
        val.setDataValue('SubEquipments', result);
        index++;
      }
    }
    return param;
  },
  getCountEquipmentByServiceAddressIdMobile: async (param: Equipment[]): Promise<{ count: number }> => {
    const result: EquipmentResponseModel[] = [];
    if (param) {
      let index = 0;
      for (const val of param) {
        result.push(val);

        const detailEquipment = await EquipmentDao.getEquipmentByMainId(val.id);
        if (detailEquipment && detailEquipment.length > 0) {
          for (const sub of detailEquipment) {
            result.push(sub);
          }
        }
        index++;
      }
    }
    return { count: result.length };
  }
};

export default EquipmentAttributes;
