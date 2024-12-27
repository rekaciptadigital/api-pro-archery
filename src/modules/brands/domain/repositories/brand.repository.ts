import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, IsNull } from "typeorm";
import { Brand } from "../entities/brand.entity";
import { BaseRepository } from "@/common/repositories/base.repository";
import { BrandQueryBuilder } from "../builders/brand-query.builder";
import { BrandSortField, SortOrder } from "../../application/dtos/brand-query.dto";

@Injectable()
export class BrandRepository extends BaseRepository<Brand> {
  constructor(
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>
  ) {
    super(brandRepository);
  }

  async findByCode(code: string, excludeId?: number): Promise<Brand | null> {
    const query = this.brandRepository.createQueryBuilder('brand')
      .where('LOWER(brand.code) = LOWER(:code)', { code })
      .andWhere('brand.deleted_at IS NULL');

    if (excludeId) {
      query.andWhere('brand.id != :id', { id: excludeId });
    }

    return query.getOne();
  }

  async findBrands(
    skip: number,
    take: number,
    sort: BrandSortField = BrandSortField.CREATED_AT,
    order: SortOrder = SortOrder.DESC,
    search?: string
  ): Promise<[Brand[], number]> {
    const queryBuilder = BrandQueryBuilder.create(this.brandRepository)
      .addSearch(search)
      .addPagination(skip, take)
      .addOrderBy(sort, order)
      .build();

    return queryBuilder.getManyAndCount();
  }

  async findWithDeleted(id: number): Promise<Brand | null> {
    return this.repository.findOne({
      where: { id } as any,
      withDeleted: true
    });
  }

  async restore(id: number): Promise<Brand | null> {
    await this.repository.restore(id);
    return this.findById(id);
  }
}