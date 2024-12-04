import { Injectable } from '@nestjs/common';
import { PaginatedResponse } from '../pagination/interfaces/pagination.interface';

@Injectable()
export class ResponseTransformer {
  transform<T>(data: T) {
    return {
      status: {
        code: 200,
        message: 'Success'
      },
      data
    };
  }

  transformError(code: number, message: string, details?: Record<string, any>) {
    return {
      status: {
        code,
        message
      },
      error: {
        code: `ERR_${code}`,
        message,
        details
      }
    };
  }

  transformPaginated<T>(data: T[], totalItems: number, page: number, limit: number, links: any): PaginatedResponse<T> {
    const totalPages = Math.ceil(totalItems / limit);
    
    return {
      status: {
        code: 200,
        message: 'Success'
      },
      data,
      pagination: {
        links: {
          first: links.first,
          previous: links.previous,
          current: links.current,
          next: links.next,
          last: links.last
        },
        meta: {
          currentPage: page,
          itemsPerPage: limit,
          totalItems,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        }
      }
    };
  }
}