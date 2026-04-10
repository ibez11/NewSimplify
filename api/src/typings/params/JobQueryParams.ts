import { PaginationQueryParams } from './PaginationQueryParams';

export interface JobQueryParams extends PaginationQueryParams {
  j?: string; // filter for job flag (all, assigned, unassigned)
  fb?: string; // filterby
  sd?: string; // start date value
  ed?: string; // end date value
  vi?: number; // vehicle id
  ei?: number; // employe id
  ci?: number; // client id value
  st?: string; // service type value
  fj?: number; // first job value
  ht?: string; // have technician value
  hv?: string; // have vehicle value
  si?: number; // have service item value
  pd?: string[]; // postal district
  hs?: number; // have signature
  iu?: boolean; // unassign job only
  selectedTab?: string; // selected schedule tab
  isSync?: boolean; // sync job only
  haveSync?: boolean; // syncId not null
  withDetails?: boolean; // get job details
  excludeJobId?: number; // excluded job ids
}
