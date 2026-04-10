/* eslint-disable @typescript-eslint/no-explicit-any */
import { ServiceBody } from '../typings/body/ServiceBody';
import { ServiceTypes } from '../database/models/Service';
import addDays from 'date-fns/addDays';

export const dummyService: ServiceBody = {
  id: 0,
  serviceType: ServiceTypes.ADHOC,
  serviceNumber: '',
  serviceTitle: '',
  description: '',
  serviceStatus: 'CONFIRMED',
  issueDate: new Date(),
  expiryDate: addDays(new Date(), 30),
  needGST: false,
  termStart: new Date(),
  termEnd: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
  contractAmount: 0,
  contractDiscount: 0,
  totalAmount: 0,
  gstAmount: 0,
  grandTotal: 0,
  gstTax: 0,
  salesPerson: '',
  skills: [],
  serviceAddress: '',
  postalCode: '',
  billingAddress: '',
  billingPostalCode: '',
  clientName: '',
  entityName: '',
  clientType: '',
  Jobs: [],
  remarks: '',
  termCondition: '',
  clientId: 0,
  serviceAddressId: 0,
  entityId: 0,
  totalJob: 0,
  Schedules: [],
  selectedEmployees: []
};
