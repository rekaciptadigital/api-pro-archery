import { SelectQueryBuilder, Repository } from 'typeorm';
import { Brand } from '../entities/brand.entity';

export class BrandQueryBuilder {
  private constructor(private readonly queryBuilder: SelectQueryBuilder<Brand>) {}

  static create(repository: Repository<Brand>): BrandQueryBuilder {
    const queryBuilder = repository
      .createQueryBuilder('brand')
      .where('brand.deleted_at IS NULL')
      .andWhere('brand.status = :status', { status: true });

    return new BrandQueryBuilder(queryBuilder);
  }

  addPagination(skip: number, take: number): this {
    this.queryBuilder
      .skip(skip)
      .take(take);
    return this;
  }

  addOrderBy(sort: string, order: 'ASC' | 'DESC'): this {
    this.queryBuilder.orderBy(`brand.${sort}`, order);
    return this;
  }

  build(): SelectQueryBuilder<Brand> {
    return this.queryBuilder;
  }
}