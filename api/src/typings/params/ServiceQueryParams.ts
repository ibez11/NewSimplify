import { PaginationQueryParams } from './PaginationQueryParams';

export interface ServiceQueryParams extends PaginationQueryParams {
  c?: string; // filter for contract flag (all, active, expiring, expired)
  fb?: string; // filter by for term (termStart, termEnd)
  sd?: string; // start date value
  ed?: string; // end date value
  ci?: number; // client id value
  ei?: number; // entity id date value
  ct?: string; // contract type value
  sai?: number; // service address value
  fi?: number; // filter by have invoice
  na?: boolean; // not additional,
  cs?: string; //contract status
  rnw?: boolean; //contract renew status
}
