import { Injectable, NotFoundException } from '@nestjs/common';
import { BrandRepository } from '../../domain/repositories/brand.repository';
import { CreateBrandDto, UpdateBrandDto, UpdateBrandStatusDto } from '../dtos/brand.dto';
import { BrandQueryDto } from '../dtos/brand-query.dto';
import { BrandValidator } from '../../domain/validators/brand.validator';
import { PaginationHelper } from '@/common/pagination/helpers/pagination.helper';
import { ResponseTransformer } from '@/common/transformers/response.transformer';
import { DomainException } from '@/common/exceptions/domain.exception';
import { HttpStatus } from '@nestjs/common';

@Injectable()
export class BrandService {
  constructor(
    private readonly brandRepository: BrandRepository,
    private readonly brandValidator: BrandValidator,
    private readonly paginationHelper: PaginationHelper,
    private readonly responseTransformer: ResponseTransformer
  ) {}

  async create(createBrandDto: CreateBrandDto) {
    await this.brandValidator.validateName(createBrandDto.name);

    // Check if brand with same code exists (including deleted)
    const existingBrand = await this.brandRepository.findByCodeIncludingDeleted(createBrandDto.code);

    if (existingBrand) {
      // If brand exists and is not deleted, return conflict error
      if (!existingBrand.deleted_at) {
        throw new DomainException(
          'Brand code already exists',
          HttpStatus.CONFLICT
        );
      }

      // If brand exists but is deleted, restore and update it
      await this.brandRepository.restore(existingBrand.id);
      const updated = await this.brandRepository.update(existingBrand.id, {
        ...createBrandDto,
        status: createBrandDto.status ?? true,
      });

      return this.responseTransformer.transform(updated);
    }

    // If brand doesn't exist, create new one
    const brand = await this.brandRepository.create({
      ...createBrandDto,
      status: createBrandDto.status ?? true,
    });

    return this.responseTransformer.transform(brand);
  }

  async findAll(query: BrandQueryDto) {
    const { skip, take } = this.paginationHelper.getSkipTake(query.page, query.limit);
    
    const [brands, total] = await this.brandRepository.findActiveBrands(
      skip, 
      take,
      query.sort,
      query.order
    );

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

  async findOne(id: number) {
    const brand = await this.brandRepository.findActiveById(id);
    if (!brand) {
      throw new NotFoundException('Brand not found or inactive');
    }
    return this.responseTransformer.transform(brand);
  }

  async update(id: number, updateBrandDto: UpdateBrandDto) {
    const brand = await this.brandRepository.findById(id);
    if (!brand) {
      throw new NotFoundException('Brand not found');
    }

    if (updateBrandDto.name) {
      await this.brandValidator.validateName(updateBrandDto.name);
    }

    if (updateBrandDto.code && updateBrandDto.code !== brand.code) {
      // Check if brand code exists (regardless of deleted_at status)
      const existingBrand = await this.brandRepository.findByCodeIncludingDeleted(updateBrandDto.code);
      if (existingBrand && existingBrand.id !== id) {
        throw new DomainException(
          'Brand code already exists',
          HttpStatus.CONFLICT
        );
      }
    }

    const updated = await this.brandRepository.update(id, updateBrandDto);
    return this.responseTransformer.transform(updated);
  }

  async updateStatus(id: number, updateStatusDto: UpdateBrandStatusDto) {
    const brand = await this.brandRepository.findById(id);
    if (!brand) {
      throw new NotFoundException('Brand not found');
    }

    await this.brandRepository.update(id, updateStatusDto);
    return this.responseTransformer.transform({
      id,
      status: updateStatusDto.status,
      updated_at: new Date()
    });
  }

  async remove(id: number) {
    const brand = await this.brandRepository.findById(id);
    if (!brand) {
      throw new NotFoundException('Brand not found');
    }

    await this.brandRepository.softDelete(id);
    return this.responseTransformer.transform({ message: 'Brand deleted successfully' });
  }

  async restore(id: number) {
    const brand = await this.brandRepository.findWithDeleted(id);
    if (!brand) {
      throw new NotFoundException('Brand not found');
    }

    if (!brand.deleted_at) {
      throw new DomainException('Brand is not deleted', HttpStatus.BAD_REQUEST);
    }

    const restored = await this.brandRepository.restore(id);
    if (!restored) {
      throw new DomainException('Failed to restore brand', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return this.responseTransformer.transform(restored);
  }
}