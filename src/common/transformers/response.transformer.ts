import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { 
  ApiResponse, 
  SingleApiResponse, 
  ArrayApiResponse, 
  PaginatedApiResponse 
} from '../interfaces/api-response.interface';
import { DateUtil } from '../utils/date.util';
import { BaseTransformer } from './base.transformer';

@Injectable()
export class ResponseTransformer extends BaseTransformer {
  constructor(private configService: ConfigService) {
    super();
    DateUtil.setConfigService(this.configService);
  }

  transform<T extends Record<string, any>>(
    data: T | T[] | { message: string }, 
    forceArray: boolean = false
  ): ApiResponse<T> {
    // Handle message-only responses
    if (typeof data === 'object' && data !== null && 'message' in data) {
      return {
        status: this.createSuccessStatus(),
        info: (data as any).message
      };
    }

    // Format timestamps in the data
    const formattedData = Array.isArray(data)
      ? data.map(item => DateUtil.formatTimestamps(item))
      : DateUtil.formatTimestamps(data);

    return {
      status: this.createSuccessStatus(),
      data: formattedData
    } as SingleApiResponse<T>;
  }

  transformDelete(entityName: string): ApiResponse<any> {
    return {
      status: this.createSuccessStatus(),
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
  ): PaginatedApiResponse<T> {
    const totalPages = Math.ceil(totalItems / pageSize);

    // Handle empty page beyond valid range
    if (currentPage > totalPages && totalItems > 0) {
      return {
        status: this.createSuccessStatus(),
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
      status: this.createSuccessStatus(),
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
      status: this.createErrorStatus(code),
      error: Array.isArray(message) ? message : [message]
    };
  }
}