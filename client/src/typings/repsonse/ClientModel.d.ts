interface ClientModel {
  id: number;
  name: string;
  clientType: string;
  description?: string;
  activeContract: string;
  totalAmount: string;
  agentName: string;
  new?: boolean;
  ContactPersons: ContactPersonModel[];
  ServiceAddresses: ServiceAddressModel[];
  remarks?: string;
}
