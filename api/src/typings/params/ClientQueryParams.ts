import { PaginationQueryParams } from './PaginationQueryParams';

export default interface ClientQueryParams extends PaginationQueryParams {
  ai?: number[]; //agent id
  orderBy?: string;
  name?: string;
  id?: string;
}
