import { Injectable } from "@nestjs/common";
import { PriceCategoryRepository } from "../../domain/repositories/price-category.repository";
import {
  CreatePriceCategoryDto,
  BatchPriceCategoryDto,
} from "../dtos/price-category.dto";
import { ResponseTransformer } from "@/common/transformers/response.transformer";
import { DomainException } from "@/common/exceptions/domain.exception";
import { HttpStatus } from "@nestjs/common";
import { DataSource } from "typeorm";
import { GroupedPriceCategories } from "../../domain/interfaces/grouped-price-categories.interface";

@Injectable()
export class PriceCategoryService {
  constructor(
    private readonly priceCategoryRepository: PriceCategoryRepository,
    private readonly responseTransformer: ResponseTransformer,
    private readonly dataSource: DataSource
  ) {}

  async findAll(search?: string) {
    const groupedCategories =
      await this.priceCategoryRepository.findAllGroupedByType(search);

    // Transform the grouped data into an array format
    const result = Object.entries(groupedCategories).map(
      ([type, categories]) => ({
        type,
        categories: categories.map((category) => ({
          id: category.id,
          name: category.name,
          formula: category.formula,
          percentage: category.percentage,
          status: category.status,
          created_at: category.created_at,
          updated_at: category.updated_at,
        })),
      })
    );

    return this.responseTransformer.transform(result);
  }

  async batchProcess(items: BatchPriceCategoryDto[]) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const created: any[] = [];
      const updated: any[] = [];

      for (const item of items) {
        // Normalize type to lowercase and process percentage
        const processedItem = {
          ...item,
          type: item.type.toLowerCase(),
          percentage: Number(item.percentage),
        };

        if (item.id) {
          // Update existing
          const existing = await this.priceCategoryRepository.findById(item.id);
          if (!existing) {
            throw new DomainException(
              `Price category with ID ${item.id} not found`,
              HttpStatus.NOT_FOUND
            );
          }

          // Check unique constraint for type-name combination
          const duplicate =
            await this.priceCategoryRepository.findByTypeAndName(
              item.type,
              item.name
            );
          if (duplicate && duplicate.id !== item.id) {
            throw new DomainException(
              `Price category with type "${item.type}" and name "${item.name}" already exists`,
              HttpStatus.CONFLICT
            );
          }

          const updatedItem = await queryRunner.manager.save(
            "price_categories",
            {
              ...existing,
              ...processedItem,
            }
          );
          updated.push(updatedItem);
        } else {
          // Create new
          const duplicate =
            await this.priceCategoryRepository.findByTypeAndName(
              processedItem.type,
              item.name
            );
          if (duplicate) {
            throw new DomainException(
              `Price category with type "${item.type}" and name "${item.name}" already exists`,
              HttpStatus.CONFLICT
            );
          }

          const createdItem = await queryRunner.manager.save(
            "price_categories",
            processedItem
          );
          created.push(createdItem);
        }
      }

      await queryRunner.commitTransaction();

      return this.responseTransformer.transform({
        created,
        updated,
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: number) {
    const category = await this.priceCategoryRepository.findById(id);
    if (!category) {
      throw new DomainException(
        "Price category not found",
        HttpStatus.NOT_FOUND
      );
    }

    await this.priceCategoryRepository.softDelete(id);
    return this.responseTransformer.transform({
      message: "Price category deleted successfully",
    });
  }
}
