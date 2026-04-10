import { PaginationQueryParams } from './PaginationQueryParams';

export interface EquipmentQueryParam extends PaginationQueryParams {
  fb?: string; // filterby
  sd?: string; // start date value
  ed?: string; // end date value
  ci: number; // client id
  sai?: number; // service address id
  brands?: string[];
}
