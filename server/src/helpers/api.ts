export type PaginatedResponse<TItem> = {
  data: TItem[];
  totalRecords: number;
  currentPage: number;
  pageSize: number;
};
