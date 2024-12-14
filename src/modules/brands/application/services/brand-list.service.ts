import { Injectable } from '@nestjs/common';
import { BrandRepository } from '../../domain/repositories/brand.repository';
import { BrandQueryDto } from '../dtos/brand-query.dto';
import { PaginationHelper } from '@/common/pagination/helpers/pagination.helper';
import { ResponseTransformer } from '@/common/transformers/response.transformer';
import { ILike, IsNull, FindOptionsWhere } from 'typeorm';
import { Brand } from '../../domain/entities/brand.entity';

@Injectable()
export class BrandListService {
  constructor(
    private readonly brandRepository: BrandRepository,
    private readonly paginationHelper: PaginationHelper,
    private readonly responseTransformer: ResponseTransformer,
  ) {}

  async execute(query: BrandQueryDto) {
    const { skip, take } = this.paginationHelper.getSkipTake(query.page, query.limit);

    // Build where clause
    const where: FindOptionsWhere<Brand> = {
      deleted_at: IsNull()
    };
    
    // Only add status filter if it's explicitly provided
    if (query.status !== undefined) {
      where.status = query.status;
    }

    // Add search filter if provided
    if (query.search) {
      where.name = ILike(`%${query.search}%`);
    }

    // Get brands with pagination
    const [brands, total] = await this.brandRepository.findAndCount({
      where,
      skip,
      take,
      order: { created_at: 'DESC' },
    });

    // Generate pagination data
    const paginationData = this.paginationHelper.generatePaginationData({
      serviceName: 'brands',
      totalItems: total,
      page: query.page || 1,
      limit: query.limit || 10,
      customParams: {
        ...(query.status !== undefined && { status: query.status ? '1' : '0' }),
        ...(query.search && { search: query.search }),
        page: (query.page || 1).toString(),
        limit: (query.limit || 10).toString()
      }
    });

    // Transform and return response
    return this.responseTransformer.transformPaginated(
      brands,
      total,
      query.page || 1,
      query.limit || 10,
      paginationData.links
    );
  }
}