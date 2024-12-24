import { SelectQueryBuilder, Repository } from "typeorm";
import { Brand } from "../entities/brand.entity";
import { ILike } from "typeorm";

export class BrandQueryBuilder {
  private constructor(
    private readonly queryBuilder: SelectQueryBuilder<Brand>
  ) {}

  static create(repository: Repository<Brand>): BrandQueryBuilder {
    const queryBuilder = repository
      .createQueryBuilder("brand")
      .where("brand.deleted_at IS NULL");

    return new BrandQueryBuilder(queryBuilder);
  }

  addSearch(search: string | undefined): this {
    if (search) {
      this.queryBuilder.andWhere(
        "(LOWER(brand.name) LIKE LOWER(:search) OR LOWER(brand.code) LIKE LOWER(:search))",
        { search: `%${search}%` }
      );
    }
    return this;
  }

  addPagination(skip: number, take: number): this {
    this.queryBuilder.skip(skip).take(take);
    return this;
  }

  addOrderBy(sort: string, order: "ASC" | "DESC"): this {
    this.queryBuilder.orderBy(`brand.${sort}`, order);
    return this;
  }

  build(): SelectQueryBuilder<Brand> {
    return this.queryBuilder;
  }
}