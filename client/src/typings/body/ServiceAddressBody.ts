export interface ServiceAddressBody {
  id: number;
  contactPerson: string;
  countryCode: string;
  contactNumber: string;
  secondaryContactPerson: string;
  secondaryContactNumber: string;
  country: string;
  address: string;
  floorNo: string;
  unitNo: string;
  postalCode: string;
  clientId?: number;
}
