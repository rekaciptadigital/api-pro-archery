import { PaginationHelper } from "@/common/pagination/helpers/pagination.helper";
import { ResponseTransformer } from "@/common/transformers/response.transformer";
import { InventoryProductByVariantPrice } from "@/modules/inventory-price/domain/entities/inventory-product-by-variant-price.entity";
import { InventoryProductCustomerCategoryPrice } from "@/modules/inventory-price/domain/entities/inventory-product-customer-category-price.entity";
import { InventoryProductMarketplaceCategoryPrice } from "@/modules/inventory-price/domain/entities/inventory-product-marketplace-category-price.entity";
import { InventoryProduct } from "@/modules/inventory/domain/entities/inventory-product.entity";
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { randomBytes } from "crypto";
import { DataSource, Not } from "typeorm";
import { UpdateInventoryPriceDto } from "../../domain/dtos/update-inventory-price.dto";
import { InventoryProductPricingInformationHistory } from "../../domain/entities/inventory-product-pricing-information-history.entity";
import { IInventoryProductCustomerCategoryPrice } from "../../domain/interfaces/inventory-price.interface";
import { InventoryPriceRepository } from "../../domain/repositories/inventory-price.repository";

import { IsNull } from "typeorm";
import { InventoryProductGlobalDiscountHistory } from "../../domain/entities/inventory-product-global-discount-history.entity";
import { InventoryProductGlobalDiscountPriceCategory } from "../../domain/entities/inventory-product-global-discount-price-category.entity";
import { InventoryProductGlobalDiscount } from "../../domain/entities/inventory-product-global-discount.entity";
import { InventoryProductVolumeDiscountVariantPriceCategory } from "../../domain/entities/inventory-product-volume-discount-variant-price-category.entity";
import { InventoryProductVolumeDiscountVariantQty } from "../../domain/entities/inventory-product-volume-discount-variant-qty.entity";
import { InventoryProductVolumeDiscountVariant } from "../../domain/entities/inventory-product-volume-discount-variant.entity";
import { InventoryProductVolumeDiscountVariantHistory } from "../../domain/entities/inventory-product-volume-discount-variant-history.entity";
import { InventoryProductByVariant } from "@/modules/inventory/domain/entities/inventory-product-by-variant.entity";
import { InventoryProductPricingInformation } from "../../domain/entities/inventory-product-pricing-information.entity";
import { InventoryProductCustomerCategoryPriceHistory } from "../../domain/entities/inventory-product-customer-category-price-history.entity";
import { InventoryProductByVariantPriceHistory } from "../../domain/entities/inventory-product-by-variant-price-history.entity";
import { InventoryProductGlobalDiscountPriceCategoryHistory } from "../../domain/entities/inventory-product-global-discount-price-category-history.entity";
import { InventoryProductVolumeDiscountVariantQtyHis } from "../../domain/entities/inventory-product-volume-discount-variant-qty-his.entity";
import { InventoryProductVolumeDiscountVariantPriceCatHis } from "../../domain/entities/inventory-product-volume-discount-variant-price-cat-his.entity";

@Injectable()
export class InventoryPriceService {
  constructor(
    private readonly inventoryPriceRepository: InventoryPriceRepository,
    private readonly paginationHelper: PaginationHelper,
    private readonly responseTransformer: ResponseTransformer,
    private readonly dataSource: DataSource
  ) {}

  private async getProductVariantPrices(productId: number) {
    const queryBuilder = this.dataSource
      .createQueryBuilder()
      .select([
        "v.id as variant_id",
        "v.full_product_name as variant_name",
        "v.sku_product_variant as sku_product_variant",
        "v.status",
        "vp.price_category_id",
        "vp.price",
        "vp.usd_price as usd_price",
        "vp.exchange_rate as exchange_rate",
        "vp.adjustment_percentage as adjustment_percentage",
        "vp.status as variant_price_status",
        "pc.name as price_category_name",
        "pc.type as price_category_type",
        "pc.percentage as price_category_percentage",
        "pc.set_default as price_category_set_default",
        "v.created_at",
        "v.updated_at",
      ])
      .from("inventory_product_by_variants", "v")
      .leftJoin(
        "inventory_product_by_variant_prices",
        "vp",
        "vp.inventory_product_by_variant_id = v.id"
      )
      .leftJoin("price_categories", "pc", "pc.id = vp.price_category_id")
      .where("v.inventory_product_id = :productId", { productId })
      .andWhere("v.deleted_at IS NULL");

    const results = await queryBuilder.getRawMany();

    // Return empty array if no variants exist
    if (!results || results.length === 0) {
      return [];
    }
    // Group the results by variant
    const variantMap = new Map();
    results.forEach((row) => {
      if (!variantMap.has(row.variant_id)) {
        variantMap.set(row.variant_id, {
          variant_id: row.variant_id,
          variant_name: row.variant_name,
          sku_product_variant: row.sku_product_variant,
          status: row.variant_price_status,
          price_categories: [],
          usd_price: Number(row.usd_price),
          exchange_rate: Number(row.exchange_rate),
          adjustment_percentage: Number(row.adjustment_percentage),
          created_at: row.created_at,
          updated_at: row.updated_at,
        });
      }

      if (row.vp_price_category_id) {
        const variant = variantMap.get(row.variant_id);
        variant.price_categories.push({
          id: Number(row.vp_price_category_id),
          price: Number(row.price),
          price_category_name: row.price_category_name,
          percentage: Number(row.price_category_percentage),
          type: row.price_category_type,
          set_default: row.price_category_set_default,
        });
      }
    });

    // Convert map to array and sort by variant name
    return Array.from(variantMap.values()).sort((a, b) =>
      a.variant_name.localeCompare(b.variant_name)
    );
  }

  async findByProductId(productId: number) {
    const pricing =
      await this.inventoryPriceRepository.findByProductIdWithDetails(productId);

    if (!pricing) {
      throw new NotFoundException(
        `Pricing information not found for product ${productId}`
      );
    }

    const formattedResponse = {
      id: pricing.id,
      inventory_product_id: pricing.inventory_product_id,
      usd_price: Number(pricing.usd_price),
      exchange_rate: Number(pricing.exchange_rate),
      adjustment_percentage: Number(pricing.adjustment_percentage),
      price_hb_real: Number(pricing.price_hb_real),
      hb_adjustment_price: Number(pricing.hb_adjustment_price),
      is_manual_product_variant_price_edit:
        pricing.is_manual_product_variant_price_edit,
      is_enable_volume_discount: pricing.is_enable_volume_discount,
      is_enable_volume_discount_by_product_variant:
        pricing.is_enable_volume_discount_by_product_variant,
      customer_category_prices:
        pricing.customer_category_prices?.map(
          (price: IInventoryProductCustomerCategoryPrice) => ({
            id: price.id,
            price_category_id: Number(price.price_category_id),
            price_category_name: price.price_category_name,
            formula: `Formula: HB Naik + ${Number(price.price_category_percentage).toFixed(1)}% markup`,
            percentage: Number(price.price_category_percentage),
            set_default: price.price_category_set_default,
            pre_tax_price: Number(price.pre_tax_price),
            tax_inclusive_price: Number(price.tax_inclusive_price),
            tax_id: Number(price.tax_id),
            tax_percentage: Number(price.tax_percentage),
            is_custom_tax_inclusive_price: price.is_custom_tax_inclusive_price,
            price_category_custom_percentage: Number(
              price.price_category_custom_percentage
            ),
            created_at: price.created_at,
            updated_at: price.updated_at,
          })
        ) || [],
      marketplace_category_prices:
        pricing.marketplace_category_prices?.map((price) => ({
          id: price.id,
          price_category_id: Number(price.price_category_id),
          price_category_name: price.price_category_name,
          price_category_percentage: Number(price.price_category_percentage),
          price_category_set_default: price.price_category_set_default,
          price: Number(price.price),
          price_category_custom_percentage: Number(
            price.price_category_custom_percentage
          ),
          is_custom_price_category: price.is_custom_price_category,
          created_at: price.created_at,
          updated_at: price.updated_at,
        })) || [],
      product_variant_prices: await this.getProductVariantPrices(
        pricing.inventory_product_id
      ),
      global_volume_discounts:
        pricing.global_discounts?.map((discount) => ({
          id: discount.id,
          quantity: Number(discount.quantity),
          discount_percentage: Number(discount.discount_percentage),
          global_volume_discount_price_categories:
            discount.price_categories?.map((pc) => ({
              id: pc.id,
              price_category_id: Number(pc.price_category_id),
              price_category_name: pc.price_category_name,
              price_category_type: pc.price_category_type,
              price_category_percentage: Number(pc.price_category_percentage),
              price_category_set_default: pc.price_category_set_default,
              price: Number(pc.price),
            })) || [],
          created_at: discount.created_at,
          updated_at: discount.updated_at,
        })) || [],
      variant_volume_discounts:
        pricing.volume_discount_variants?.map((variant) => ({
          id: variant.id,
          variant_id: variant.inventory_product_by_variant_id,
          variant_name: variant.inventory_product_by_variant_full_product_name,
          variant_sku: variant.inventory_product_by_variant_sku,
          inventory_product_volume_discount_variant_quantities:
            variant.quantities?.map((qty) => ({
              id: qty.id,
              quantity: Number(qty.quantity),
              discount_percentage: Number(qty.discount_percentage),
              inventory_product_volume_discount_variant_price_categories:
                qty.price_categories?.map((pc) => ({
                  id: pc.id,
                  price_category_id: Number(pc.price_category_id),
                  price_category_name: pc.price_category_name,
                  price_category_type: pc.price_category_type,
                  price_category_percentage: Number(
                    pc.price_category_percentage
                  ),
                  price_category_set_default: pc.price_category_set_default,
                  price: Number(pc.price),
                })) || [],
            })) || [],
          status: variant.status,
          created_at: variant.created_at,
          updated_at: variant.updated_at,
        })) || [],
    };

    return this.responseTransformer.transform(formattedResponse);
  }

  private async validateInventoryProduct(productId: number) {
    const inventoryProduct = await this.dataSource
      .getRepository(InventoryProduct)
      .findOne({ where: { id: productId } });

    if (!inventoryProduct) {
      throw new NotFoundException(
        `Inventory product with id ${productId} not found`
      );
    }

    return inventoryProduct;
  }

  private async validateGlobalVolumeDiscounts(
    pricingId: number,
    globalDiscounts: any[]
  ) {
    if (!globalDiscounts?.length) return;

    const existingDiscounts = await this.dataSource
      .getRepository("inventory_product_global_discounts")
      .find({ where: { inventory_product_pricing_information_id: pricingId } });

    for (const discount of globalDiscounts) {
      // Validate required fields
      if (discount.quantity === undefined || discount.quantity <= 0) {
        throw new BadRequestException(
          `Invalid quantity value for global volume discount`
        );
      }

      if (
        discount.discount_percentage === undefined ||
        discount.discount_percentage <= 0
      ) {
        throw new BadRequestException(
          `Invalid discount percentage for global volume discount`
        );
      }

      // Validate price categories
      if (!discount.global_volume_discount_price_categories?.length) {
        throw new BadRequestException(
          `Price categories are required for global volume discount`
        );
      }

      for (const priceCategory of discount.global_volume_discount_price_categories) {
        const existingPriceCategory = await this.dataSource
          .getRepository("price_categories")
          .findOne({ where: { id: priceCategory.price_category_id } });

        if (!existingPriceCategory) {
          throw new NotFoundException(
            `Price category with ID ${priceCategory.price_category_id} not found`
          );
        }

        if (priceCategory.price === undefined || priceCategory.price <= 0) {
          throw new BadRequestException(
            `Invalid price for price category ${priceCategory.price_category_name}`
          );
        }
      }

      const existingDiscount = existingDiscounts.find(
        (ed) => ed.quantity === discount.quantity
      );

      if (!discount.id && existingDiscount) {
        // Case 2.1: Quantity exists but ID is null - will update in main function
        continue;
      } else if (!discount.id && !existingDiscount) {
        // Case 2.2: New quantity with null ID - will create in main function
        continue;
      } else if (discount.id) {
        const originalDiscount = existingDiscounts.find(
          (ed) => ed.id === discount.id
        );

        if (!originalDiscount) {
          throw new NotFoundException(
            `Global volume discount with id ${discount.id} not found`
          );
        }

        if (originalDiscount.quantity !== discount.quantity) {
          // Case 2.3: Check for quantity duplication
          const isDuplicate = existingDiscounts.some(
            (ed) => ed.id !== discount.id && ed.quantity === discount.quantity
          );

          if (isDuplicate) {
            throw new ConflictException(
              `Duplicate quantity ${discount.quantity} found in global volume discounts`
            );
          }
        }
      }
    }
  }

  private async validateVariantVolumeDiscounts(
    pricingId: number,
    variantDiscounts: any[]
  ) {
    if (!variantDiscounts?.length) return;

    for (const variantDiscount of variantDiscounts) {
      // Validate variant existence
      if (!variantDiscount.inventory_product_by_variant_id) {
        throw new BadRequestException(
          `Variant ID is required for variant volume discount`
        );
      }

      const existingVariant = await this.dataSource
        .getRepository("inventory_product_by_variants")
        .findOne({
          where: {
            id: variantDiscount.inventory_product_by_variant_id,
            deleted_at: null,
          },
        });

      if (!existingVariant) {
        throw new NotFoundException(
          `Variant with ID ${variantDiscount.inventory_product_by_variant_id} not found`
        );
      }

      // Validate quantities
      if (
        !variantDiscount.inventory_product_volume_discount_variant_quantities
          ?.length
      ) {
        throw new BadRequestException(
          `Quantities are required for variant volume discount`
        );
      }

      const existingVariantDiscounts = await this.dataSource
        .getRepository("inventory_product_volume_discount_variants")
        .find({
          where: {
            inventory_product_pricing_information_id: pricingId,
            inventory_product_by_variant_id:
              variantDiscount.inventory_product_by_variant_id,
          },
          relations: ["quantities"],
        });

      for (const quantity of variantDiscount.inventory_product_volume_discount_variant_quantities) {
        // Validate quantity value
        if (quantity.quantity === undefined || quantity.quantity <= 0) {
          throw new BadRequestException(
            `Invalid quantity value for variant ${variantDiscount.inventory_product_by_variant_full_product_name}`
          );
        }

        // Check if quantity already exists in database
        const existingQuantity1 = await this.dataSource
          .getRepository(InventoryProductVolumeDiscountVariantQty)
          .findOne({
            where: {
              id: quantity.id,
              inventory_product_vol_disc_variant_id:
                variantDiscount.inventory_product_by_variant_id,
            },
          });

        // Skip duplicate check if quantity already exists
        if (!existingQuantity1) {
          const duplicateQuantity = existingVariantDiscounts
            .find(
              (d) =>
                d.inventory_product_by_variant_id ===
                variantDiscount.inventory_product_by_variant_id
            )
            ?.quantities.find(
              (q: InventoryProductVolumeDiscountVariantQty) =>
                q.quantity === quantity.quantity && q.id !== quantity.id
            );

          if (duplicateQuantity) {
            throw new BadRequestException(
              `Duplicate quantity ${quantity.quantity} found in variant volume discounts for variant ${variantDiscount.inventory_product_by_variant_full_product_name}`
            );
          }
        }

        // Validate discount percentage
        if (
          quantity.discount_percentage === undefined ||
          quantity.discount_percentage <= 0
        ) {
          throw new BadRequestException(
            `Invalid discount percentage for variant ${variantDiscount.inventory_product_by_variant_full_product_name}`
          );
        }

        // Validate price categories
        if (
          !quantity.inventory_product_volume_discount_variant_price_categories
            ?.length
        ) {
          throw new BadRequestException(
            `Price categories are required for variant ${variantDiscount.inventory_product_by_variant_full_product_name}`
          );
        }

        for (const priceCategory of quantity.inventory_product_volume_discount_variant_price_categories) {
          const existingPriceCategory = await this.dataSource
            .getRepository("price_categories")
            .findOne({ where: { id: priceCategory.price_category_id } });

          if (!existingPriceCategory) {
            throw new NotFoundException(
              `Price category with ID ${priceCategory.price_category_id} not found`
            );
          }

          if (priceCategory.price === undefined || priceCategory.price <= 0) {
            throw new BadRequestException(
              `Invalid price for price category ${priceCategory.price_category_name} in variant ${variantDiscount.inventory_product_by_variant_full_product_name}`
            );
          }
        }

        // If quantity has an ID, it's an existing record being updated
        if (quantity.id) {
          const originalQuantity = existingVariantDiscounts
            .flatMap((vd) => vd.quantities)
            .find((q) => q.id === quantity.id);

          if (!originalQuantity) {
            throw new NotFoundException(
              `Variant volume discount quantity with id ${quantity.id} not found`
            );
          }

          // Only check for duplicates if the quantity value is being changed
          if (originalQuantity.quantity !== quantity.quantity) {
            const isDuplicate = existingVariantDiscounts
              .flatMap((vd) => vd.quantities)
              .some(
                (q) => q.id !== quantity.id && q.quantity === quantity.quantity
              );

            if (isDuplicate) {
              throw new ConflictException(
                `Duplicate quantity ${quantity.quantity} found in variant volume discounts for variant ${variantDiscount.inventory_product_by_variant_full_product_name}`
              );
            }
          }
        } else {
          // For new quantities, check for duplicates across all variants
          const isDuplicate = existingVariantDiscounts
            .flatMap((vd) => vd.quantities)
            .some((q) => q.quantity === quantity.quantity);

          if (isDuplicate) {
            throw new ConflictException(
              `Duplicate quantity ${quantity.quantity} found in variant volume discounts for variant ${variantDiscount.inventory_product_by_variant_full_product_name}`
            );
          }
        }
      }
    }
  }

  private async validateUpdatePricingRequest(
    productId: number,
    updateInventoryPriceDto: UpdateInventoryPriceDto
  ): Promise<void> {
    // Initialize queryRunner
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Validate pricing information ID
      const pricing = await this.dataSource
        .getRepository("inventory_product_pricing_informations")
        .findOne({ where: { id: updateInventoryPriceDto.id } });

      if (!pricing) {
        throw new NotFoundException(
          `Pricing information with ID ${updateInventoryPriceDto.id} not found`
        );
      }

      // 2. Validate customer category price IDs
      if (updateInventoryPriceDto.customer_category_prices) {
        for (const categoryPrice of updateInventoryPriceDto.customer_category_prices) {
          const existingCategoryPrice = await this.dataSource
            .getRepository("inventory_product_customer_category_prices")
            .findOne({ where: { id: categoryPrice.id } });

          if (!existingCategoryPrice) {
            throw new NotFoundException(
              `Customer category price with ID ${categoryPrice.id} not found`
            );
          }

          // Validate tax and price category IDs in customer category prices
          const tax = await this.dataSource
            .getRepository("taxes")
            .findOne({ where: { id: categoryPrice.tax_id } });

          if (!tax) {
            throw new NotFoundException(
              `Tax with ID ${categoryPrice.tax_id} not found`
            );
          }

          const priceCategory = await this.dataSource
            .getRepository("price_categories")
            .findOne({ where: { id: categoryPrice.price_category_id } });

          if (!priceCategory) {
            throw new NotFoundException(
              `Price category with ID ${categoryPrice.price_category_id} not found`
            );
          }
        }
      }

      // 3. Validate marketplace category price IDs
      if (updateInventoryPriceDto.marketplace_category_prices) {
        for (const marketplacePrice of updateInventoryPriceDto.marketplace_category_prices) {
          const existingMarketplacePrice = await this.dataSource
            .getRepository("inventory_product_marketplace_category_prices")
            .findOne({ where: { id: marketplacePrice.id } });

          if (!existingMarketplacePrice) {
            throw new NotFoundException(
              `Marketplace category price with ID ${marketplacePrice.id} not found`
            );
          }

          // Validate price category ID in marketplace category prices
          const priceCategory = await this.dataSource
            .getRepository("price_categories")
            .findOne({ where: { id: marketplacePrice.price_category_id } });

          if (!priceCategory) {
            throw new NotFoundException(
              `Price category with ID ${marketplacePrice.price_category_id} not found`
            );
          }
        }
      }

      // 3. Validate product variant price IDs if provided
      if (updateInventoryPriceDto.product_variant_prices) {
        for (const variantPrice of updateInventoryPriceDto.product_variant_prices) {
          // 5. Validate product variant ID
          const variant = await this.dataSource
            .getRepository("inventory_product_by_variants")
            .findOne({ where: { id: variantPrice.variant_id } });

          if (!variant) {
            throw new NotFoundException(
              `Product variant with ID ${variantPrice.variant_id} not found`
            );
          }

          const existingVariantPrice = await queryRunner.manager.findOne(
            InventoryProductByVariantPrice,
            {
              select: [
                "id",
                "usd_price",
                "exchange_rate",
                "adjustment_percentage",
                "status",
              ],
              where: {
                inventory_product_by_variant_id: variantPrice.variant_id,
              },
            }
          );

          if (existingVariantPrice) {
            // Update existing variant price
            await queryRunner.manager.update(
              InventoryProductByVariantPrice,
              { id: existingVariantPrice.id },
              {
                usd_price: variantPrice.usd_price,
                exchange_rate: variantPrice.exchange_rate,
                adjustment_percentage: variantPrice.adjustment_percentage,
                status: variantPrice.status,
              }
            );
          } else {
            // Create new variant price
            await queryRunner.manager
              .getRepository(InventoryProductByVariantPrice)
              .save({
                inventory_product_by_variant_id: variantPrice.variant_id,
                usd_price: variantPrice.usd_price,
                exchange_rate: variantPrice.exchange_rate,
                adjustment_percentage: variantPrice.adjustment_percentage,
                status: variantPrice.status,
              });
          }

          // Update price categories
          if (variantPrice.price_categories) {
            for (const category of variantPrice.price_categories) {
              const existingPriceCategory = await queryRunner.manager.findOne(
                InventoryProductByVariantPrice,
                {
                  where: {
                    inventory_product_by_variant_id: variantPrice.variant_id,
                    price_category_id: category.id,
                  },
                }
              );

              if (existingPriceCategory) {
                await queryRunner.manager
                  .getRepository(InventoryProductByVariantPrice)
                  .update(existingPriceCategory.id, {
                    price: category.price,
                    status: variantPrice.status,
                  });
              } else {
                await queryRunner.manager
                  .getRepository(InventoryProductByVariantPrice)
                  .save({
                    inventory_product_by_variant_id: variantPrice.variant_id,
                    price_category_id: category.id,
                    price: category.price,
                    status: variantPrice.status,
                  });
              }
            }
          }
        }
      }

      // 5. Validate variant IDs in volume discounts if provided
      if (updateInventoryPriceDto.variant_volume_discounts) {
        for (const volumeDiscount of updateInventoryPriceDto.variant_volume_discounts) {
          const variant = await this.dataSource
            .getRepository(InventoryProductByVariant)
            .findOne({
              where: { id: volumeDiscount.inventory_product_by_variant_id },
            });

          if (!variant) {
            throw new NotFoundException(
              `Product variant with ID ${volumeDiscount.inventory_product_by_variant_id} not found`
            );
          }
        }
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateByProductId(
    productId: number,
    updateInventoryPriceDto: UpdateInventoryPriceDto,
    userId: number
  ): Promise<any> {
    // Validate inventory product existence
    await this.validateInventoryProduct(productId);

    // Add validation before proceeding with the update
    await this.validateUpdatePricingRequest(productId, updateInventoryPriceDto);

    const pricing =
      await this.inventoryPriceRepository.findByProductIdWithDetails(productId);

    if (!pricing) {
      throw new NotFoundException(
        `Pricing information not found for product ${productId}`
      );
    }

    // Validate global volume discounts
    await this.validateGlobalVolumeDiscounts(
      pricing.id,
      updateInventoryPriceDto.global_volume_discounts
    );

    // Validate variant volume discounts
    await this.validateVariantVolumeDiscounts(
      pricing.id,
      updateInventoryPriceDto.variant_volume_discounts
    );

    // Start a transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Save pricing history before update
      const pricingHistory = queryRunner.manager.create(
        InventoryProductPricingInformationHistory,
        {
          inventory_product_pricing_information: pricing.id,
          inventory_product_id: pricing.inventory_product_id,
          old_usd_price: pricing.usd_price,
          new_usd_price: updateInventoryPriceDto.usd_price,
          old_exchange_rate: pricing.exchange_rate,
          new_exchange_rate: updateInventoryPriceDto.exchange_rate,
          old_adjustment_percentage: pricing.adjustment_percentage,
          new_adjustment_percentage:
            updateInventoryPriceDto.adjustment_percentage,
          old_price_hb_real: pricing.price_hb_real,
          new_price_hb_real: updateInventoryPriceDto.price_hb_real,
          old_hb_adjustment_price: pricing.hb_adjustment_price,
          new_hb_adjustment_price: updateInventoryPriceDto.hb_adjustment_price,
          old_is_manual_product_variant_price_edit:
            pricing.is_manual_product_variant_price_edit,
          new_is_manual_product_variant_price_edit:
            updateInventoryPriceDto.is_manual_product_variant_price_edit,
          old_is_enable_volume_discount: pricing.is_enable_volume_discount,
          new_is_enable_volume_discount:
            updateInventoryPriceDto.is_enable_volume_discount,
          old_is_enable_volume_discount_by_product_variant:
            pricing.is_enable_volume_discount_by_product_variant,
          new_is_enable_volume_discount_by_product_variant:
            updateInventoryPriceDto.is_enable_volume_discount_by_product_variant,
          user_id: userId,
        }
      );

      await queryRunner.manager.save(pricingHistory);

      // Update main pricing information
      await queryRunner.manager.update(
        InventoryProductPricingInformation,
        { id: pricing.id },
        {
          usd_price: updateInventoryPriceDto.usd_price,
          exchange_rate: updateInventoryPriceDto.exchange_rate,
          adjustment_percentage: updateInventoryPriceDto.adjustment_percentage,
          price_hb_real: updateInventoryPriceDto.price_hb_real,
          hb_adjustment_price: updateInventoryPriceDto.hb_adjustment_price,
          is_manual_product_variant_price_edit:
            updateInventoryPriceDto.is_manual_product_variant_price_edit,
          is_enable_volume_discount:
            updateInventoryPriceDto.is_enable_volume_discount,
          is_enable_volume_discount_by_product_variant:
            updateInventoryPriceDto.is_enable_volume_discount_by_product_variant,
        }
      );

      // Update customer category prices
      if (updateInventoryPriceDto.customer_category_prices) {
        for (const categoryPrice of updateInventoryPriceDto.customer_category_prices) {
          // Get existing customer category price data
          const existingCategoryPrice = await queryRunner.manager.findOne(
            InventoryProductCustomerCategoryPrice,
            { where: { id: categoryPrice.id } }
          );

          if (existingCategoryPrice) {
            // Create history record
            const HistoryCustomerPriceCategory = queryRunner.manager.create(
              InventoryProductCustomerCategoryPriceHistory,
              {
                inventory_product_pricing_information_history_id:
                  pricingHistory.id,
                price_category_id: existingCategoryPrice.price_category_id,
                old_price_category_name:
                  existingCategoryPrice.price_category_name,
                new_price_category_name: categoryPrice.price_category_name,
                old_price_category_percentage:
                  existingCategoryPrice.price_category_percentage,
                new_price_category_percentage: categoryPrice.percentage,
                old_price_category_set_default:
                  existingCategoryPrice.price_category_set_default,
                new_price_category_set_default: categoryPrice.set_default,
                old_pre_tax_price: existingCategoryPrice.pre_tax_price,
                new_pre_tax_price: categoryPrice.pre_tax_price,
                old_tax_inclusive_price:
                  existingCategoryPrice.tax_inclusive_price,
                new_tax_inclusive_price: categoryPrice.tax_inclusive_price,
                tax_id: categoryPrice.tax_id,
                old_tax_percentage: existingCategoryPrice.tax_percentage,
                new_tax_percentage: categoryPrice.tax_percentage,
                old_is_custom_tax_inclusive_price:
                  existingCategoryPrice.is_custom_tax_inclusive_price,
                new_is_custom_tax_inclusive_price:
                  categoryPrice.is_custom_tax_inclusive_price,
                old_price_category_custom_percentage:
                  existingCategoryPrice.price_category_custom_percentage,
                new_price_category_custom_percentage:
                  categoryPrice.price_category_custom_percentage,
              }
            );

            await queryRunner.manager.save(HistoryCustomerPriceCategory);

            // Update the customer category price
            await queryRunner.manager.update(
              "inventory_product_customer_category_prices",
              { id: categoryPrice.id },
              {
                pre_tax_price: categoryPrice.pre_tax_price,
                tax_inclusive_price: categoryPrice.tax_inclusive_price,
                tax_id: categoryPrice.tax_id,
                tax_percentage: categoryPrice.tax_percentage,
                is_custom_tax_inclusive_price:
                  categoryPrice.is_custom_tax_inclusive_price,
                price_category_custom_percentage:
                  categoryPrice.price_category_custom_percentage,
              }
            );
          }
        }
      }

      // Update marketplace category prices
      if (updateInventoryPriceDto.marketplace_category_prices) {
        for (const marketplacePrice of updateInventoryPriceDto.marketplace_category_prices) {
          // Get existing marketplace category price data
          const existingMarketplacePrice = await queryRunner.manager.findOne(
            InventoryProductMarketplaceCategoryPrice,
            { where: { id: marketplacePrice.id } }
          );

          if (existingMarketplacePrice) {
            // Create history record
            const historyProductMarketplaceCategory =
              queryRunner.manager.create(
                "inventory_product_marketplace_category_price_histories",
                {
                  inventory_product_pricing_information_history_id:
                    pricingHistory.id,
                  price_category_id: existingMarketplacePrice.price_category_id,
                  old_price_category_name:
                    existingMarketplacePrice.price_category_name,
                  new_price_category_name: marketplacePrice.price_category_name,
                  old_price_category_percentage:
                    existingMarketplacePrice.price_category_percentage,
                  new_price_category_percentage:
                    marketplacePrice.price_category_percentage,
                  old_price_category_set_default:
                    existingMarketplacePrice.price_category_set_default,
                  new_price_category_set_default:
                    marketplacePrice.price_category_set_default,
                  old_price: existingMarketplacePrice.price,
                  new_price: marketplacePrice.price,
                  old_price_category_custom_percentage:
                    existingMarketplacePrice.price_category_custom_percentage,
                  new_price_category_custom_percentage:
                    marketplacePrice.price_category_custom_percentage,
                  old_is_custom_price_category:
                    existingMarketplacePrice.is_custom_price_category,
                  new_is_custom_price_category:
                    marketplacePrice.is_custom_price_category,
                }
              );

            await queryRunner.manager.save(historyProductMarketplaceCategory);

            // Update the marketplace category price
            await queryRunner.manager.update(
              "inventory_product_marketplace_category_prices",
              { id: marketplacePrice.id },
              {
                price: marketplacePrice.price,
                price_category_custom_percentage:
                  marketplacePrice.price_category_custom_percentage,
                is_custom_price_category:
                  marketplacePrice.is_custom_price_category,
              }
            );
          }
        }
      }

      // Update product variant prices
      if (updateInventoryPriceDto.product_variant_prices) {
        for (const variantPrice of updateInventoryPriceDto.product_variant_prices) {
          // Find existing variant price or create new one
          const existingVariantPrice = await queryRunner.manager.findOne(
            InventoryProductByVariantPrice,
            {
              select: [
                "id",
                "usd_price",
                "exchange_rate",
                "adjustment_percentage",
                "status",
              ],
              where: {
                inventory_product_by_variant_id: variantPrice.variant_id,
              },
            }
          );

          if (existingVariantPrice) {
            // Update existing variant price
            await queryRunner.manager.update(
              InventoryProductByVariantPrice,
              { id: existingVariantPrice.id },
              {
                usd_price: variantPrice.usd_price,
                exchange_rate: variantPrice.exchange_rate,
                adjustment_percentage: variantPrice.adjustment_percentage,
                status: variantPrice.status,
              }
            );
          } else {
            // Create new variant price
            await queryRunner.manager
              .getRepository(InventoryProductByVariantPrice)
              .save({
                inventory_product_by_variant_id: variantPrice.variant_id,
                usd_price: variantPrice.usd_price,
                exchange_rate: variantPrice.exchange_rate,
                adjustment_percentage: variantPrice.adjustment_percentage,
                status: variantPrice.status,
              });
          }

          // Update price categories
          if (variantPrice.price_categories) {
            for (const category of variantPrice.price_categories) {
              const existingPriceCategory = await queryRunner.manager.findOne(
                InventoryProductByVariantPrice,
                {
                  where: {
                    inventory_product_by_variant_id: variantPrice.variant_id,
                    price_category_id: category.id,
                  },
                }
              );

              if (existingPriceCategory) {
                await queryRunner.manager.update(
                  "inventory_product_by_variant_prices",
                  { id: existingPriceCategory.id },
                  {
                    price: category.price,
                    status: variantPrice.status,
                  }
                );
              } else {
                await queryRunner.manager
                  .getRepository("inventory_product_by_variant_prices")
                  .save({
                    inventory_product_by_variant_id: variantPrice.variant_id,
                    price_category_id: category.id,
                    price: category.price,
                    status: variantPrice.status,
                  });
              }

              // Create variant price history
              const variantPriceHistory =
                new InventoryProductByVariantPriceHistory();
              variantPriceHistory.inventory_product_pricing_information_history_id =
                pricingHistory.id;
              variantPriceHistory.inventory_product_by_variant_id =
                variantPrice.variant_id;
              variantPriceHistory.price_category_id = Number(category.id);
              variantPriceHistory.old_price_category_type = category.type;
              variantPriceHistory.new_price_category_type = category.type;
              variantPriceHistory.old_price_category_name =
                category.price_category_name;
              variantPriceHistory.new_price_category_name =
                category.price_category_name;
              variantPriceHistory.old_price_category_percentage =
                category.percentage;
              variantPriceHistory.new_price_category_percentage =
                category.percentage;
              variantPriceHistory.old_price_category_set_default =
                category.set_default;
              variantPriceHistory.new_price_category_set_default =
                category.set_default;
              variantPriceHistory.old_price = Number(
                existingPriceCategory?.price || 0
              );
              variantPriceHistory.new_price = Number(category.price);
              variantPriceHistory.old_status =
                existingPriceCategory?.status || false;
              variantPriceHistory.new_status = variantPrice.status;
              variantPriceHistory.old_usd_price = Number(
                variantPrice.usd_price
              );
              variantPriceHistory.new_usd_price = Number(
                variantPrice.usd_price
              );
              variantPriceHistory.old_exchange_rate = Number(
                variantPrice.exchange_rate
              );
              variantPriceHistory.new_exchange_rate = Number(
                variantPrice.exchange_rate
              );
              variantPriceHistory.old_adjustment_percentage = Number(
                variantPrice.adjustment_percentage
              );
              variantPriceHistory.new_adjustment_percentage = Number(
                variantPrice.adjustment_percentage
              );
              await queryRunner.manager.save(
                InventoryProductByVariantPriceHistory,
                variantPriceHistory
              );
            }
          }
        }
      }

      // Update global volume discounts
      if (updateInventoryPriceDto.global_volume_discounts) {
        for (const discount of updateInventoryPriceDto.global_volume_discounts) {
          if (discount.id) {
            // Get existing global discount data
            const existingGlobalDiscount = await queryRunner.manager.findOne(
              InventoryProductGlobalDiscount,
              { where: { id: discount.id } }
            );

            // Create history record for existing global discount
            const historyGlobalDiscount = queryRunner.manager.create(
              InventoryProductGlobalDiscountHistory,
              {
                inventory_product_pricing_information_history_id:
                  pricingHistory.id,
                old_quantity: existingGlobalDiscount
                  ? existingGlobalDiscount.quantity
                  : 0,
                new_quantity: discount.quantity,
                old_discount_percentage: existingGlobalDiscount
                  ? existingGlobalDiscount.discount_percentage
                  : 0,
                new_discount_percentage: discount.discount_percentage,
              }
            );

            await queryRunner.manager.save(historyGlobalDiscount);

            // Create history records for global discount price categories
            if (discount.global_volume_discount_price_categories) {
              for (const category of discount.global_volume_discount_price_categories) {
                if (category.id) {
                  const existingPriceGlobalDiscountCategories =
                    await queryRunner.manager.findOne(
                      InventoryProductGlobalDiscountPriceCategory,
                      {
                        where: {
                          id: category.id,
                        },
                      }
                    );
                  if (existingPriceGlobalDiscountCategories) {
                    const historyGlobalDiscountPriceCategoryHistory =
                      queryRunner.manager.create(
                        InventoryProductGlobalDiscountPriceCategoryHistory,
                        {
                          inventory_product_pricing_information_history_id:
                            pricingHistory.id,
                          inventory_product_global_discount_history_id:
                            historyGlobalDiscount.id,
                          price_category_id: (
                            existingPriceGlobalDiscountCategories as InventoryProductGlobalDiscountPriceCategory
                          ).price_category_id,
                          old_price_category_type: (
                            existingPriceGlobalDiscountCategories as InventoryProductGlobalDiscountPriceCategory
                          ).price_category_type,
                          new_price_category_type: category.price_category_type,
                          old_price_category_name: (
                            existingPriceGlobalDiscountCategories as InventoryProductGlobalDiscountPriceCategory
                          ).price_category_name,
                          new_price_category_name: category.price_category_name,
                          old_price_category_percentage: (
                            existingPriceGlobalDiscountCategories as InventoryProductGlobalDiscountPriceCategory
                          ).price_category_percentage,
                          new_price_category_percentage:
                            category.price_category_percentage,
                          old_price_category_set_default: (
                            existingPriceGlobalDiscountCategories as InventoryProductGlobalDiscountPriceCategory
                          ).price_category_set_default,
                          new_price_category_set_default:
                            category.price_category_set_default,
                          old_price: (
                            existingPriceGlobalDiscountCategories as InventoryProductGlobalDiscountPriceCategory
                          ).price,
                          new_price: category.price,
                        }
                      );
                    await queryRunner.manager.save(
                      historyGlobalDiscountPriceCategoryHistory
                    );
                  } else {
                    const historyGlobalDiscountPriceCategoryHistory =
                      queryRunner.manager.create(
                        InventoryProductGlobalDiscountPriceCategoryHistory,
                        {
                          inventory_product_pricing_information_history_id:
                            pricingHistory.id,
                          inventory_product_global_discount_history_id:
                            historyGlobalDiscount.id,
                          price_category_id: category.price_category_id,
                          old_price_category_type: category.price_category_type,
                          new_price_category_type: category.price_category_type,
                          old_price_category_name: category.price_category_name,
                          new_price_category_name: category.price_category_name,
                          old_price_category_percentage: 0,
                          new_price_category_percentage:
                            category.price_category_percentage,
                          old_price_category_set_default:
                            category.price_category_set_default,
                          new_price_category_set_default:
                            category.price_category_set_default,
                          old_price: 0,
                          new_price: category.price,
                        }
                      );
                    await queryRunner.manager.save(
                      historyGlobalDiscountPriceCategoryHistory
                    );
                  }
                } else {
                  const globalDiscountPriceCategory =
                    queryRunner.manager.create(
                      InventoryProductGlobalDiscountPriceCategory,
                      {
                        inventory_product_global_discount_id: discount.id,
                        price_category_id: category.price_category_id,
                        price_category_type: category.price_category_type,
                        price_category_name: category.price_category_name,
                        price_category_percentage:
                          category.price_category_percentage,
                        price_category_set_default:
                          category.price_category_set_default,
                        price: category.price,
                      }
                    );
                  await queryRunner.manager.save(globalDiscountPriceCategory);

                  const historyGlobalDiscountPriceCategory =
                    queryRunner.manager.create(
                      InventoryProductGlobalDiscountPriceCategoryHistory,
                      {
                        inventory_product_pricing_information_history_id:
                          pricingHistory.id,
                        inventory_product_global_discount_history_id:
                          historyGlobalDiscount.id,
                        price_category_id: category.price_category_id,
                        old_price_category_type: category.price_category_type,
                        new_price_category_type: category.price_category_type,
                        old_price_category_name: category.price_category_name,
                        new_price_category_name: category.price_category_name,
                        old_price_category_percentage: 0,
                        new_price_category_percentage:
                          category.price_category_percentage,
                        old_price_category_set_default:
                          category.price_category_set_default,
                        new_price_category_set_default:
                          category.price_category_set_default,
                        old_price: 0,
                        new_price: category.price,
                      }
                    );
                  await queryRunner.manager.save(
                    historyGlobalDiscountPriceCategory
                  );
                }
              }
            }

            await queryRunner.manager.update(
              "inventory_product_global_discounts",
              { id: discount.id },
              {
                quantity: discount.quantity,
                discount_percentage: discount.discount_percentage,
              }
            );
          } else {
            // Create history record for new global discount
            const productGlobalDiscountHistory = queryRunner.manager.create(
              InventoryProductGlobalDiscountHistory,
              {
                inventory_product_pricing_information_history_id:
                  pricingHistory.id,
                old_quantity: 0,
                new_quantity: discount.quantity,
                old_discount_percentage: 0,
                new_discount_percentage: discount.discount_percentage,
              }
            );

            await queryRunner.manager.save(productGlobalDiscountHistory);

            const newDiscount = await queryRunner.manager
              .getRepository(InventoryProductGlobalDiscount)
              .save({
                // id: `${randomBytes(12).toString("hex")}${Date.now().toString(20)}`,
                inventory_product_pricing_information_id: pricing.id,
                quantity: discount.quantity,
                discount_percentage: discount.discount_percentage,
              });

            await queryRunner.manager.save(newDiscount);

            // Save price categories for new discount
            if (discount.global_volume_discount_price_categories) {
              for (const category of discount.global_volume_discount_price_categories) {
                const globalDiscountPriceCategory = await queryRunner.manager
                  .getRepository(InventoryProductGlobalDiscountPriceCategory)
                  .save({
                    inventory_product_global_discount_id: newDiscount.id,
                    price_category_id: category.price_category_id,
                    price_category_name: category.price_category_name,
                    price_category_type: category.price_category_type,
                    price_category_percentage:
                      category.price_category_percentage,
                    price_category_set_default:
                      category.price_category_set_default,
                    price: category.price,
                  });

                await queryRunner.manager
                  .getRepository(
                    InventoryProductGlobalDiscountPriceCategoryHistory
                  )
                  .save({
                    inventory_product_pricing_information_history_id:
                      pricingHistory.id,
                    inventory_product_global_discount_history_id:
                      globalDiscountPriceCategory.id,
                    price_category_id: category.price_category_id,
                    old_price_category_type: category.price_category_type,
                    new_price_category_type: category.price_category_type,
                    old_price_category_name: category.price_category_name,
                    new_price_category_name: category.price_category_name,
                    old_price_category_percentage: 0,
                    new_price_category_percentage:
                      category.price_category_percentage,
                    old_price_category_set_default:
                      category.price_category_set_default,
                    new_price_category_set_default:
                      category.price_category_set_default,
                    old_price: 0,
                    new_price: category.price,
                  });
              }
            }
          }
        }
      }

      // Update variant volume discounts
      if (updateInventoryPriceDto.variant_volume_discounts) {
        for (const variantDiscount of updateInventoryPriceDto.variant_volume_discounts) {
          // Get existing variant data
          const existingVariant = await queryRunner.manager.findOne(
            InventoryProductByVariant,
            {
              select: ["id", "full_product_name", "sku_product_variant"],
              where: { id: variantDiscount.inventory_product_by_variant_id },
            }
          );

          if (!existingVariant) {
            throw new NotFoundException(
              `Product variant with ID ${variantDiscount.inventory_product_by_variant_id} not found`
            );
          }

          // Get existing variant volume discount
          const existingVariantDiscount = await queryRunner.manager.findOne(
            InventoryProductVolumeDiscountVariant,
            { where: { id: variantDiscount.id || IsNull() } }
          );

          // Update or create variant volume discount
          if (existingVariantDiscount) {
            await queryRunner.manager.update(
              InventoryProductVolumeDiscountVariant,
              { id: variantDiscount.id },
              {
                inventory_product_by_variant_full_product_name:
                  variantDiscount.inventory_product_by_variant_full_product_name,
                inventory_product_by_variant_sku:
                  variantDiscount.inventory_product_by_variant_sku,
                status: variantDiscount.status,
              }
            );
          } else {
            const inventoryProductVolumeDiscVariant =
              queryRunner.manager.create(
                InventoryProductVolumeDiscountVariant,
                {
                  inventory_product_pricing_information_id: pricing.id,
                  inventory_product_by_variant_id:
                    variantDiscount.inventory_product_by_variant_id,
                  inventory_product_by_variant_full_product_name:
                    variantDiscount.inventory_product_by_variant_full_product_name,
                  inventory_product_by_variant_sku:
                    variantDiscount.inventory_product_by_variant_sku,
                  status: variantDiscount.status,
                }
              );

            await queryRunner.manager.save(inventoryProductVolumeDiscVariant);
          }

          // Create history record for variant volume discount
          const productVolumeDiscountVariantHistory =
            queryRunner.manager.create(
              InventoryProductVolumeDiscountVariantHistory,
              {
                inventory_product_pricing_information_history_id:
                  pricingHistory.id,
                inventory_product_by_variant_id:
                  variantDiscount.inventory_product_by_variant_id,
                old_inventory_product_by_variant_full_product_name:
                  variantDiscount.inventory_product_by_variant_full_product_name,
                new_inventory_product_by_variant_full_product_name:
                  variantDiscount.inventory_product_by_variant_full_product_name,
                old_inventory_product_by_variant_sku:
                  variantDiscount.inventory_product_by_variant_sku,
                new_inventory_product_by_variant_sku:
                  variantDiscount.inventory_product_by_variant_sku,
                old_status: variantDiscount.status,
                new_status: variantDiscount.status,
              }
            );

          await queryRunner.manager.save(productVolumeDiscountVariantHistory);

          // Update quantities and their price categories
          if (
            variantDiscount.inventory_product_volume_discount_variant_quantities
          ) {
            for (const quantity of variantDiscount.inventory_product_volume_discount_variant_quantities) {
              // Get existing quantity data
              const existingQuantity = await queryRunner.manager.findOne(
                InventoryProductVolumeDiscountVariantQty,
                { where: { id: quantity.id || IsNull() } }
              );

              // Create history record for quantity
              const quantityHistory = queryRunner.manager.create(
                // "inventory_product_volume_discount_variant_qty_his",
                InventoryProductVolumeDiscountVariantQtyHis,
                {
                  // inventory_product_vol_disc_variant_his_id: variantDiscount.id,
                  inventory_product_vol_disc_variant_his_id: (
                    productVolumeDiscountVariantHistory as { id: string }
                  ).id,
                  old_quantity: existingQuantity
                    ? existingQuantity.quantity
                    : 0,
                  new_quantity: quantity.quantity,
                  old_discount_percentage: existingQuantity
                    ? existingQuantity.discount_percentage
                    : 0,
                  new_discount_percentage: quantity.discount_percentage,
                  old_status: existingQuantity
                    ? existingQuantity.status
                    : false,
                  new_status: quantity.status,
                }
              );

              await queryRunner.manager.save(quantityHistory);

              // Update or create quantity
              if (existingQuantity) {
                await queryRunner.manager.update(
                  // "inventory_product_volume_discount_variant_qty",
                  InventoryProductVolumeDiscountVariantQty,
                  { id: quantity.id },
                  {
                    quantity: quantity.quantity,
                    discount_percentage: quantity.discount_percentage,
                  }
                );
              } else {
                const productVolumeDiscountQty = queryRunner.manager.create(
                  InventoryProductVolumeDiscountVariantQty,
                  {
                    inventory_product_volume_discount_variant_id:
                      variantDiscount.id,
                    quantity: quantity.quantity,
                    discount_percentage: quantity.discount_percentage,
                  }
                );
                await queryRunner.manager.save(productVolumeDiscountQty);
              }

              // Update price categories
              if (
                quantity.inventory_product_volume_discount_variant_price_categories
              ) {
                for (const category of quantity.inventory_product_volume_discount_variant_price_categories) {
                  const existingPriceCategory =
                    await queryRunner.manager.findOne(
                      InventoryProductVolumeDiscountVariantPriceCategory,
                      { where: { id: category.id as string } }
                    );

                  // Create history record for price category
                  const createHistoryRecordPriceCategory =
                    queryRunner.manager.create(
                      // "inventory_product_volume_discount_variant_price_cat_his",
                      InventoryProductVolumeDiscountVariantPriceCatHis,
                      {
                        inventory_product_vol_disc_variant_qty_his_id: (
                          quantityHistory as { id: string }
                        ).id,
                        price_category_id: category.price_category_id,
                        old_price_category_type: existingPriceCategory
                          ? existingPriceCategory.price_category_type
                          : "",
                        new_price_category_type: category.price_category_type,
                        old_price_category_name: existingPriceCategory
                          ? existingPriceCategory.price_category_name
                          : "",
                        new_price_category_name: category.price_category_name,
                        old_price_category_percentage: existingPriceCategory
                          ? existingPriceCategory.price_category_percentage
                          : 0,
                        new_price_category_percentage:
                          category.price_category_percentage,
                        old_price_category_set_default: existingPriceCategory
                          ? existingPriceCategory.price_category_set_default
                          : false,
                        new_price_category_set_default:
                          category.price_category_set_default,
                        old_price: existingPriceCategory
                          ? existingPriceCategory.price
                          : 0,
                        new_price: category.price,
                      }
                    );
                  await queryRunner.manager.save(
                    createHistoryRecordPriceCategory
                  );

                  if (existingPriceCategory) {
                    await queryRunner.manager.update(
                      InventoryProductVolumeDiscountVariantPriceCategory,
                      { id: category.id },
                      {
                        price: category.price,
                        price_category_type: category.price_category_type,
                        price_category_name: category.price_category_name,
                        price_category_percentage:
                          category.price_category_percentage,
                        price_category_set_default:
                          category.price_category_set_default,
                      }
                    );
                  } else {
                    const createPriceCategoryProductVariant =
                      queryRunner.manager.create(
                        InventoryProductVolumeDiscountVariantPriceCategory,
                        {
                          inventory_product_volume_discount_variant_qty_id:
                            quantity.id,
                          price_category_id: category.price_category_id,
                          price_category_type: category.price_category_type,
                          price_category_name: category.price_category_name,
                          price_category_percentage:
                            category.price_category_percentage,
                          price_category_set_default:
                            category.price_category_set_default,
                          price: category.price,
                        }
                      );

                    await queryRunner.manager.save(
                      createPriceCategoryProductVariant
                    );
                  }
                }
              }
            }
          }
        }
      }

      await queryRunner.commitTransaction();
      return this.responseTransformer.transform({
        message: "Product pricing updated successfully",
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async removeGlobalDiscount(id: string): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const globalDiscountFindID = await queryRunner.manager.findOne(
        InventoryProductGlobalDiscount,
        {
          where: { id },
          relations: {
            price_categories: true,
            pricing_information: {
              customer_category_prices: true,
              volume_discount_variants: {
                quantities: {
                  price_categories: true,
                },
              },
              marketplace_category_prices: true,
              inventory_product: {
                product_by_variant: true,
              },
            },
          },
        }
      );

      if (!globalDiscountFindID) {
        throw new NotFoundException(`Global discount with id ${id} not found`);
      }

      // console.log("globalDiscountFindID:", globalDiscountFindID);

      const globalDiscountFindNotID = await queryRunner.manager.findOne(
        InventoryProductGlobalDiscount,
        {
          where: { id: Not(id) },
          relations: {
            price_categories: true,
          },
        }
      );

      // // Create history record for global discount
      // const pricingInformationHistory = queryRunner.manager.create(
      //   InventoryProductPricingInformationHistory,
      //   {
      //     inventory_product_pricing_information:
      //       globalDiscountFindID.pricing_information.id,
      //     inventory_product_id:
      //       globalDiscountFindID.pricing_information.inventory_product.id,
      //     old_usd_price: globalDiscountFindID.pricing_information.usd_price,
      //     new_usd_price: globalDiscountFindID.pricing_information.usd_price,
      //     old_exchange_rate:
      //       globalDiscountFindID.pricing_information.exchange_rate,
      //     new_exchange_rate:
      //       globalDiscountFindID.pricing_information.exchange_rate,
      //     old_adjustment_percentage:
      //       globalDiscountFindID.pricing_information.adjustment_percentage,
      //     new_adjustment_percentage:
      //       globalDiscountFindID.pricing_information.adjustment_percentage,
      //     old_price_hb_real:
      //       globalDiscountFindID.pricing_information.price_hb_real,
      //     new_price_hb_real:
      //       globalDiscountFindID.pricing_information.price_hb_real,
      //     old_hb_adjustment_price:
      //       globalDiscountFindID.pricing_information.hb_adjustment_price,
      //     new_hb_adjustment_price:
      //       globalDiscountFindID.pricing_information.hb_adjustment_price,
      //     old_is_manual_product_variant_price_edit:
      //       globalDiscountFindID.pricing_information
      //         .is_manual_product_variant_price_edit,
      //     new_is_manual_product_variant_price_edit:
      //       globalDiscountFindID.pricing_information
      //         .is_manual_product_variant_price_edit,
      //     old_is_enable_volume_discount:
      //       globalDiscountFindID.pricing_information.is_enable_volume_discount,
      //     new_is_enable_volume_discount:
      //       globalDiscountFindID.pricing_information.is_enable_volume_discount,
      //     old_is_enable_volume_discount_by_product_variant:
      //       globalDiscountFindID.pricing_information
      //         .is_enable_volume_discount_by_product_variant,
      //     new_is_enable_volume_discount_by_product_variant:
      //       globalDiscountFindID.pricing_information
      //         .is_enable_volume_discount_by_product_variant,
      //   }
      // );

      // await queryRunner.manager.save(pricingInformationHistory);

      // // create history customer price category
      // if (globalDiscountFindID.pricing_information.customer_category_prices) {
      //   for (const customerCategoryPrice of globalDiscountFindID
      //     .pricing_information.customer_category_prices) {
      //     const HistoryCustomerPriceCategory = queryRunner.manager.create(
      //       InventoryProductCustomerCategoryPriceHistory,
      //       {
      //         inventory_product_pricing_information_history_id:
      //           pricingInformationHistory.id,
      //         price_category_id: customerCategoryPrice.price_category_id,
      //         old_price_category_name:
      //           customerCategoryPrice.price_category_name,
      //         new_price_category_name:
      //           customerCategoryPrice.price_category_name,
      //         old_price_category_percentage:
      //           customerCategoryPrice.price_category_percentage,
      //         new_price_category_percentage:
      //           customerCategoryPrice.price_category_percentage,
      //         old_price_category_set_default:
      //           customerCategoryPrice.price_category_set_default,
      //         new_price_category_set_default:
      //           customerCategoryPrice.price_category_set_default,
      //         old_pre_tax_price: customerCategoryPrice.pre_tax_price,
      //         new_pre_tax_price: customerCategoryPrice.pre_tax_price,
      //         old_tax_inclusive_price:
      //           customerCategoryPrice.tax_inclusive_price,
      //         new_tax_inclusive_price:
      //           customerCategoryPrice.tax_inclusive_price,
      //         tax_id: customerCategoryPrice.tax_id,
      //         old_tax_percentage: customerCategoryPrice.tax_percentage,
      //         new_tax_percentage: customerCategoryPrice.tax_percentage,
      //         old_is_custom_tax_inclusive_price:
      //           customerCategoryPrice.is_custom_tax_inclusive_price,
      //         new_is_custom_tax_inclusive_price:
      //           customerCategoryPrice.is_custom_tax_inclusive_price,
      //         old_price_category_custom_percentage:
      //           customerCategoryPrice.price_category_custom_percentage,
      //         new_price_category_custom_percentage:
      //           customerCategoryPrice.price_category_custom_percentage,
      //       }
      //     );

      //     await queryRunner.manager.save(HistoryCustomerPriceCategory);
      //   }
      // }

      // // create history marketplace price category
      // if (
      //   globalDiscountFindID.pricing_information.marketplace_category_prices
      // ) {
      //   for (const marketplaceCategoryPrice of globalDiscountFindID
      //     .pricing_information.marketplace_category_prices) {
      //     const historyProductMarketplaceCategory = queryRunner.manager.create(
      //       "inventory_product_marketplace_category_price_histories",
      //       {
      //         inventory_product_pricing_information_history_id:
      //           pricingInformationHistory.id,
      //         price_category_id: marketplaceCategoryPrice.price_category_id,
      //         old_price_category_name:
      //           marketplaceCategoryPrice.price_category_name,
      //         new_price_category_name:
      //           marketplaceCategoryPrice.price_category_name,
      //         old_price_category_percentage:
      //           marketplaceCategoryPrice.price_category_percentage,
      //         new_price_category_percentage:
      //           marketplaceCategoryPrice.price_category_percentage,
      //         old_price_category_set_default:
      //           marketplaceCategoryPrice.price_category_set_default,
      //         new_price_category_set_default:
      //           marketplaceCategoryPrice.price_category_set_default,
      //         old_price: marketplaceCategoryPrice.price,
      //         new_price: marketplaceCategoryPrice.price,
      //         old_price_category_custom_percentage:
      //           marketplaceCategoryPrice.price_category_custom_percentage,
      //         new_price_category_custom_percentage:
      //           marketplaceCategoryPrice.price_category_custom_percentage,
      //         old_is_custom_price_category:
      //           marketplaceCategoryPrice.is_custom_price_category,
      //         new_is_custom_price_category:
      //           marketplaceCategoryPrice.is_custom_price_category,
      //       }
      //     );

      //     await queryRunner.manager.save(historyProductMarketplaceCategory);
      //   }
      // }

      // // Create history record for global discount with is_deleted flag
      // const historyGlobalDiscount = queryRunner.manager.create(
      //   InventoryProductGlobalDiscountHistory,
      //   {
      //     inventory_product_pricing_information_history_id: pricingHistory.id,
      //     old_quantity: globalDiscount.quantity,
      //     new_quantity: globalDiscount.quantity,
      //     old_discount_percentage: globalDiscount.discount_percentage,
      //     new_discount_percentage: globalDiscount.discount_percentage,
      //     is_deleted: true,
      //   }
      // );

      // await queryRunner.manager.save(historyGlobalDiscount);

      // // Create history records for global discount price categories
      // for (const category of globalDiscount.price_categories) {
      //   const historyGlobalDiscountPriceCategory = queryRunner.manager.create(
      //     InventoryProductGlobalDiscountPriceCategoryHistory,
      //     {
      //       inventory_product_pricing_information_history_id: pricingHistory.id,
      //       inventory_product_global_discount_history_id:
      //         historyGlobalDiscount.id,
      //       price_category_id: category.price_category_id,
      //       old_price_category_type: category.price_category_type,
      //       new_price_category_type: category.price_category_type,
      //       old_price_category_name: category.price_category_name,
      //       new_price_category_name: category.price_category_name,
      //       old_price_category_percentage: category.price_category_percentage,
      //       new_price_category_percentage: category.price_category_percentage,
      //       old_price_category_set_default: category.price_category_set_default,
      //       new_price_category_set_default: category.price_category_set_default,
      //       old_price: category.price,
      //       new_price: category.price,
      //     }
      //   );

      //   await queryRunner.manager.save(historyGlobalDiscountPriceCategory);
      // }

      // await queryRunner.manager.remove(globalDiscount);

      // await queryRunner.commitTransaction();
      return this.responseTransformer.transform({
        message: "Global discount deleted successfully",
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async removeVariantDiscountQuantity(id: string): Promise<any> {
    // Start a transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const existVariantDiscountQty = await queryRunner.manager.findOne(
        InventoryProductVolumeDiscountVariantQty,
        {
          where: { id: id },
        }
      );

      if (!existVariantDiscountQty) {
        throw new NotFoundException(
          `Variant Discount quantity not found for id ${id}`
        );
      }
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
