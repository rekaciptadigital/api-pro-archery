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
import { DataSource, DeepPartial } from "typeorm";
import { InventoryProduct } from "../../domain/entities/inventory-product.entity";
import { InventoryProductSelectedVariant } from "../../domain/entities/inventory-product-selected-variant.entity";
import { randomBytes } from "crypto";

@Injectable()
export class InventoryProductService {
  constructor(
    private readonly inventoryProductRepository: InventoryProductRepository,
    private readonly paginationHelper: PaginationHelper,
    private readonly responseTransformer: ResponseTransformer,
    private readonly dataSource: DataSource
  ) {}

  async create(createInventoryProductDto: CreateInventoryProductDto) {
    // Validate SKU format
    if (!SKU.isValid(createInventoryProductDto.sku)) {
      throw new DomainException("Invalid SKU format");
    }

    // Check for existing SKU or unique_code
    const existingProduct =
      await this.inventoryProductRepository.findBySkuOrUniqueCode(
        createInventoryProductDto.sku,
        createInventoryProductDto.unique_code
      );

    if (existingProduct) {
      throw new DomainException(
        "SKU or unique code already exists",
        HttpStatus.CONFLICT
      );
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
        const productVariants =
          createInventoryProductDto.product_by_variant.map((variant) => ({
            id: randomBytes(12).toString("hex"),
            inventory_product_id: product.id,
            full_product_name: variant.full_product_name,
            sku_product_variant: variant.sku, // Map from DTO's sku to entity's sku_product_variant
            sku_product_unique_code: variant.sku_product_unique_code,
            deleted_at: null,
            status: variant.status ?? true, // Set default to true if not provided
          }));
        await queryRunner.manager.save(
          "inventory_product_by_variants",
          productVariants
        );
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
    updateInventoryProductDto: UpdateInventoryProductDto
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

    // Check for SKU/unique_code conflicts with other active products
    if (
      updateInventoryProductDto.sku ||
      updateInventoryProductDto.unique_code
    ) {
      // Cek apakah ada produk lain (id berbeda) yang menggunakan SKU/unique_code yang sama
      const existingProducts =
        await this.inventoryProductRepository.findBySkuOrUniqueCodeExcludingId(
          updateInventoryProductDto.sku || product.sku,
          updateInventoryProductDto.unique_code,
          id
        );

      if (existingProducts && existingProducts.length > 0) {
        throw new DomainException(
          "SKU or unique code already exists in another product",
          HttpStatus.CONFLICT
        );
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
        await queryRunner.manager.delete("inventory_product_by_variants", {
          inventory_product_id: id,
        });
        const productVariantsData = product_by_variant.map((variant) => ({
          id: randomBytes(12).toString("hex"),
          inventory_product_id: id,
          full_product_name: variant.full_product_name,
          sku_product_variant: variant.sku, // Map from DTO's sku to entity's sku_product_variant
          sku_product_unique_code: Number(variant.sku_product_unique_code), // Ensure it's a number
          deleted_at: null,
          status: variant.status ?? true, // Maintain existing status if not provided
        }));
        await queryRunner.manager.save(
          "inventory_product_by_variants",
          productVariantsData
        );
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
