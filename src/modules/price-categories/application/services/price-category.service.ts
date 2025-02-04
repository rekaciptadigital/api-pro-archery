import { Injectable, ConflictException } from "@nestjs/common";
import { PriceCategoryRepository } from "../../domain/repositories/price-category.repository";
import {
  BatchPriceCategoryDto,
  SetDefaultPriceCategoryDto,
} from "../dtos/price-category.dto";
import { In, DataSource } from "typeorm";
import { CreatePriceCategoryDto } from "../dtos/price-category.dto";
import { ResponseTransformer } from "@/common/transformers/response.transformer";
import { DomainException } from "@/common/exceptions/domain.exception";
import { HttpStatus } from "@nestjs/common";
import { PriceCategory } from "../../domain/entities/price-category.entity";
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

  async batchProcess(data: BatchPriceCategoryDto[]) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const processedItems = [];

      for (const item of data) {
        if (!item.id) {
          // Check for existing soft-deleted record
          const existingCategory =
            await this.priceCategoryRepository.findByTypeAndNameIncludingDeleted(
              item.type,
              item.name
            );

          if (existingCategory) {
            if (existingCategory.deleted_at) {
              // Restore soft-deleted record using queryRunner
              await queryRunner.manager.restore(PriceCategory, {
                id: existingCategory.id,
              });

              // Update the restored record using queryRunner
              const updated = await queryRunner.manager.save(PriceCategory, {
                id: existingCategory.id,
                type: item.type.toLowerCase(),
                name: item.name,
                formula: item.formula,
                percentage: item.percentage,
                status: item.status ?? true,
              });
              processedItems.push(updated);
            } else {
              throw new ConflictException(
                `Price category with type "${item.type}" and name "${item.name}" already exists`
              );
            }
          } else {
            // Create new record if no existing record found
            const newItem = await queryRunner.manager.save(PriceCategory, {
              type: item.type.toLowerCase(),
              name: item.name,
              formula: item.formula,
              percentage: item.percentage,
              status: item.status ?? true,
            });
            processedItems.push(newItem);
          }
        } else {
          // Handle updates for existing records
          const currentRecord = await this.priceCategoryRepository.findById(
            item.id
          );
          if (!currentRecord) {
            throw new DomainException(
              `Price category with id ${item.id} not found`,
              HttpStatus.NOT_FOUND
            );
          }

          // Check for duplicate type+name only if changing these fields
          if (
            currentRecord.type !== item.type.toLowerCase() ||
            currentRecord.name !== item.name
          ) {
            const existingCategory =
              await this.priceCategoryRepository.findByTypeAndName(
                item.type,
                item.name
              );
            if (existingCategory && existingCategory.id !== item.id) {
              throw new ConflictException(
                `Cannot update: type "${item.type}" and name "${item.name}" already used by another record`
              );
            }
          }

          const updated = await this.priceCategoryRepository.save({
            ...currentRecord,
            type: item.type.toLowerCase(),
            name: item.name,
            formula: item.formula,
            percentage: item.percentage,
            status: item.status,
          });
          processedItems.push(updated);
        }
      }

      await queryRunner.commitTransaction();
      return this.responseTransformer.transform(processedItems);
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

  async setDefault(id: number, setDefaultDto: SetDefaultPriceCategoryDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const category = await this.priceCategoryRepository.findById(id);
      if (!category) {
        throw new DomainException(
          "Price category not found",
          HttpStatus.NOT_FOUND
        );
      }

      // Check if trying to set to false when this is the only default record
      if (!setDefaultDto.set_default) {
        const defaultCount = await queryRunner.manager.count(PriceCategory, {
          where: { set_default: true },
        });

        if (defaultCount <= 1) {
          throw new DomainException(
            "Cannot remove default status: At least one price category must be set as default",
            HttpStatus.BAD_REQUEST
          );
        }
      }

      if (setDefaultDto.set_default) {
        // Set all price categories set_default to false first
        await queryRunner.manager
          .createQueryBuilder()
          .update(PriceCategory)
          .set({ set_default: false })
          .execute();
      }

      // Update the selected price category
      await queryRunner.manager.save(PriceCategory, {
        ...category,
        set_default: setDefaultDto.set_default,
      });

      await queryRunner.commitTransaction();

      return this.responseTransformer.transform({
        message: "Price category default status updated successfully",
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
