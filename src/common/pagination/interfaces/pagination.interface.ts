export interface PaginationLinks {
  first: string;
  previous: string | null;
  current: string;
  next: string | null;
  last: string;
}

export interface PaginationMeta {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginationData<T> {
  items: T[];
  pagination: {
    links: PaginationLinks;
    meta: PaginationMeta;
  };
}

export interface PaginatedResponse<T> {
  status: string;
  data: PaginationData<T>;
}

export interface PaginationOptions {
  serviceName: string;
  totalItems: number;
  page?: number;
  limit?: number;
  customParams?: Record<string, string | number>;
}