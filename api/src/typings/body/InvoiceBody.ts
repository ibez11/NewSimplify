import { InvoiceStatus } from '../../database/models/Invoice';
import Service from '../../database/models/Service';
import ServiceItem from '../../database/models/ServiceItem';

export interface InvoiceBody {
  id: number;
  invoiceNumber?: string;
  termStart?: Date;
  termEnd?: Date;
  invoiceAmount?: number;
  collectedAmount?: number;
  chargeAmount?: number;
  paymentMethod?: string;
  invoiceStatus?: InvoiceStatus;
  isSynchronize?: boolean;
  remarks?: string;
  serviceId?: number;
  Service?: Service;
  createdBy?: string;
  clientId?: number;
  clientEmail?: string;
  billingAddress?: string;
  serviceAddress?: string;
  needGST?: boolean;
  gstTax?: number;
  gstAmount?: number;
  discountAmount?: number;
  ServiceIems?: ServiceItem[];
  salesPerson?: string;
  attnTo?: string;
}
