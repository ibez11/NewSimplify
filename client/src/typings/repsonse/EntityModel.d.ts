interface EntityModel {
  id: number;
  name: string;
  address: string;
  logo: string;
  countryCode: string;
  contactNumber: string;
  needGST: boolean;
  email: string;
  qrImage?: string;
  registerNumberGST?: string;
  invoiceFooter?: string;
  uenNumber?: string;
}
