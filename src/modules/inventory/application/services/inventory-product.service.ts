import { Injectable, NotFoundException } from "@nestjs/common";
import { InventoryProductRepository } from "../../domain/repositories/inventory-product.repository";
import { CreateInventoryProductDto } from "../dtos/create-inventory-product.dto";
import { UpdateInventoryProductDto } from "../dtos/update-inventory-product.dto";
import { InventoryProductQueryDto } from "../dtos/inventory-product-query.dto";
import { PaginationHelper } from "@/common/pagination/helpers/pagination.helper";
import { ResponseTransformer } from "@/common/transformers/response.transformer";
import { DomainException } from "@/common/exceptions/domain.exception";
import { HttpStatus } from "@nestjs/common";
import { ProductSlug } from "../../domain/value-objects/product-slug.value-object";
import { SKU } from "../../domain/value-objects/sku.value-object";
import { DataSource, DeepPartial, IsNull, EntityManager } from "typeorm";
import { InventoryProduct } from "../../domain/entities/inventory-product.entity";
import { InventoryProductSelectedVariant } from "../../domain/entities/inventory-product-selected-variant.entity";
import { randomBytes } from "crypto";
import { InventoryProductByVariant } from "../../domain/entities/inventory-product-by-variant.entity";
import { InventoryProductByVariantHistory } from "../../domain/entities/inventory-product-by-variant-history.entity";

@Injectable()
export class InventoryProductService {
  constructor(
    private readonly inventoryProductRepository: InventoryProductRepository,
    private readonly paginationHelper: PaginationHelper,
    private readonly responseTransformer: ResponseTransformer,
    private readonly dataSource: DataSource
  ) {}

  // Add private helper method for creating history
  private async createVariantHistory(
    variant: InventoryProductByVariant,
    manager: EntityManager,
    userId: number // Remove null possibility
  ): Promise<void> {
    const historyEntity = new InventoryProductByVariantHistory();
    historyEntity.id = randomBytes(12).toString("hex");
    historyEntity.inventory_product_by_variant_id = variant.id;
    historyEntity.inventory_product_id = variant.inventory_product_id;
    historyEntity.full_product_name = variant.full_product_name;
    historyEntity.sku_product_variant = variant.sku_product_variant;
    historyEntity.sku_product_unique_code = variant.sku_product_unique_code;
    historyEntity.status = variant.status;
    historyEntity.user_id = userId; // Remove null possibility

    await manager.save(InventoryProductByVariantHistory, historyEntity);
  }

  async create(
    createInventoryProductDto: CreateInventoryProductDto,
    userId: number
  ) {
    // Validate SKU format
    if (!SKU.isValid(createInventoryProductDto.sku)) {
      throw new DomainException("Invalid SKU format");
    }

    // Check for existing SKU and unique_code separately
    const existingBySku =
      await this.inventoryProductRepository.findBySkuOrUniqueCode(
        createInventoryProductDto.sku,
        undefined
      );

    if (existingBySku) {
      throw new DomainException("SKU already exists", HttpStatus.CONFLICT);
    }

    if (createInventoryProductDto.unique_code) {
      const existingByUniqueCode =
        await this.inventoryProductRepository.findBySkuOrUniqueCode(
          undefined,
          createInventoryProductDto.unique_code
        );

      // Allow same unique_code if SKU is different
      if (
        existingByUniqueCode &&
        existingByUniqueCode.sku === createInventoryProductDto.sku
      ) {
        throw new DomainException(
          "Combination of SKU and unique code already exists",
          HttpStatus.CONFLICT
        );
      }
    }

    // Use slug from request body instead of generating it
    const slug = createInventoryProductDto.slug;

    // Create product with relationships in a transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const productData: DeepPartial<InventoryProduct> = {
        ...createInventoryProductDto,
        categories: [],
        variants: [],
        product_by_variant: [],
      };

      // Slug sudah termasuk dalam createInventoryProductDto, tidak perlu di-assign ulang

      const product = await queryRunner.manager.save(
        InventoryProduct,
        productData
      );

      // Save categories
      if (createInventoryProductDto.categories?.length) {
        const categories = createInventoryProductDto.categories.map(
          (category) => ({
            inventory_product_id: product.id,
            ...category,
          })
        );
        await queryRunner.manager.save(
          "inventory_product_categories",
          categories
        );
      }

      // Save variants and their values
      if (createInventoryProductDto.variants?.length) {
        for (const variant of createInventoryProductDto.variants) {
          const variantData: DeepPartial<InventoryProductSelectedVariant> = {
            inventory_product_id: product.id,
            variant_id: variant.variant_id,
            variant_name: variant.variant_name,
            values: [],
          };

          const savedVariant = await queryRunner.manager.save(
            InventoryProductSelectedVariant,
            variantData
          );

          if (variant.variant_values?.length) {
            const variantValues = variant.variant_values.map((value) => ({
              inventory_product_variant_id: savedVariant.id,
              ...value,
            }));
            await queryRunner.manager.save(
              "inventory_product_selected_variant_values",
              variantValues
            );
          }
        }
      }

      // Save product variants with proper number conversion
      if (createInventoryProductDto.product_by_variant?.length) {
        const variantRepository = queryRunner.manager.getRepository(
          InventoryProductByVariant
        );

        for (const variant of createInventoryProductDto.product_by_variant) {
          const variantEntity = variantRepository.create({
            id: randomBytes(12).toString("hex"),
            inventory_product_id: product.id,
            full_product_name: variant.full_product_name,
            sku_product_variant: variant.sku,
            sku_product_unique_code: variant.sku_product_unique_code,
            status: variant.status ?? true,
          });

          const savedVariant = await variantRepository.save(variantEntity);
          // Create history using the helper method
          await this.createVariantHistory(
            savedVariant,
            queryRunner.manager,
            userId
          );
        }
      }

      await queryRunner.commitTransaction();

      const createdProduct =
        await this.inventoryProductRepository.findOneWithRelations(product.id);
      if (!createdProduct) {
        throw new NotFoundException("Created product not found");
      }
      return this.responseTransformer.transform(createdProduct);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(query: InventoryProductQueryDto) {
    const queryBuilder = this.inventoryProductRepository
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.product_by_variant", "variants");

    if (query.status !== undefined) {
      queryBuilder.andWhere("variants.status = :status", {
        status: query.status,
      });
    }

    const { skip, take } = this.paginationHelper.getSkipTake(
      query.page,
      query.limit
    );

    const [products, total] =
      await this.inventoryProductRepository.findProducts(
        skip,
        take,
        query.sort,
        query.order,
        query.search
      );

    const paginationData = this.paginationHelper.generatePaginationData({
      serviceName: "inventory",
      totalItems: total,
      page: query.page,
      limit: query.limit,
      customParams: query.toCustomParams(),
    });

    return this.responseTransformer.transformPaginated(
      products,
      total,
      query.page || 1,
      query.limit || 10,
      paginationData.links
    );
  }

  async findOne(id: number) {
    const product =
      await this.inventoryProductRepository.findOneWithRelations(id);
    if (!product) {
      throw new NotFoundException("Inventory product not found");
    }
    return this.responseTransformer.transform(product);
  }

  async update(
    id: number,
    updateInventoryProductDto: UpdateInventoryProductDto,
    userId: number
  ) {
    const product = await this.inventoryProductRepository.findById(id);
    if (!product) {
      throw new NotFoundException("Inventory product not found");
    }

    // Add SKU format validation
    if (
      updateInventoryProductDto.sku &&
      !SKU.isValid(updateInventoryProductDto.sku)
    ) {
      throw new DomainException("Invalid SKU format");
    }

    // Check for SKU conflicts
    if (updateInventoryProductDto.sku) {
      const existingBySku =
        await this.inventoryProductRepository.findBySkuOrUniqueCode(
          updateInventoryProductDto.sku,
          undefined
        );

      if (existingBySku && existingBySku.id !== id) {
        throw new DomainException("SKU already exists", HttpStatus.CONFLICT);
      }
    }

    // Check for unique_code conflicts only if it would result in duplicate SKU
    if (updateInventoryProductDto.unique_code) {
      const existingByUniqueCode =
        await this.inventoryProductRepository.findBySkuOrUniqueCode(
          undefined,
          updateInventoryProductDto.unique_code
        );

      if (existingByUniqueCode && existingByUniqueCode.id !== id) {
        // Only throw conflict if the SKU would be the same
        const newSku = updateInventoryProductDto.sku || product.sku;
        if (existingByUniqueCode.sku === newSku) {
          throw new DomainException(
            "Combination of SKU and unique code already exists",
            HttpStatus.CONFLICT
          );
        }
      }
    }

    // Update product and relationships in a transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update main product
      if (updateInventoryProductDto.product_name) {
        updateInventoryProductDto.slug = ProductSlug.create(
          updateInventoryProductDto.product_name
        ).getValue();
      }

      // Separate related data from main entity data
      const { categories, variants, product_by_variant, ...mainProductData } =
        updateInventoryProductDto;

      const updateData: DeepPartial<InventoryProduct> = {
        ...mainProductData,
      };

      await queryRunner.manager.update(InventoryProduct, id, updateData);

      // Handle relationships separately
      if (categories) {
        await queryRunner.manager.delete("inventory_product_categories", {
          inventory_product_id: id,
        });
        const categoryData = categories.map((category) => ({
          inventory_product_id: id,
          ...category,
        }));
        await queryRunner.manager.save(
          "inventory_product_categories",
          categoryData
        );
      }

      if (variants) {
        // Delete existing variants and their values
        const existingVariants = await queryRunner.manager.find(
          InventoryProductSelectedVariant,
          {
            where: { inventory_product_id: id },
          }
        );

        for (const variant of existingVariants) {
          await queryRunner.manager.delete(
            "inventory_product_selected_variant_values",
            {
              inventory_product_variant_id: variant.id,
            }
          );
        }
        await queryRunner.manager.delete(InventoryProductSelectedVariant, {
          inventory_product_id: id,
        });

        // Create new variants and values
        for (const variant of variants) {
          // Changed from updateInventoryProductDto.variants
          const variantData: DeepPartial<InventoryProductSelectedVariant> = {
            inventory_product_id: id,
            variant_id: variant.variant_id,
            variant_name: variant.variant_name,
            values: [],
          };

          const savedVariant = await queryRunner.manager.save(
            InventoryProductSelectedVariant,
            variantData
          );

          if (variant.variant_values?.length) {
            const variantValues = variant.variant_values.map((value) => ({
              inventory_product_variant_id: savedVariant.id,
              ...value,
            }));
            await queryRunner.manager.save(
              "inventory_product_selected_variant_values",
              variantValues
            );
          }
        }
      }

      if (product_by_variant) {
        const variantRepository = queryRunner.manager.getRepository(
          InventoryProductByVariant
        );

        const existingVariants = await variantRepository.find({
          where: {
            inventory_product_id: id,
            deleted_at: IsNull(),
          },
        });

        const existingVariantsMap = new Map(
          existingVariants.map((variant) => [variant.id, variant])
        );

        // Process each variant
        for (const variant of product_by_variant) {
          if (variant.id && existingVariantsMap.has(variant.id)) {
            // Update existing variant
            const existingVariant = existingVariantsMap.get(variant.id)!;
            variantRepository.merge(existingVariant, {
              full_product_name: variant.full_product_name,
              sku_product_variant: variant.sku,
              sku_product_unique_code: variant.sku_product_unique_code,
              status: variant.status ?? true,
            });

            const updatedVariant =
              await variantRepository.save(existingVariant);
            await this.createVariantHistory(
              updatedVariant,
              queryRunner.manager,
              userId
            );
            existingVariantsMap.delete(variant.id);
          } else {
            // Create new variant
            const newVariant = variantRepository.create({
              id: randomBytes(12).toString("hex"),
              inventory_product_id: id,
              full_product_name: variant.full_product_name,
              sku_product_variant: variant.sku,
              sku_product_unique_code: variant.sku_product_unique_code,
              status: variant.status ?? true,
            });

            const savedVariant = await variantRepository.save(newVariant);
            await this.createVariantHistory(
              savedVariant,
              queryRunner.manager,
              userId
            );
          }
        }

        // Soft delete variants that weren't included in the update
        const variantsToDelete = Array.from(existingVariantsMap.values());
        if (variantsToDelete.length > 0) {
          await variantRepository.softRemove(variantsToDelete);
        }
      }

      await queryRunner.commitTransaction();

      const updatedProduct =
        await this.inventoryProductRepository.findOneWithRelations(id);
      if (!updatedProduct) {
        throw new NotFoundException("Updated product not found");
      }
      return this.responseTransformer.transform(updatedProduct);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: number) {
    const product = await this.inventoryProductRepository.findById(id);
    if (!product) {
      throw new NotFoundException("Inventory product not found");
    }

    await this.inventoryProductRepository.softDelete(id);
    return this.responseTransformer.transform({
      message: "Inventory product deleted successfully",
    });
  }
}
