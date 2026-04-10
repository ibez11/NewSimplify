export interface ContactPersonsBody {
  id: number;
  clientId: number;
  contactPerson: string;
  contactNumber: string;
  contactEmail: string;
  countryCode: string;
  country: string;
  isMain: boolean;
  description?: string;
}
