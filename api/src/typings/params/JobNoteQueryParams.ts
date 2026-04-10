import { PaginationQueryParams } from './PaginationQueryParams';

export default interface JobNoteueryParams extends PaginationQueryParams {
  type?: string;
  equipmentIds?: number[];
  jobId?: number;
}
