import { ContactPersonsBody } from './ContactPersonsBody';
import { ServiceAddressBody } from './ServiceAddressBody';

export interface ClientBody {
  name: string;
  clientType: string;
  billingAddress: string;
  billingFloorNo: string;
  billingUnitNo: string;
  billingPostal: string;
  remarks?: string;
  emailReminder?: boolean;
  whatsAppReminder?: boolean;
  emailJobReport?: boolean;
  priceReportVisibility?: boolean;
  agentId?: number;
  agentName?: string;
  idQboWithGST?: number;
  idQboWithoutGST?: number;
  ContactPersons: ContactPersonsBody[];
  ServiceAddresses: ServiceAddressBody[];
  deletedServiceAddresses?: number[];
  isEditContactPerson?: boolean;
  isEditServiceAddress?: boolean;
}
