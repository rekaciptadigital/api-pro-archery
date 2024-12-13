import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiResponse, ApiStatus } from '../interfaces/api-response.interface';
import { DateUtil } from '../utils/date.util';

@Injectable()
export class ResponseTransformer {
  constructor(private configService: ConfigService) {
    DateUtil.setConfigService(this.configService);
  }

  transform<T extends Record<string, any>>(data: T | T[] | { message: string }): ApiResponse<T> {
    const status: ApiStatus = {
      code: 200,
      message: 'Success'
    };

    // Handle message-only responses
    if (typeof data === 'object' && data !== null && 'message' in data) {
      return {
        status,
        info: (data as any).message
      };
    }

    // Format timestamps in the data
    const formattedData = Array.isArray(data)
      ? data.map(item => DateUtil.formatTimestamps(item))
      : DateUtil.formatTimestamps(data);

    return {
      status,
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
    links: {
      first: string;
      previous: string | null;
      current: string;
      next: string | null;
      last: string;
    }
  ): ApiResponse<T> {
    const totalPages = Math.ceil(totalItems / pageSize);

    // Handle empty page beyond valid range
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

  transformError(code: number, message: string | string[]): ApiResponse<any> {
    return {
      status: {
        code,
        message: 'Error'
      },
      error: Array.isArray(message) ? message : [message]
    };
  }
}