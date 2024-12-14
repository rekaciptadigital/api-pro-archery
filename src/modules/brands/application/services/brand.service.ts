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

  async create(createBrandDto: CreateBrandDto) {
    await this.brandValidator.validateCode(createBrandDto.code);

    const brand = await this.brandRepository.create({
      ...createBrandDto,
      status: createBrandDto.status ?? true,
    });

    return this.responseTransformer.transform(brand);
  }

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

  async findOne(id: number) {
    const brand = await this.brandRepository.findById(id);
    if (!brand) {
      throw new NotFoundException('Brand not found');
    }
    return this.responseTransformer.transform(brand);
  }

  async update(id: number, updateBrandDto: UpdateBrandDto) {
    const brand = await this.brandRepository.findById(id);
    if (!brand) {
      throw new NotFoundException('Brand not found');
    }

    if (updateBrandDto.code && updateBrandDto.code !== brand.code) {
      await this.brandValidator.validateCode(updateBrandDto.code, id);
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
      status: updateStatusDto.status
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
}