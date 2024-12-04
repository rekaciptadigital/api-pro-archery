export interface ApiStatus {
  code: number;
  message: string;
}

export interface PaginationMetadata {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ApiResponse<T> {
  status: ApiStatus;
  data: {
    items: T[];
    pagination?: PaginationMetadata;
  };
}

export interface ApiErrorResponse {
  status: ApiStatus;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}