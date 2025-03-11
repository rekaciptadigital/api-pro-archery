import { PaginationHelper } from "@/common/pagination/helpers/pagination.helper";
import { ResponseTransformer } from "@/common/transformers/response.transformer";
import { InventoryProductByVariantPrice } from "@/modules/inventory-price/domain/entities/inventory-product-by-variant-price.entity";
import { InventoryProduct } from "@/modules/inventory/domain/entities/inventory-product.entity";
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { DataSource } from "typeorm";
import { UpdateInventoryPriceDto } from "../../domain/dtos/update-inventory-price.dto";
import { IInventoryProductCustomerCategoryPrice } from "../../domain/interfaces/inventory-price.interface";
import { InventoryPriceRepository } from "../../domain/repositories/inventory-price.repository";
import { randomBytes } from "crypto";

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
          quantity: discount.quantity,
          discount_percentage: discount.discount_percentage,
          global_volume_discount_price_categories:
            discount.price_categories?.map((pc) => ({
              id: pc.id,
              price_category_id: pc.price_category_id,
              price_category_name: pc.price_category_name,
              price_category_percentage: pc.price_category_percentage,
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
          inventory_product_volume_discount_variant_quantities:
            variant.quantities?.map((qty) => ({
              id: qty.id,
              quantity: qty.quantity,
              discount_percentage: qty.discount_percentage,
              inventory_product_volume_discount_variant_price_categories:
                qty.price_categories?.map((pc) => ({
                  id: pc.id,
                  price_category_id: pc.price_category_id,
                  price_category_name: pc.price_category_name,
                  price_category_percentage: pc.price_category_percentage,
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

        const existingQuantity = existingVariantDiscounts
          .flatMap((vd) => vd.quantities)
          .find((q) => q.quantity === quantity.quantity);

        if (!variantDiscount.id && existingQuantity) {
          // Case 3.1: Quantity exists but ID is null - will update in main function
          continue;
        } else if (variantDiscount.id) {
          const originalVariantDiscount = existingVariantDiscounts.find(
            (vd) => vd.id === variantDiscount.id
          );

          if (!originalVariantDiscount) {
            throw new NotFoundException(
              `Variant volume discount with id ${variantDiscount.id} not found`
            );
          }

          // Case 3.2: Check for quantity duplication
          const isDuplicate = existingVariantDiscounts
            .flatMap((vd) => vd.quantities)
            .some(
              (q) =>
                q.inventory_product_volume_discount_variant_id !==
                  variantDiscount.id && q.quantity === quantity.quantity
            );

          if (isDuplicate) {
            throw new ConflictException(
              `Duplicate quantity ${quantity.quantity} found in variant volume discounts for variant ${variantDiscount.inventory_product_by_variant_id}`
            );
          }
        }
      }
    }
  }

  private async validateUpdatePricingRequest(
    productId: number,
    updateInventoryPriceDto: UpdateInventoryPriceDto
  ) {
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
            .getRepository("inventory_product_by_variants")
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
    updateInventoryPriceDto: UpdateInventoryPriceDto
  ) {
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
      // Update main pricing information
      await queryRunner.manager.update(
        "inventory_product_pricing_informations",
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
              "inventory_product_by_variant_prices",
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
              .getRepository("inventory_product_by_variant_prices")
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
            }
          }
        }
      }

      // Update global volume discounts
      if (updateInventoryPriceDto.global_volume_discounts) {
        for (const discount of updateInventoryPriceDto.global_volume_discounts) {
          if (discount.id) {
            await queryRunner.manager.update(
              "inventory_product_global_discounts",
              { id: discount.id },
              {
                quantity: discount.quantity,
                discount_percentage: discount.discount_percentage,
              }
            );
          } else {
            const newDiscount = await queryRunner.manager
              .getRepository("inventory_product_global_discounts")
              .save({
                id: `${randomBytes(12).toString("hex")}${Date.now().toString(20)}`,
                inventory_product_pricing_information_id: pricing.id,
                quantity: discount.quantity,
                discount_percentage: discount.discount_percentage,
              });

            // Save price categories for new discount
            if (discount.global_volume_discount_price_categories) {
              for (const category of discount.global_volume_discount_price_categories) {
                await queryRunner.manager
                  .getRepository(
                    "inventory_product_global_discount_price_categories"
                  )
                  .save({
                    id: `${randomBytes(12).toString("hex")}${Date.now().toString(20)}`,
                    inventory_product_global_discount_id: newDiscount.id,
                    price_category_id: category.price_category_id,
                    price_category_name: category.price_category_name,
                    price_category_percentage:
                      category.price_category_percentage,
                    price_category_set_default:
                      category.price_category_set_default,
                    price: category.price,
                  });
              }
            }
          }
        }
      }

      // Update variant volume discounts
      if (updateInventoryPriceDto.variant_volume_discounts) {
        for (const variantDiscount of updateInventoryPriceDto.variant_volume_discounts) {
          let variantDiscountEntity;

          if (variantDiscount.id) {
            await queryRunner.manager.update(
              "inventory_product_volume_discount_variants",
              { id: variantDiscount.id },
              {
                status: variantDiscount.status,
              }
            );
            variantDiscountEntity = { id: variantDiscount.id };
          } else {
            variantDiscountEntity = await queryRunner.manager
              .getRepository("inventory_product_volume_discount_variants")
              .save({
                id: `${randomBytes(12).toString("hex")}${Date.now().toString(20)}`,
                inventory_product_pricing_information_id: pricing.id,
                inventory_product_by_variant_id:
                  variantDiscount.inventory_product_by_variant_id,
                inventory_product_by_variant_full_product_name:
                  variantDiscount.inventory_product_by_variant_full_product_name,
                inventory_product_by_variant_sku:
                  variantDiscount.inventory_product_by_variant_sku,
                status: variantDiscount.status,
              });
          }

          // Handle quantities and their price categories
          if (
            variantDiscount.inventory_product_volume_discount_variant_quantities
          ) {
            for (const quantity of variantDiscount.inventory_product_volume_discount_variant_quantities) {
              const quantityEntity = await queryRunner.manager
                .getRepository("inventory_product_volume_discount_variant_qty")
                .save({
                  id: `${randomBytes(12).toString("hex")}${Date.now().toString(20)}`,
                  inventory_product_vol_disc_variant_id:
                    variantDiscountEntity.id,
                  quantity: quantity.quantity,
                  discount_percentage: quantity.discount_percentage,
                  status: quantity.status,
                });

              // Save price categories for quantity
              if (
                quantity.inventory_product_volume_discount_variant_price_categories
              ) {
                for (const category of quantity.inventory_product_volume_discount_variant_price_categories) {
                  await queryRunner.manager
                    .getRepository(
                      "inventory_product_volume_discount_variant_price_categories"
                    )
                    .save({
                      id: `${randomBytes(12).toString("hex")}${Date.now().toString(20)}`,
                      inventory_product_vol_disc_variant_qty_id:
                        quantityEntity.id,
                      price_category_id: category.price_category_id,
                      price_category_name: category.price_category_name,
                      price_category_percentage:
                        category.price_category_percentage,
                      price_category_set_default:
                        category.price_category_set_default,
                      price: category.price,
                    });
                }
              }
            }
          }
        }
      }

      await queryRunner.commitTransaction();
      return this.responseTransformer.transform({
        status: {
          code: 200,
          message: "Success",
        },
        info: "Successfully updated pricing information",
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
