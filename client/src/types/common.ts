export type Pagination = {
  totalRecords: number;
  currentPage: number;
  pageSize: number;
};

export type PaginatedResponse<TItem> = Pagination & {
  data: TItem[];
};

export type ErrorResponse = {
  message: string;
};
