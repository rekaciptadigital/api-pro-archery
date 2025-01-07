import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { ProductCategory } from '../entities/product-category.entity';
import { BaseRepository } from '@/common/repositories/base.repository';
import { ProductCategorySortField, SortOrder } from '../../application/dtos/product-category-query.dto';

@Injectable()
export class ProductCategoryRepository extends BaseRepository<ProductCategory> {
  constructor(
    @InjectRepository(ProductCategory)
    private readonly productCategoryRepository: Repository<ProductCategory>
  ) {
    super(productCategoryRepository);
  }

  async findByCode(code: string, excludeId?: number): Promise<ProductCategory | null> {
    const query = this.productCategoryRepository.createQueryBuilder('category')
      .where('LOWER(category.code) = LOWER(:code)', { code })
      .andWhere('category.deleted_at IS NULL');

    if (excludeId) {
      query.andWhere('category.id != :id', { id: excludeId });
    }

    return query.getOne();
  }

  async findByCodeWithDeleted(code: string): Promise<ProductCategory | null> {
    return this.productCategoryRepository.findOne({
      where: { code },
      withDeleted: true
    });
  }

  async findCategories(
    skip: number,
    take: number,
    sort: ProductCategorySortField = ProductCategorySortField.CREATED_AT,
    order: SortOrder = SortOrder.DESC,
    search?: string,
    status?: boolean
  ): Promise<[ProductCategory[], number]> {
    const query = this.productCategoryRepository.createQueryBuilder('category')
      .leftJoinAndSelect('category.children', 'children', 'children.deleted_at IS NULL')
      .where('category.deleted_at IS NULL')
      .andWhere('category.parent_id IS NULL');

    if (search) {
      query.andWhere('LOWER(category.name) LIKE LOWER(:search)', { 
        search: `%${search}%` 
      });
    }

    if (status !== undefined) {
      query.andWhere('category.status = :status', { status });
    }

    query.orderBy(`category.${sort}`, order)
      .skip(skip)
      .take(take);

    return query.getManyAndCount();
  }

  async findOneWithHierarchy(id: number): Promise<ProductCategory | null> {
    const query = this.productCategoryRepository.createQueryBuilder('category')
      .where('category.id = :id', { id })
      .andWhere('category.deleted_at IS NULL');

    // Load children if it's a parent category
    const category = await query
      .leftJoinAndSelect('category.children', 'children', 'children.deleted_at IS NULL')
      .getOne();

    if (!category) {
      return null;
    }

    // If it's a child category, load its parent hierarchy
    if (category.parent_id) {
      const parents = await this.getParentHierarchy(category.parent_id);
      (category as any).parents = parents;
    }

    return category;
  }

  private async getParentHierarchy(parentId: number): Promise<ProductCategory[]> {
    const parents: ProductCategory[] = [];
    let currentParentId = parentId;

    while (currentParentId) {
      const parent = await this.productCategoryRepository.findOne({
        where: { 
          id: currentParentId,
          deleted_at: IsNull()
        }
      });

      if (!parent) break;

      parents.push(parent);
      currentParentId = parent.parent_id || 0;
    }

    return parents;
  }

  async findWithDeleted(id: number): Promise<ProductCategory | null> {
    return this.repository.findOne({
      where: { id } as any,
      withDeleted: true
    });
  }

  async restore(id: number): Promise<ProductCategory | null> {
    await this.repository.restore(id);
    return this.findById(id);
  }
}