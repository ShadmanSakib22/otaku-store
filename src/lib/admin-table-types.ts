export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface DataTableFilter {
  id: string;
  label: string;
  options: { label: string; value: string }[];
}

export interface DataTableConfig<TData> {
  columns: any[];
  data: TData[];
  pagination: PaginationState;
  filters?: DataTableFilter[];
  activeFilters?: Record<string, string>;
  searchKey?: string;
  searchPlaceholder?: string;
  basePath: string;
  enableBulkActions?: boolean;
}
