import { SelectQueryBuilder, Repository } from "typeorm";
import { Variant } from "../entities/variant.entity";
import { VariantSortField, SortOrder } from "../../application/dtos/variant-query.dto";

export class VariantQueryBuilder {
  private constructor(private readonly queryBuilder: SelectQueryBuilder<Variant>) {}

  static create(repository: Repository<Variant>): VariantQueryBuilder {
    const queryBuilder = repository
      .createQueryBuilder("variant")
      .leftJoinAndSelect("variant.values", "values")
      .where("variant.deleted_at IS NULL");

    return new VariantQueryBuilder(queryBuilder);
  }

  addSearch(search: string | undefined): this {
    if (search) {
      this.queryBuilder.andWhere("LOWER(variant.name) LIKE LOWER(:search)", {
        search: `%${search}%`,
      });
    }
    return this;
  }

  addPagination(skip: number, take: number): this {
    this.queryBuilder.skip(skip).take(take);
    return this;
  }

  addOrderBy(sort: VariantSortField, order: SortOrder): this {
    this.queryBuilder.orderBy(`variant.${sort}`, order);
    return this;
  }

  build(): SelectQueryBuilder<Variant> {
    return this.queryBuilder;
  }
}