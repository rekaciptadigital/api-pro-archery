import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, IsNull } from "typeorm";
import { ProductCategory } from "../entities/product-category.entity";
import { BaseRepository } from "@/common/repositories/base.repository";
import {
  ProductCategorySortField,
  SortOrder,
} from "../../application/dtos/product-category-query.dto";

@Injectable()
export class ProductCategoryRepository extends BaseRepository<ProductCategory> {
  constructor(
    @InjectRepository(ProductCategory)
    private readonly productCategoryRepository: Repository<ProductCategory>
  ) {
    super(productCategoryRepository);
  }

  async findByCode(
    code: string,
    excludeId?: number
  ): Promise<ProductCategory | null> {
    const query = this.productCategoryRepository
      .createQueryBuilder("category")
      .where("LOWER(category.code) = LOWER(:code)", { code })
      .andWhere("category.deleted_at IS NULL");

    if (excludeId) {
      query.andWhere("category.id != :id", { id: excludeId });
    }

    return query.getOne();
  }

  async findByCodeWithDeleted(code: string): Promise<ProductCategory | null> {
    return this.productCategoryRepository.findOne({
      where: { code },
      withDeleted: true,
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
    const query = this.productCategoryRepository
      .createQueryBuilder("category")
      .where("category.deleted_at IS NULL")
      .andWhere("category.parent_id IS NULL");

    if (search) {
      query.andWhere("LOWER(category.name) LIKE LOWER(:search)", {
        search: `%${search}%`,
      });
    }

    // Modified status filter to handle undefined/null cases
    if (status !== undefined && status !== null) {
      query.andWhere("category.status = :status", { status });
    }

    // Get all categories without parent_id filter
    query.orderBy(`category.${sort}`, order).skip(skip).take(take);

    const [categories, total] = await query.getManyAndCount();

    // Load children for each category
    const categoriesWithChildren = await Promise.all(
      categories.map(async (category) => {
        return this.loadCategoryTreeRecursive(category);
      })
    );

    return [categoriesWithChildren, total];
  }

  private async loadCategoryTreeRecursive(
    category: ProductCategory
  ): Promise<ProductCategory> {
    // Load immediate children
    const children = await this.productCategoryRepository.find({
      where: {
        parent_id: category.id,
        deleted_at: IsNull(),
      },
      order: {
        created_at: "DESC",
      },
    });

    // Recursively load children for each child
    const childrenWithSubChildren = await Promise.all(
      children.map(async (child) => {
        return this.loadCategoryTreeRecursive(child);
      })
    );

    // Assign processed children back to category
    category.children = childrenWithSubChildren;

    return category;
  }

  async findOneWithHierarchy(id: number): Promise<ProductCategory | null> {
    const query = this.productCategoryRepository
      .createQueryBuilder("category")
      .where("category.id = :id", { id })
      .andWhere("category.deleted_at IS NULL");

    // Load children for current category
    query.leftJoinAndSelect(
      "category.children",
      "children",
      "children.deleted_at IS NULL"
    );

    const category = await query.getOne();
    if (!category) {
      return null;
    }

    // If it has parent_id, build the hierarchy
    if (category.parent_id) {
      const parent = await this.buildParentHierarchy(category.parent_id);
      if (parent) {
        category.hierarchy = parent;
      }
    }

    return category;
  }

  private async buildParentHierarchy(
    parentId: number
  ): Promise<ProductCategory | null> {
    const parent = await this.productCategoryRepository.findOne({
      where: {
        id: parentId,
        deleted_at: IsNull(),
      },
      relations: ["children"],
    });

    if (!parent) return null;

    // Load next parent level if exists
    if (parent.parent_id) {
      const grandParent = await this.buildParentHierarchy(parent.parent_id);
      if (grandParent) {
        // Remove children from intermediate parents to avoid circular references
        parent.children = [];
        parent.hierarchy = grandParent;
      }
    }

    return parent;
  }

  async findWithDeleted(id: number): Promise<ProductCategory | null> {
    return this.repository.findOne({
      where: { id } as any,
      withDeleted: true,
    });
  }

  async restore(id: number): Promise<ProductCategory | null> {
    await this.repository.restore(id);
    return this.findById(id);
  }

  async findById(id: number): Promise<ProductCategory | null> {
    return this.productCategoryRepository.findOne({
      where: {
        id,
        deleted_at: IsNull(),
      },
    });
  }

  async findLastCategory(): Promise<ProductCategory | null> {
    return this.productCategoryRepository
      .createQueryBuilder("category")
      .orderBy("category.code", "DESC")
      .getOne();
  }
}
