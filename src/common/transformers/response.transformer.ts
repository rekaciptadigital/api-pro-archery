import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiResponse, ApiStatus, PaginationLinks } from '../interfaces/api-response.interface';
import { DateUtil } from '../utils/date.util';

@Injectable()
export class ResponseTransformer {
  constructor(private configService: ConfigService) {
    DateUtil.setConfigService(this.configService);
  }

  transform<T extends Record<string, any>>(data: T): ApiResponse<T> {
    if (typeof data === 'object' && data !== null && 'message' in data) {
      return {
        status: {
          code: 200,
          message: 'Success'
        },
        info: (data as any).message
      };
    }

    const formattedData = Array.isArray(data)
      ? data.map(item => DateUtil.formatTimestamps(item))
      : DateUtil.formatTimestamps(data);

    return {
      status: {
        code: 200,
        message: 'Success'
      },
      data: Array.isArray(formattedData) ? formattedData : [formattedData]
    };
  }

  transformDelete(entityName: string): ApiResponse<any> {
    return {
      status: {
        code: 200,
        message: 'Success'
      },
      info: `${entityName} deleted successfully`
    };
  }

  transformPaginated<T extends Record<string, any>>(
    data: T[],
    totalItems: number,
    currentPage: number,
    pageSize: number,
    links: PaginationLinks
  ): ApiResponse<T> {
    const totalPages = Math.ceil(totalItems / pageSize);

    if (currentPage > totalPages && totalItems > 0) {
      return {
        status: {
          code: 200,
          message: 'Success'
        },
        data: [],
        pagination: {
          links,
          currentPage,
          totalPages,
          pageSize,
          totalItems,
          hasNext: false,
          hasPrevious: currentPage > 1
        }
      };
    }

    const formattedData = data.map(item => DateUtil.formatTimestamps(item));

    return {
      status: {
        code: 200,
        message: 'Success'
      },
      data: formattedData,
      pagination: {
        links,
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