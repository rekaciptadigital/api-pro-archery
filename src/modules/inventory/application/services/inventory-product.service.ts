import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { InventoryProductPricingInformation } from "@/modules/inventory-price/domain/entities/inventory-product-pricing-information.entity";
import { InventoryProductCustomerCategoryPrice } from "@/modules/inventory-price/domain/entities/inventory-product-customer-category-price.entity";
import { InventoryProductByVariantPrice } from "@/modules/inventory-price/domain/entities/inventory-product-by-variant-price.entity";
import { PriceCategory } from "@/modules/price-categories/domain/entities/price-category.entity";
import { Tax } from "@/modules/taxes/domain/entities/tax.entity";
import { InventoryProductVolumeDiscountVariant } from "@/modules/inventory-price/domain/entities/inventory-product-volume-discount-variant.entity";
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
    private readonly dataSource: DataSource,
    @InjectRepository(InventoryProductPricingInformation)
    private readonly inventoryPriceRepository: Repository<InventoryProductPricingInformation>,
    @InjectRepository(InventoryProductCustomerCategoryPrice)
    private readonly customerCategoryPriceRepository: Repository<InventoryProductCustomerCategoryPrice>,
    @InjectRepository(InventoryProductVolumeDiscountVariant)
    private readonly inventoryDiscountVariantPriceRepository: Repository<InventoryProductVolumeDiscountVariant>,
    @InjectRepository(InventoryProductByVariantPrice)
    private readonly variantPriceRepository: Repository<InventoryProductByVariantPrice>,
    @InjectRepository(PriceCategory)
    private readonly priceCategoryRepository: Repository<PriceCategory>,
    @InjectRepository(Tax)
    private readonly taxRepository: Repository<Tax>
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
    historyEntity.sku_vendor = variant.sku_vendor;
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

        // Create a map to store variant IDs
        const variantIdMap = new Map<string, string>();

        for (const variant of createInventoryProductDto.product_by_variant) {
          const variantEntity = variantRepository.create({
            id: randomBytes(12).toString("hex"),
            inventory_product_id: product.id,
            full_product_name: variant.full_product_name,
            sku_product_variant: variant.sku,
            sku_product_unique_code: variant.sku_product_unique_code,
            sku_vendor: variant.sku_vendor,
            status: variant.status ?? true,
          });

          const savedVariant = await variantRepository.save(variantEntity);
          // Store the variant ID in the map using SKU as key
          variantIdMap.set(variant.sku, savedVariant.id);

          // Create history using the helper method
          await this.createVariantHistory(
            savedVariant,
            queryRunner.manager,
            userId
          );
        }

        // Get active customer price categories
        const customerPriceCategories = await this.priceCategoryRepository
          .createQueryBuilder("category")
          .where("category.type = :type AND category.status = true", {
            type: "customer",
          })
          .getMany();

        // Get active custom price categories
        const customPriceCategories = await this.priceCategoryRepository
          .createQueryBuilder("category")
          .where("category.type = :type AND category.status = true", {
            type: "custom",
          })
          .getMany();

        const activeTax = await this.taxRepository.findOne({
          where: { status: true },
        });
        const now = new Date();

        // Create pricing information
        const pricingInfo = await queryRunner.manager.save(
          InventoryProductPricingInformation,
          {
            inventory_product_id: product.id,
            usd_price: 0,
            exchange_rate: 0,
            adjustment_percentage: 0,
            price_hb_real: 0,
            hb_adjustment_price: 0,
            is_manual_product_variant_price_edit: false,
            is_enable_volume_discount: false,
            is_enable_volume_discount_by_product_variant: false,
            created_at: now,
            updated_at: now,
          }
        );

        // Create customer category prices
        for (const category of customerPriceCategories) {
          await queryRunner.manager.save(
            InventoryProductCustomerCategoryPrice,
            {
              inventory_product_pricing_information_id: pricingInfo.id,
              price_category_id: category.id,
              price_category_name: category.name,
              price_category_percentage: category.percentage,
              price_category_set_default: category.set_default,
              pre_tax_price: 0,
              tax_inclusive_price: 0,
              tax_id: activeTax?.id || 0,
              tax_percentage: 0,
              is_custom_tax_inclusive_price: false,
              price_category_custom_percentage: 0,
            }
          );
        }

        // Create variant prices for each variant and price category
        const allPriceCategories = [
          ...customerPriceCategories,
          ...customPriceCategories,
        ];

        // create all price categories product variants
        for (const variant of createInventoryProductDto.product_by_variant) {
          for (const category of allPriceCategories) {
            await queryRunner.manager.save(InventoryProductByVariantPrice, {
              id: randomBytes(12).toString("hex"),
              inventory_product_by_variant_id: variantIdMap.get(variant.sku),
              price_category_id: category.id,
              price: 0,
              status: true,
              usd_price: 0,
              exchange_rate: 0,
              adjustment_percentage: 0,
            });
          }
        }

        // Create volume discount variants
        if (createInventoryProductDto.product_by_variant?.length) {
          for (const variant of createInventoryProductDto.product_by_variant) {
            await queryRunner.manager.save(
              InventoryProductVolumeDiscountVariant,
              {
                id: randomBytes(12).toString("hex"),
                inventory_product_pricing_information_id: pricingInfo.id,
                inventory_product_by_variant_id: variantIdMap.get(variant.sku),
                inventory_product_by_variant_full_product_name:
                  variant.full_product_name,
                status: true,
              }
            );
          }
        }

        // Create variant prices if variants exist
        for (const variant of createInventoryProductDto.product_by_variant) {
          // Create prices for both customer and custom categories
          for (const category of allPriceCategories) {
            const timestamp = Date.now().toString(20);
            const randomStr = randomBytes(12).toString("hex");
            await queryRunner.manager.save(InventoryProductByVariantPrice, {
              id: `${randomStr}${timestamp}`,
              inventory_product_by_variant_id: variantIdMap.get(variant.sku),
              inventory_product_pricing_information_id: pricingInfo.id,
              price_category_id: category.id,
              price: 0,
              status: false,
              created_at: now,
              updated_at: now,
            });
          }

          // Create variant discount prices
          const timestamp = Date.now().toString(20);
          const randomStr = randomBytes(12).toString("hex");
          await queryRunner.manager.save(
            InventoryProductVolumeDiscountVariant,
            {
              id: `${randomStr}${timestamp}`,
              inventory_product_pricing_information_id: pricingInfo.id,
              inventory_product_by_variant_id: variantIdMap.get(variant.sku),
              inventory_product_by_variant_full_product_name:
                variant.full_product_name,
              inventory_product_by_variant_sku: variant.sku,
              status: false,
            }
          );
        }
      } else {
        // If no variants, still create pricing information
        // Get active tax
        const activeTax = await this.taxRepository
          .createQueryBuilder("tax")
          .where("tax.status = true")
          .getOne();
        const now = new Date();
        // Create pricing information
        const pricingInfo = await queryRunner.manager.save(
          InventoryProductPricingInformation,
          {
            inventory_product_id: product.id,
            usd_price: 0,
            exchange_rate: 0,
            adjustment_percentage: 0,
            price_hb_real: 0,
            hb_adjustment_price: 0,
            is_manual_product_variant_price_edit: false,
            is_enable_volume_discount: false,
            is_enable_volume_discount_by_product_variant: false,
            created_at: now,
            updated_at: now,
          }
        );
        // Get active customer price categories
        const customerPriceCategories = await this.priceCategoryRepository
          .createQueryBuilder("category")
          .where("category.type = :type AND category.status = true", {
            type: "customer",
          })
          .getMany();
        // Create customer category prices
        for (const category of customerPriceCategories) {
          await queryRunner.manager.save(
            InventoryProductCustomerCategoryPrice,
            {
              inventory_product_pricing_information_id: pricingInfo.id,
              price_category_id: category.id,
              price_category_name: category.name,
              price_category_percentage: category.percentage,
              price_category_set_default: category.set_default,
              pre_tax_price: 0,
              tax_inclusive_price: 0,
              tax_id: activeTax?.id || 0,
              tax_percentage: activeTax?.percentage || 0,
              is_custom_tax_inclusive_price: false,
              created_at: now,
              updated_at: now,
            }
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
        // Import Not operator
        const { Not } = require("typeorm");

        // Get all existing variants first
        const existingVariant = await queryRunner.manager.findOne(
          InventoryProductSelectedVariant,
          {
            where: {
              inventory_product_id: id,
              variant_id: variants[0].variant_id,
            },
            relations: ["values"],
          }
        );

        // Consolidate all variant values from request
        const allVariantValues = variants.reduce<
          Array<{ variant_value_id: number; variant_value_name: string }>
        >((acc, variant) => {
          if (variant.variant_values) {
            acc.push(...variant.variant_values);
          }
          return acc;
        }, []);

        // Remove duplicates from variant values
        const uniqueVariantValues = Array.from(
          new Map(
            allVariantValues.map((value) => [value.variant_value_id, value])
          ).values()
        );

        if (existingVariant) {
          // Update variant name if needed
          if (existingVariant.variant_name !== variants[0].variant_name) {
            existingVariant.variant_name = variants[0].variant_name;
            await queryRunner.manager.save(
              InventoryProductSelectedVariant,
              existingVariant
            );
          }

          // For each unique variant value, try to insert only if it doesn't exist
          for (const value of uniqueVariantValues) {
            const exists = await queryRunner.manager
              .createQueryBuilder()
              .select("1")
              .from(
                "inventory_product_selected_variant_values",
                "variant_values"
              )
              .where(
                "variant_values.inventory_product_variant_id = :variantId AND variant_values.variant_value_id = :valueId",
                {
                  variantId: existingVariant.id,
                  valueId: value.variant_value_id,
                }
              )
              .getRawOne();

            if (!exists) {
              await queryRunner.manager.save(
                "inventory_product_selected_variant_values",
                {
                  inventory_product_variant_id: existingVariant.id,
                  variant_value_id: value.variant_value_id,
                  variant_value_name: value.variant_value_name,
                }
              );
            }
          }
        } else {
          // Create new variant
          const newVariant = await queryRunner.manager.save(
            InventoryProductSelectedVariant,
            {
              inventory_product_id: id,
              variant_id: variants[0].variant_id,
              variant_name: variants[0].variant_name,
            }
          );

          // Add all variant values for new variant
          if (uniqueVariantValues.length > 0) {
            const variantValues = uniqueVariantValues.map((value) => ({
              inventory_product_variant_id: newVariant.id,
              variant_value_id: value.variant_value_id,
              variant_value_name: value.variant_value_name,
            }));

            await queryRunner.manager.save(
              "inventory_product_selected_variant_values",
              variantValues
            );
          }
        }

        // Delete other variants with same variant_id
        if (existingVariant) {
          await queryRunner.manager.delete(InventoryProductSelectedVariant, {
            inventory_product_id: id,
            variant_id: variants[0].variant_id,
            id: Not(existingVariant.id),
          });
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

        // Process each variant in the request
        for (const variant of product_by_variant) {
          if (variant.id && existingVariantsMap.has(variant.id)) {
            // Update existing variant
            const existingVariant = existingVariantsMap.get(variant.id)!;
            variantRepository.merge(existingVariant, {
              full_product_name: variant.full_product_name,
              sku_product_variant: variant.sku,
              sku_product_unique_code: variant.sku_product_unique_code,
              sku_vendor: variant.sku_vendor,
              status: variant.status ?? existingVariant.status,
            });

            const updatedVariant =
              await variantRepository.save(existingVariant);
            await this.createVariantHistory(
              updatedVariant,
              queryRunner.manager,
              userId
            );
          } else {
            // Create new variant
            const newVariant = variantRepository.create({
              id: randomBytes(12).toString("hex"),
              inventory_product_id: id,
              full_product_name: variant.full_product_name,
              sku_product_variant: variant.sku,
              sku_product_unique_code: variant.sku_product_unique_code,
              sku_vendor: variant.sku_vendor,
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

        // Removed the code that deletes variants not included in the request
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
