import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, FindOptionsWhere, IsNull, Not } from "typeorm";
import { Brand } from "../entities/brand.entity";
import { BaseRepository } from "@/common/repositories/base.repository";
import { BrandQueryBuilder } from "../builders/brand-query.builder";

@Injectable()
export class BrandRepository extends BaseRepository<Brand> {
  constructor(
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>
  ) {
    super(brandRepository);
  }

  async findByCode(code: string, excludeId?: number): Promise<Brand | null> {
    const query = this.brandRepository
      .createQueryBuilder("brand")
      .where("LOWER(brand.code) = LOWER(:code)", { code })
      .andWhere("brand.deleted_at IS NULL");

    if (excludeId) {
      query.andWhere("brand.id != :id", { id: excludeId });
    }

    return query.getOne();
  }

  async findByCodeIncludingDeleted(code: string): Promise<Brand | null> {
    return this.brandRepository.findOne({
      where: {
        code: code,
      },
      withDeleted: true,
    });
  }

  async findActiveBrands(
    skip: number,
    take: number,
    sort: string = "created_at",
    order: "ASC" | "DESC" = "DESC"
  ): Promise<[Brand[], number]> {
    const queryBuilder = BrandQueryBuilder.createActiveOnly(
      this.brandRepository
    )
      .addPagination(skip, take)
      .addOrderBy(sort, order)
      .build();

    return queryBuilder.getManyAndCount();
  }

  async findBrands(
    skip: number,
    take: number,
    sort: string = "created_at",
    order: "ASC" | "DESC" = "DESC"
  ): Promise<[Brand[], number]> {
    const queryBuilder = BrandQueryBuilder.create(this.brandRepository)
      .addPagination(skip, take)
      .addOrderBy(sort, order)
      .build();

    return queryBuilder.getManyAndCount();
  }

  async findById(id: number): Promise<Brand | null> {
    return this.brandRepository.findOne({
      where: {
        id,
        deleted_at: IsNull(),
      } as FindOptionsWhere<Brand>,
    });
  }

  async findActiveById(id: number): Promise<Brand | null> {
    return this.brandRepository.findOne({
      where: {
        id,
        status: true,
        deleted_at: IsNull(),
      } as FindOptionsWhere<Brand>,
    });
  }
}
