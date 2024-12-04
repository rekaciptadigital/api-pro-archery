import { Injectable } from '@nestjs/common';
import { ApiResponse, ApiStatus, PaginationLinks } from '../interfaces/api-response.interface';

@Injectable()
export class ResponseTransformer {
  transform<T>(data: T): ApiResponse<T> {
    return {
      status: {
        code: 200,
        message: 'Success'
      },
      data: Array.isArray(data) ? data : [data]
    };
  }

  transformPaginated<T>(
    data: T[],
    totalItems: number,
    currentPage: number,
    pageSize: number,
    links: PaginationLinks
  ): ApiResponse<T> {
    const totalPages = Math.ceil(totalItems / pageSize);

    // Return empty data array if page number exceeds total pages
    if (currentPage > totalPages && totalItems > 0) {
      return {
        status: {
          code: 200,
          message: 'Success'
        },
        data: [],
        pagination: {
          currentPage,
          totalPages,
          pageSize,
          totalItems,
          hasNext: false,
          hasPrevious: currentPage > 1
        }
      };
    }

    return {
      status: {
        code: 200,
        message: 'Success'
      },
      data,
      pagination: {
        currentPage,
        totalPages,
        pageSize,
        totalItems,
        hasNext: currentPage < totalPages,
        hasPrevious: currentPage > 1
      }
    };
  }
}