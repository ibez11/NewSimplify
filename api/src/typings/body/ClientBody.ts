/* eslint-disable @typescript-eslint/no-explicit-any */
import { ContactPersonResponseModel } from '../ResponseFormats';
import { ServiceAddressBody } from './ServiceAddressBody';

export interface ClientBody {
  id?: number;
  name?: string;
  clientType?: string;
  billingAddress?: string;
  billingFloorNo?: string;
  billingUnitNo?: string;
  billingPostal?: string;
  needGST?: boolean;
  remarks?: string;
  emailReminder?: boolean;
  whatsAppReminder?: boolean;
  emailJobReport?: boolean;
  agentId?: number;
  idQboWithGST?: number;
  idQboWithoutGST?: number;
  ServiceAddresses?: ServiceAddressBody[];
  deletedServiceAddresses?: number[];
  isEditContactPerson?: boolean;
  isEditServiceAddress?: boolean;
  firstServiceAddress?: string;
  activeContract?: number;
  totalAmount?: number;
  agentName?: string;
  isDefault?: boolean;
  ContactPersons?: ContactPersonResponseModel[];
  DeletedContactPersons?: ContactPersonResponseModel[];
  service?: any;
  address?: string;
  createdAt?: Date;
  serviceAddressId?: number;
  priceReportVisibility?: boolean;
}

export interface SyncClientBody {
  id: number;
  firstName: string;
  lastName: string;
  contactNumber: string;
  contactEmail: string;
  remarks: string;
}
