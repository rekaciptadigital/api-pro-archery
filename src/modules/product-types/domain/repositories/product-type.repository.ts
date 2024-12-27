import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { ProductType } from '../entities/product-type.entity';
import { BaseRepository } from '@/common/repositories/base.repository';
import { ProductTypeSortField, SortOrder } from '../../application/dtos/product-type-query.dto';

@Injectable()
export class ProductTypeRepository extends BaseRepository<ProductType> {
  constructor(
    @InjectRepository(ProductType)
    private readonly productTypeRepository: Repository<ProductType>
  ) {
    super(productTypeRepository);
  }

  async findByCode(code: string, excludeId?: number): Promise<ProductType | null> {
    const query = this.productTypeRepository.createQueryBuilder('productType')
      .where('LOWER(productType.code) = LOWER(:code)', { code })
      .andWhere('productType.deleted_at IS NULL');

    if (excludeId) {
      query.andWhere('productType.id != :id', { id: excludeId });
    }

    return query.getOne();
  }

  async findProductTypes(
    skip: number,
    take: number,
    sort: ProductTypeSortField = ProductTypeSortField.CREATED_AT,
    order: SortOrder = SortOrder.DESC,
    search?: string,
    status?: boolean
  ): Promise<[ProductType[], number]> {
    const query = this.productTypeRepository.createQueryBuilder('productType')
      .where('productType.deleted_at IS NULL');

    if (search) {
      query.andWhere(
        '(LOWER(productType.name) LIKE LOWER(:search) OR LOWER(productType.code) LIKE LOWER(:search))',
        { search: `%${search}%` }
      );
    }

    if (status !== undefined) {
      query.andWhere('productType.status = :status', { status });
    }

    query.orderBy(`productType.${sort}`, order)
      .skip(skip)
      .take(take);

    return query.getManyAndCount();
  }

  async findWithDeleted(id: number): Promise<ProductType | null> {
    return this.repository.findOne({
      where: { id } as any,
      withDeleted: true
    });
  }

  async restore(id: number): Promise<ProductType | null> {
    await this.repository.restore(id);
    return this.findById(id);
  }
}