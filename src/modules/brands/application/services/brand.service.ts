import { Injectable, NotFoundException } from '@nestjs/common';
import { BrandRepository } from '../../domain/repositories/brand.repository';
import { CreateBrandDto, UpdateBrandDto, UpdateBrandStatusDto } from '../dtos/brand.dto';
import { BrandQueryDto } from '../dtos/brand-query.dto';
import { BrandValidator } from '../../domain/validators/brand.validator';
import { PaginationHelper } from '@/common/pagination/helpers/pagination.helper';
import { ResponseTransformer } from '@/common/transformers/response.transformer';
import { ILike, IsNull } from 'typeorm';

@Injectable()
export class BrandService {
  constructor(
    private readonly brandRepository: BrandRepository,
    private readonly brandValidator: BrandValidator,
    private readonly paginationHelper: PaginationHelper,
    private readonly responseTransformer: ResponseTransformer,
  ) {}

  async findAll(query: BrandQueryDto) {
    const { skip, take } = this.paginationHelper.getSkipTake(query.page, query.limit);

    const where: any = { deleted_at: IsNull() };
    
    if (query.status !== undefined) {
      where.status = query.status;
    }

    if (query.search) {
      where.name = ILike(`%${query.search}%`);
    }

    const [brands, total] = await this.brandRepository.findAndCount({
      where,
      skip,
      take,
      order: { created_at: 'DESC' },
    });

    const paginationData = this.paginationHelper.generatePaginationData({
      serviceName: 'brands',
      totalItems: total,
      page: query.page,
      limit: query.limit,
      customParams: query.toCustomParams()
    });

    return this.responseTransformer.transformPaginated(
      brands,
      total,
      query.page || 1,
      query.limit || 10,
      paginationData.links
    );
  }

  async findDeleted(query: BrandQueryDto) {
    const { skip, take } = this.paginationHelper.getSkipTake(query.page, query.limit);

    const [brands, total] = await this.brandRepository.findAndCount({
      where: { deleted_at: IsNull() },
      skip,
      take,
      order: { deleted_at: 'DESC' },
    });

    const paginationData = this.paginationHelper.generatePaginationData({
      serviceName: 'brands/deleted',
      totalItems: total,
      page: query.page,
      limit: query.limit,
      customParams: query.toCustomParams()
    });

    return this.responseTransformer.transformPaginated(
      brands,
      total,
      query.page || 1,
      query.limit || 10,
      paginationData.links
    );
  }

  // ... rest of the service methods remain unchanged
}