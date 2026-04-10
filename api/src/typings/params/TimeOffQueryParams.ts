import { PaginationQueryParams } from './PaginationQueryParams';

export default interface TimeOffQueryParams extends PaginationQueryParams {
  id?: number;
  ui?: number;
  orderBy?: string;
  sd?: string;
  ed?: string;
}
