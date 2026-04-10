interface ClientDetailsModel {
  id: number;
  name: string;
  clientType: string;
  billingAddress: string;
  billingFloorNo?: string;
  billingUnitNo?: string;
  billingPostal: string;
  needGST: boolean;
  remarks: string;
  emailReminder?: boolean;
  whatsAppReminder?: boolean;
  emailJobReport?: boolean;
  priceReportVisibility?: boolean;
  description?: string;
  agentId?: number;
  Agent?: AgentsModel;
  agentName?: string;
  ServiceAddresses: ServiceAddressModel[];
  ContactPersons: ContactPersonModel[];
  ClientDocuments?: ClientDocumentModel[];
}
