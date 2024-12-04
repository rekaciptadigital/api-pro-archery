import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaginationException } from '../exceptions/pagination.exception';
import {
  PaginationOptions,
  PaginationLinks,
  PaginationMeta,
} from '../interfaces/pagination.interface';

@Injectable()
export class PaginationHelper {
  constructor(private readonly configService: ConfigService) {}

  private validateInput(options: PaginationOptions): void {
    if (!options.serviceName) {
      throw new PaginationException('Service name is required');
    }

    if (options.totalItems < 0) {
      throw new PaginationException('Total items cannot be negative');
    }

    if (options.page && options.page < 1) {
      throw new PaginationException('Page number must be greater than 0');
    }

    if (options.limit && (options.limit < 1 || options.limit > 100)) {
      throw new PaginationException('Items per page must be between 1 and 100');
    }
  }

  private buildUrl(
    serviceName: string,
    page: number,
    limit: number,
    customParams?: Record<string, string | number>,
  ): string {
    const baseUrl = this.configService.get<string>('appUrl');
    const url = new URL(`${baseUrl}/${serviceName}`);

    url.searchParams.set('page', page.toString());
    url.searchParams.set('limit', limit.toString());

    if (customParams) {
      Object.entries(customParams).forEach(([key, value]) => {
        url.searchParams.set(key, value.toString());
      });
    }

    return url.toString();
  }

  private generateLinks(
    serviceName: string,
    currentPage: number,
    totalPages: number,
    limit: number,
    customParams?: Record<string, string | number>,
  ): PaginationLinks {
    return {
      first: this.buildUrl(serviceName, 1, limit, customParams),
      previous:
        currentPage > 1
          ? this.buildUrl(serviceName, currentPage - 1, limit, customParams)
          : null,
      current: this.buildUrl(serviceName, currentPage, limit, customParams),
      next:
        currentPage < totalPages
          ? this.buildUrl(serviceName, currentPage + 1, limit, customParams)
          : null,
      last: this.buildUrl(serviceName, totalPages || 1, limit, customParams),
    };
  }

  private generateMeta(
    currentPage: number,
    limit: number,
    totalItems: number,
  ): PaginationMeta {
    const totalPages = Math.ceil(totalItems / limit);

    return {
      currentPage,
      itemsPerPage: limit,
      totalItems,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
    };
  }

  generatePaginationData(options: PaginationOptions) {
    this.validateInput(options);

    const page = options.page || 1;
    const limit = options.limit || 10;
    const totalPages = Math.ceil(options.totalItems / limit);

    const links = this.generateLinks(
      options.serviceName,
      page,
      totalPages,
      limit,
      options.customParams,
    );

    const meta = this.generateMeta(page, limit, options.totalItems);

    return { links, meta };
  }

  getSkipTake(page: number = 1, limit: number = 10): { skip: number; take: number } {
    return {
      skip: (page - 1) * limit,
      take: limit,
    };
  }
}