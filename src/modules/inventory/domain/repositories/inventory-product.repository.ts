import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, ILike } from 'typeorm';
import { InventoryProduct } from '../entities/inventory-product.entity';
import { BaseRepository } from '@/common/repositories/base.repository';
import { InventoryProductSortField, SortOrder } from '../../application/dtos/inventory-product-query.dto';

@Injectable()
export class InventoryProductRepository extends BaseRepository<InventoryProduct> {
  constructor(
    @InjectRepository(InventoryProduct)
    private readonly inventoryProductRepository: Repository<InventoryProduct>
  ) {
    super(inventoryProductRepository);
  }

  async findBySkuOrUniqueCode(sku: string, uniqueCode?: string): Promise<InventoryProduct | null> {
    const query = this.inventoryProductRepository.createQueryBuilder('product')
      .where('product.sku = :sku', { sku });

    if (uniqueCode) {
      query.orWhere('product.unique_code = :uniqueCode', { uniqueCode });
    }

    return query.getOne();
  }

  async findBySkuOrUniqueCodeWithDeleted(sku: string, uniqueCode?: string): Promise<InventoryProduct | null> {
    const query = this.inventoryProductRepository.createQueryBuilder('product')
      .withDeleted()
      .where('product.sku = :sku', { sku });

    if (uniqueCode) {
      query.orWhere('product.unique_code = :uniqueCode', { uniqueCode });
    }

    return query.getOne();
  }

  async findProducts(
    skip: number,
    take: number,
    sort: InventoryProductSortField = InventoryProductSortField.CREATED_AT,
    order: SortOrder = SortOrder.DESC,
    search?: string
  ): Promise<[InventoryProduct[], number]> {
    const query = this.inventoryProductRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.categories', 'categories')
      .leftJoinAndSelect('product.variants', 'variants')
      .leftJoinAndSelect('variants.values', 'variant_values')
      .leftJoinAndSelect('product.product_by_variant', 'product_by_variant')
      .where('product.deleted_at IS NULL');

    if (search) {
      query.andWhere(
        '(LOWER(product.product_name) LIKE LOWER(:search) OR ' +
        'LOWER(product.sku) LIKE LOWER(:search) OR ' +
        'LOWER(product.full_product_name) LIKE LOWER(:search))',
        { search: `%${search}%` }
      );
    }

    query.orderBy(`product.${sort}`, order)
      .skip(skip)
      .take(take);

    return query.getManyAndCount();
  }

  async findOneWithRelations(id: number): Promise<InventoryProduct | null> {
    return this.inventoryProductRepository.findOne({
      where: { 
        id,
        deleted_at: IsNull()
      },
      relations: [
        'categories',
        'variants',
        'variants.values',
        'product_by_variant'
      ]
    });
  }

  async findWithDeleted(id: number): Promise<InventoryProduct | null> {
    return this.inventoryProductRepository.findOne({
      where: { id },
      withDeleted: true,
      relations: [
        'categories',
        'variants',
        'variants.values',
        'product_by_variant'
      ]
    });
  }

  async restore(id: number): Promise<InventoryProduct | null> {
    await this.inventoryProductRepository.restore(id);
    return this.findById(id);
  }
}