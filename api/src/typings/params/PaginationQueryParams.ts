export interface PaginationQueryParams {
  s?: number; // is offset for pagination search
  l?: number; // limit for pagination search
  ob?: string; // orderBy selected fields to order
  ot?: string; // orderBy type ASC || DESC
  q?: string; // query for searching
  cd?: string; // query for get by code
}
