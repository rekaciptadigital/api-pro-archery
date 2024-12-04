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
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ApiResponse<T> {
  status: ApiStatus;
  data: T[];
  pagination?: ApiPagination;
}

export interface ApiErrorResponse {
  status: ApiStatus;
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}