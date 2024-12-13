export interface ApiStatus {
  code: number;
  message: string;
}

export interface PaginationLinks {
  first: string;
  previous: string | null;
  current: string;
  next: string | null;
  last: string;
}

export interface ApiPagination {
  links: PaginationLinks;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface BaseApiResponse {
  status: ApiStatus;
  info?: string;
  error?: string[];
}

export interface SingleApiResponse<T> extends BaseApiResponse {
  data?: T;
}

export interface ArrayApiResponse<T> extends BaseApiResponse {
  data?: T[];
}

export interface PaginatedApiResponse<T> extends ArrayApiResponse<T> {
  pagination?: ApiPagination;
}

export type ApiResponse<T> = SingleApiResponse<T> | ArrayApiResponse<T> | PaginatedApiResponse<T>;