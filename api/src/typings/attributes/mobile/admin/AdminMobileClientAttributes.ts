/* eslint-disable @typescript-eslint/no-explicit-any */
import Client from '../../../../database/models/Client';
import { ClientBody } from '../../../body/ClientBody';
import _ from 'lodash';
import * as ClientService from '../../../../services/ClientService';

interface AdminMobileClientAttributes {
  get: (param: Client) => ClientBody;
  getAll: (param: ClientBody[]) => Promise<ClientBody[]>;
}

const AdminMobileClientAttributes: AdminMobileClientAttributes = {
  get: (param: Client): ClientBody => {
    const res: ClientBody = {
      id: param.id,
      name: param.name,
      clientType: param.clientType,
      remarks: param.remarks,
      ServiceAddresses: param.ServiceAddresses,
      ContactPersons: param.ContactPersons,
      billingAddress: param.billingAddress,
      billingFloorNo: param.billingFloorNo,
      billingUnitNo: param.billingUnitNo,
      billingPostal: param.billingPostal
    };

    return res;
  },

  getAll: async (param: ClientBody[]): Promise<ClientBody[]> => {
    const results: any[] = [];
    if (param) {
      await Promise.all(
        param.map(async val => {
          const firstServiceAddress = await ClientService.getFirstServiceAddressByClient(val.id);
          results.push({
            id: val.id,
            name: val.name,
            serviceAddressId: firstServiceAddress.id,
            address: firstServiceAddress.address,
            ContactPersons: val.ContactPersons,
            ServiceAddresses: val.ServiceAddresses,
            createdAt: val.createdAt
          });
        })
      );
    }

    return results.sort((a: any, b: any) => b.id - a.id);
  }
};

export default AdminMobileClientAttributes;
