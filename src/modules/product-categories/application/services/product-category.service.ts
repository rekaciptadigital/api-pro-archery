import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductCategoryRepository } from '../../domain/repositories/product-category.repository';
import { CreateProductCategoryDto, UpdateProductCategoryDto, UpdateProductCategoryStatusDto } from '../dtos/product-category.dto';
import { ProductCategoryQueryDto } from '../dtos/product-category-query.dto';
import { ProductCategoryValidator } from '../../domain/validators/product-category.validator';
import { PaginationHelper } from '@/common/pagination/helpers/pagination.helper';
import { ResponseTransformer } from '@/common/transformers/response.transformer';
import { DomainException } from '@/common/exceptions/domain.exception';
import { HttpStatus } from '@nestjs/common';

@Injectable()
export class ProductCategoryService {
  constructor(
    private readonly productCategoryRepository: ProductCategoryRepository,
    private readonly productCategoryValidator: ProductCategoryValidator,
    private readonly paginationHelper: PaginationHelper,
    private readonly responseTransformer: ResponseTransformer
  ) {}

  async create(createProductCategoryDto: CreateProductCategoryDto) {
    await this.productCategoryValidator.validateName(createProductCategoryDto.name);
    await this.productCategoryValidator.validateCode(createProductCategoryDto.code);
    await this.productCategoryValidator.validateParentId(createProductCategoryDto.parent_id);

    const existingCategory = await this.productCategoryRepository.findByCodeWithDeleted(
      createProductCategoryDto.code
    );

    if (existingCategory) {
      if (existingCategory.deleted_at) {
        // Restore and update the category
        await this.productCategoryRepository.restore(existingCategory.id);
        const updated = await this.productCategoryRepository.update(
          existingCategory.id,
          {
            ...createProductCategoryDto,
            status: createProductCategoryDto.status ?? true
          }
        );
        return this.responseTransformer.transform(updated);
      }
      throw new DomainException('Category code already exists', HttpStatus.CONFLICT);
    }

    const category = await this.productCategoryRepository.create({
      ...createProductCategoryDto,
      status: createProductCategoryDto.status ?? true
    });

    return this.responseTransformer.transform(category);
  }

  async findAll(query: ProductCategoryQueryDto) {
    const { skip, take } = this.paginationHelper.getSkipTake(query.page, query.limit);
    
    const [categories, total] = await this.productCategoryRepository.findCategories(
      skip,
      take,
      query.sort,
      query.order,
      query.search,
      query.status
    );

    const paginationData = this.paginationHelper.generatePaginationData({
      serviceName: 'product-categories',
      totalItems: total,
      page: query.page,
      limit: query.limit,
      customParams: query.toCustomParams()
    });

    return this.responseTransformer.transformPaginated(
      categories,
      total,
      query.page || 1,
      query.limit || 10,
      paginationData.links
    );
  }

  async findOne(id: number) {
    const category = await this.productCategoryRepository.findOneWithHierarchy(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return this.responseTransformer.transform(category);
  }

  async update(id: number, updateProductCategoryDto: UpdateProductCategoryDto) {
    const category = await this.productCategoryRepository.findById(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (updateProductCategoryDto.name) {
      await this.productCategoryValidator.validateName(updateProductCategoryDto.name);
    }

    if (updateProductCategoryDto.code && updateProductCategoryDto.code !== category.code) {
      await this.productCategoryValidator.validateCode(updateProductCategoryDto.code);
      const existingCategory = await this.productCategoryRepository.findByCode(
        updateProductCategoryDto.code,
        id
      );
      if (existingCategory) {
        throw new DomainException('Category code already exists', HttpStatus.CONFLICT);
      }
    }

    if (updateProductCategoryDto.parent_id) {
      await this.productCategoryValidator.validateParentId(updateProductCategoryDto.parent_id);
      
      // Prevent circular reference
      if (updateProductCategoryDto.parent_id === id) {
        throw new DomainException(
          'Category cannot be its own parent',
          HttpStatus.BAD_REQUEST
        );
      }
    }

    const updated = await this.productCategoryRepository.update(id, updateProductCategoryDto);
    return this.responseTransformer.transform(updated);
  }

  async updateStatus(id: number, updateStatusDto: UpdateProductCategoryStatusDto) {
    const category = await this.productCategoryRepository.findById(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    await this.productCategoryRepository.update(id, updateStatusDto);
    return this.responseTransformer.transform({
      id,
      status: updateStatusDto.status,
      updated_at: new Date()
    });
  }

  async remove(id: number) {
    const category = await this.productCategoryRepository.findById(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    await this.productCategoryRepository.softDelete(id);
    return this.responseTransformer.transform({ 
      message: 'Category deleted successfully' 
    });
  }

  async restore(id: number) {
    const category = await this.productCategoryRepository.findWithDeleted(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (!category.deleted_at) {
      throw new DomainException('Category is not deleted', HttpStatus.BAD_REQUEST);
    }

    const restored = await this.productCategoryRepository.restore(id);
    if (!restored) {
      throw new DomainException('Failed to restore category', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return this.responseTransformer.transform(restored);
  }
}