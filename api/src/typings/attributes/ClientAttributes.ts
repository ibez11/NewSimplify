/* eslint-disable @typescript-eslint/no-explicit-any */
import Client from '../../database/models/Client';
import { ContactPersonResponseModel } from '../ResponseFormats';
import { ClientBody, SyncClientBody } from '../body/ClientBody';
import * as ServiceContactDao from '../../database/dao/ServiceContactDao';
import _ from 'lodash';
import * as ClientService from '../../services/ClientService';
import * as ServiceAddressService from '../../services/ServiceAddressService';
import * as ContactPersonDao from '../../database/dao/ContactPersonDao';

interface ClientAttributes {
  listFields: string[];
  get: (param: Client) => ClientBody;
  getEmail: (param: Client, serviceId?: number) => Promise<ClientBody>;
  getAll: (param: ClientBody[]) => Promise<ClientBody[]>;
  syncClient: (param: ClientBody) => Promise<ClientBody>;
}

const ClientAttributes: ClientAttributes = {
  listFields: [
    'id',
    'name',
    'clientType',
    'contactPerson',
    'countryCode',
    'contactNumber',
    'firstServiceAddress',
    'activeContract',
    'totalAmount',
    'agentName',
    'ServiceAddresses',
    'ContactPersons',
    'remarks'
  ],

  getAll: async (param: ClientBody[]): Promise<ClientBody[]> => {
    const results: any = [];
    await Promise.all(
      param.map(async row => {
        const { activeContract, totalAmount } = await ClientService.getDataServiceByClient(row.id);
        const firstServiceAddress = await ClientService.getFirstServiceAddressByClient(row.id);
        const { rows } = await ServiceAddressService.getServiceAddressesByClientId(row.id);
        const { rows: contacts } = await ContactPersonDao.getByClientId(row.id);

        const pickedFields: any = _.pick(row, ClientAttributes.listFields);
        pickedFields.firstServiceAddress = firstServiceAddress.address;
        pickedFields.activeContract = activeContract;
        pickedFields.totalAmount = totalAmount;
        pickedFields.agentName = row.agentName;
        pickedFields.ServiceAddresses = rows;

        contacts.sort((a, b) => {
          if (a.isMain && !b.isMain) {
            return -1;
          } else if (!a.isMain && b.isMain) {
            return 1;
          } else {
            return 0;
          }
        });
        pickedFields.ContactPersons = contacts;

        results.push(pickedFields);
      })
    );

    return results.sort((a: any, b: any) => b.id - a.id);
  },

  get: (param: Client): ClientBody => {
    const res: ClientBody = {
      id: param.id,
      name: param.name,
      clientType: param.clientType,
      firstServiceAddress: param.firstServiceAddress,
      activeContract: param.activeContract,
      totalAmount: param.totalAmount,
      agentName: param.Agent ? param.Agent.name : '',
      ServiceAddresses: param.ServiceAddresses
    };

    return res;
  },

  getEmail: async (param: Client, serviceId?: number): Promise<ClientBody> => {
    const contacts: ContactPersonResponseModel[] = [];
    const serviceContact = await ServiceContactDao.getByserviceId(serviceId);
    const contactPersons = param.ContactPersons;
    if (contactPersons) {
      contactPersons.map(val => {
        const matchingServiceContact = serviceContact.find(contact => contact.contactPersonId === val.id);
        contacts.push({
          id: val.id,
          contactPerson: val.contactPerson,
          contactNumber: val.countryCode + val.contactNumber,
          contactEmail: val.contactEmail,
          description: val.description,
          isDefault: !!matchingServiceContact
        });
      });
    }

    return {
      ContactPersons: contacts
    };
  },

  syncClient: async (param: ClientBody): Promise<SyncClientBody> => {
    const firstName = param.name;
    const contactPerson = param.ContactPersons[0];
    return {
      id: param.id,
      firstName: firstName || '-',
      lastName: '-',
      contactNumber: contactPerson.countryCode + contactPerson.contactNumber,
      contactEmail: contactPerson.contactEmail,
      remarks: param.remarks
    };
  }
};

export default ClientAttributes;
