import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, IsNull } from "typeorm";
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
}
