import Logger from '../Logger';
import * as ClientDao from '../database/dao/ClientDao';
import * as ServiceAddressDao from '../database/dao/ServiceAddressDao';
import * as ContactPersonDao from '../database/dao/ContactPersonDao';
import Client from '../database/models/Client';
import ClientNotFoundError from '../errors/ClientNotFoundError';
import ServiceAddressNotFoundError from '../errors/ServiceAddressNotFoundError';
import { ClientBody } from '../typings/body/ClientBody';
import ClientQueryParams from '../typings/params/ClientQueryParams';
import * as AgentService from './AgentService';
import { AgentBody } from '../typings/body/AgentBody';
import * as JobDao from '../database/dao/JobDao';
import JobHaveOtherInProgressError from '../errors/JobHaveOtherInProgressError';
import * as InvoiceDao from '../database/dao/InvoiceDao';
import HaveUnpaidInvoicesError from '../errors/HaveUnpaidInvoicesError';
import { isEmpty } from 'validator';
import EmptyClientDataCreationError from '../errors/EmptyClientDataCreationError';
import ServiceAddress from '../database/models/ServiceAddress';

const LOG = new Logger('ClientService');

export const searchClientsWithPagination = async (
  offset: number,
  limit?: number,
  q?: string,
  agentId?: number[],
  orderBy?: string
): Promise<{ rows: Client[]; count: number }> => {
  const query: ClientQueryParams = {
    s: offset,
    l: limit,
    q: q,
    ai: agentId,
    ob: orderBy
  };
  const [count, rows] = await Promise.all([ClientDao.getCount(query), ClientDao.get(query)]);

  return { rows, count };
};

export const getCount = async (): Promise<{ count: number }> => {
  const query: ClientQueryParams = { s: 0 };
  const count = await ClientDao.getCount(query);

  return { count };
};

export const getAll = async (query?: ClientQueryParams): Promise<{ rows: ClientBody[]; count: number }> => {
  const { s, l, q, ai, orderBy } = query;

  return await searchClientsWithPagination(s, l, q, ai, orderBy);
};

export const getClientById = async (clientId: number): Promise<Client> => {
  LOG.debug('Getting Client from clientId');

  const client = await ClientDao.getById(clientId);

  if (!client) {
    throw new ClientNotFoundError(clientId);
  }

  client.ContactPersons = client.ContactPersons.sort((a, b) => {
    const isMainA: boolean = a.isMain;
    const isMainB: boolean = b.isMain;
    return isMainB ? 1 : isMainA ? -1 : 0;
  });

  return client;
};

/**
 * Check if a client exists
 *
 * @param clientName of the required client
 *
 * @returns boolean
 */
export const isClientExistsByClientName = async (query?: ClientQueryParams): Promise<boolean> => {
  const { name, id } = query;
  return (await ClientDao.countByClientName(name, Number(id))) > 0;
};

export const createClient = async (req: ClientBody): Promise<Client> => {
  LOG.debug('Creating Client');

  try {
    const { ServiceAddresses, ContactPersons, name } = req;

    if (isEmpty(name)) {
      throw new EmptyClientDataCreationError();
    }

    if (req.agentId === 0 && req.agentName) {
      const existingAgentName = await AgentService.isAgentExistsByAgentName(req.agentName);

      if (!existingAgentName) {
        const agent: AgentBody = {
          name: req.agentName
        };
        const newAgent = await AgentService.createAgent(agent);
        req.agentId = newAgent.id;
      }
    }

    const client = await ClientDao.createClient(req);

    ServiceAddresses.map(value => {
      value.clientId = client.id;
      value.countryCode = value.countryCode || '+65';
      value.country = value.country || 'Singapore';
    });

    ContactPersons.map(value => {
      value.clientId = client.id;
      value.countryCode = value.countryCode || '+65';
    });

    await ServiceAddressDao.bulkCreateServiceAddress(ServiceAddresses);
    await ContactPersonDao.bulkCreateContactPerson(ContactPersons);

    return ClientDao.getById(client.id);
  } catch (err) {
    throw err;
  }
};

/**
 * To Edit client in the system, based on user input
 *
 * @param name of the new client
 * @param clientType of the client
 * @param contactPerson of the client
 * @param contactNumber of the client
 * @param contactEmail of the client
 * @param secondaryContactPerson of the client
 * @param secondaryContactNumber of the client
 * @param secondaryContactEmail of the client
 * @param country of the client
 * @param billingAddress of the client
 * @param billingFloorNo of the client
 * @param billingUnitNo of the client
 * @param billingPostal of the client
 * @param paymentStatus of the client
 * @param remarks of the client
 * @param agentId of the client
 *
 * @returns void
 */

export const editClient = async (id: number, req: ClientBody): Promise<Client> => {
  LOG.debug('Editing Client');

  const client = await ClientDao.getById(id);

  if (!client) {
    throw new ClientNotFoundError(id);
  }

  try {
    const {
      name,
      clientType,
      billingAddress,
      billingFloorNo,
      billingUnitNo,
      billingPostal,
      agentName,
      remarks,
      idQboWithGST,
      idQboWithoutGST,
      emailReminder,
      emailJobReport,
      whatsAppReminder,
      ContactPersons,
      ServiceAddresses,
      deletedServiceAddresses,
      priceReportVisibility
    } = req;

    if (req.agentId === 0 && agentName) {
      const existingAgentName = await AgentService.isAgentExistsByAgentName(agentName);

      if (!existingAgentName) {
        const agent: AgentBody = { name: agentName };
        const newAgent = await AgentService.createAgent(agent);
        req.agentId = newAgent.id;
      }
    }

    await client.update({
      name,
      clientType,
      billingAddress,
      billingFloorNo,
      billingUnitNo,
      billingPostal,
      remarks,
      agentId: req.agentId === 0 ? null : req.agentId,
      idQboWithGST,
      idQboWithoutGST,
      emailReminder,
      emailJobReport,
      whatsAppReminder,
      priceReportVisibility
    });

    if (req.isEditContactPerson) {
      // Update or create contact persons
      const contactPersonPromises = ContactPersons.map(async value => {
        value.clientId = client.id;
        value.countryCode = value.countryCode || '+65';

        if (value.id > 0) {
          const contactPerson = await ContactPersonDao.getById(value.id);
          await contactPerson.update(value);
        } else if (value.id === 0) {
          await ContactPersonDao.createContactPerson(
            client.id,
            value.contactPerson,
            value.countryCode,
            value.contactNumber,
            value.contactEmail,
            value.isMain,
            value.country
          );
        }
      });
      await Promise.all(contactPersonPromises);

      // Delete contact persons
      if (req.DeletedContactPersons) {
        const deletePromises = req.DeletedContactPersons.map(val => ContactPersonDao.deleteContactPersonById(val.id));
        await Promise.all(deletePromises);
      }
    }

    if (req.isEditServiceAddress) {
      // Update or create service addresses
      const serviceAddressPromises = ServiceAddresses.map(async value => {
        if (value.id === 0) {
          await ServiceAddressDao.createServiceAddress(value);
        } else {
          const address = await ServiceAddressDao.getById(value.id);
          await address.update(value);
        }
      });
      await Promise.all(serviceAddressPromises);

      // Delete service addresses
      if (deletedServiceAddresses) {
        await ServiceAddressDao.bulkdeleteServiceAddressById(deletedServiceAddresses);
      }
    }

    return await getClientById(id);
  } catch (err) {
    throw err;
  }
};

export const getDataServiceByClient = async (
  clientId: number
): Promise<{ activeContract: number; expiringContract: number; expiredContract: number; totalAmount: number }> => {
  const activeContract = await ClientDao.countActiveServiceByClient(clientId);
  const expiringContract = await ClientDao.countExpiringServiceByClient(clientId);
  const expiredContract = await ClientDao.countExpiredServiceByClient(clientId);
  const clientServices = await ClientDao.sumServiceAmountByClient(clientId);
  const totalAmount = clientServices[0] ? clientServices[0].totalAmount : 0;

  return { activeContract, expiringContract, expiredContract, totalAmount };
};

export const getFirstServiceAddressByClient = async (clientId: number): Promise<ServiceAddress> => {
  const { rows } = await ServiceAddressDao.getByClientId(clientId);

  if (!rows.length) {
    throw new ServiceAddressNotFoundError(clientId);
  }

  return rows[0] ? rows[0] : null;
};

export const updateClientRemarks = async (clientId: number, remarks: string): Promise<Client> => {
  LOG.debug('Editing Client Remarks');

  const client = await ClientDao.getById(clientId);

  if (!client) {
    throw new ClientNotFoundError(clientId);
  }

  try {
    return await client.update({
      remarks
    });
  } catch (err) {
    throw err;
  }
};

export const getClientByName = async (name: string): Promise<Client> => {
  LOG.debug('Getting Client from name');

  const client = await ClientDao.getClientByName(name);

  return client;
};

export const getClientByContactPersonNumber = async (contactNumber: string): Promise<Client> => {
  LOG.debug('Getting Client from contact person number');

  const client = await ClientDao.getClientByContactPersonNumber(contactNumber);

  return client;
};

export const deleteClient = async (clientId: number): Promise<Client> => {
  LOG.debug('Deleting Client');

  try {
    const hasJobsInprogress = await JobDao.hasJobsInProgressByClientId(clientId);
    if (hasJobsInprogress) {
      throw new JobHaveOtherInProgressError();
    }

    const hasUnpaidInvoices = await InvoiceDao.hasUnpaidInvoicesByClientId(clientId);
    if (hasUnpaidInvoices) {
      throw new HaveUnpaidInvoicesError();
    }

    const client = await ClientDao.getById(clientId);
    await ClientDao.deleteClient(clientId);
    return client;
  } catch (err) {
    throw err;
  }
};
