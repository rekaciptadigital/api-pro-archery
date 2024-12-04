import { Type } from '@nestjs/common';

export interface PaginationParams {
  page?: number;
  limit?: number;
  customParams?: Record<string, string | number>;
}

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

export interface PaginatedResponse<T> {
  status: 'success';
  data: T[];
  pagination: {
    links: PaginationLinks;
    meta: PaginationMeta;
  };
}

export interface PaginationOptions {
  serviceName: string;
  totalItems: number;
  page?: number;
  limit?: number;
  customParams?: Record<string, string | number>;
  route?: string;
}