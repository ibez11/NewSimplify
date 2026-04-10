// import { DiscountTypes } from '../../database/models/Service';
// import Job from '../../database/models/Job';
// import ServiceItem from '../../database/models/ServiceItem';
// import Schedule from '../../database/models/Schedule';
// import ChecklistJob from '../../database/models/ChecklistJob';
// import JobLabel from '../../database/models/JobLabel';

import { ClientBody } from './ClientBody';

export interface ServiceBody {
  id: number;
  serviceType: string;
  serviceNumber: string;
  serviceTitle: string;
  description: string;
  serviceStatus: string;
  issueDate: Date;
  expiryDate: Date;
  needGST: boolean;
  termStart: Date;
  termEnd: Date;
  contractAmount: number;
  discountType: DiscountTypes;
  discountAmount: number;
  gstTax: number;
  gstAmount: number;
  totalAmount: number;
  remarks: string;
  termCondition: string;
  clientId: number;
  ClientBody?: ClientBody;
  serviceAddressId: number;
  serviceAddress: string;
  entityId: number;
  entityName: string;
  isJobCompleted: boolean;
  totalJob: number;
  isRenewed: boolean;
  renewalServiceId: number;
  salesPerson: string;
  skills?: SkillsModel[];
  JobLabels?: JobLabelModel[];
  Checklists?: JobChecklistModel[];
  Schedules: ScheduleModel[];
  isNextDay?: boolean;
  holidaysDate?: any[];
  CustomFields?: any[];
  ContactPersons?: any[];
}
