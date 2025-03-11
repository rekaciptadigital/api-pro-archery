import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
  Repository,
  IsNull,
  DeepPartial,
  SaveOptions,
  Not,
  QueryRunner,
  FindOptionsWhere,
} from "typeorm";
import { PriceCategory } from "../entities/price-category.entity";
import { BaseRepository } from "@/common/repositories/base.repository";

@Injectable()
export class PriceCategoryRepository extends BaseRepository<PriceCategory> {
  constructor(
    @InjectRepository(PriceCategory)
    private readonly priceCategoryRepository: Repository<PriceCategory>
  ) {
    super(priceCategoryRepository);
  }

  async findByTypeAndName(
    type: string,
    name: string
  ): Promise<PriceCategory | null> {
    return this.priceCategoryRepository.findOne({
      where: {
        type: type.toLowerCase(),
        name,
        deleted_at: IsNull(),
      },
    });
  }

  async findByTypeAndNameIncludingDeleted(
    type: string,
    name: string
  ): Promise<PriceCategory | null> {
    return this.priceCategoryRepository.findOne({
      where: {
        type: type.toLowerCase(),
        name,
      },
      withDeleted: true,
    });
  }

  async findAllGroupedByType(
    search?: string
  ): Promise<Record<string, PriceCategory[]>> {
    const query = this.priceCategoryRepository
      .createQueryBuilder("price_category")
      .where("price_category.deleted_at IS NULL");

    if (search) {
      query.andWhere(
        "(LOWER(price_category.name) LIKE LOWER(:search) OR LOWER(price_category.type) LIKE LOWER(:search))",
        {
          search: `%${search}%`,
        }
      );
    }

    const categories = await query
      .orderBy("price_category.type", "ASC")
      .addOrderBy("price_category.name", "ASC")
      .getMany();

    return categories.reduce(
      (acc, category) => {
        if (!acc[category.type]) {
          acc[category.type] = [];
        }
        acc[category.type].push(category);
        return acc;
      },
      {} as Record<string, PriceCategory[]>
    );
  }

  async restore(
    id: number,
    queryRunner?: QueryRunner
  ): Promise<PriceCategory | null> {
    const repository = queryRunner
      ? queryRunner.manager.getRepository(PriceCategory)
      : this.priceCategoryRepository;

    await repository
      .createQueryBuilder("price_category")
      .update(PriceCategory)
      .set({ deleted_at: null })
      .where("id = :id", { id })
      .execute();

    return repository.findOne({
      where: { id },
    });
  }

  async save(
    entityOrEntities: DeepPartial<PriceCategory> | DeepPartial<PriceCategory>[],
    options?: SaveOptions
  ): Promise<PriceCategory | PriceCategory[]> {
    if (Array.isArray(entityOrEntities)) {
      return this.priceCategoryRepository.save(entityOrEntities, options);
    }
    return this.priceCategoryRepository.save(entityOrEntities, options);
  }

  async count(options?: FindOptionsWhere<PriceCategory>): Promise<number> {
    return this.priceCategoryRepository.count({
      where: {
        ...options,
        deleted_at: IsNull(),
      },
    });
  }

  async delete(id: number): Promise<void> {
    await this.priceCategoryRepository.softDelete(id);
  }
}
