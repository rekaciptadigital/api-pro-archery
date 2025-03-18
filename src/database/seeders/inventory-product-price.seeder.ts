import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Seeder } from "./seeder.interface";
import { InventoryProduct } from "@/modules/inventory/domain/entities/inventory-product.entity";
import { InventoryProductPricingInformation } from "@/modules/inventory-price/domain/entities/inventory-product-pricing-information.entity";
import { InventoryProductCustomerCategoryPrice } from "@/modules/inventory-price/domain/entities/inventory-product-customer-category-price.entity";
import { InventoryProductByVariantPrice } from "@/modules/inventory-price/domain/entities/inventory-product-by-variant-price.entity";
import { PriceCategory } from "@/modules/price-categories/domain/entities/price-category.entity";
import { Tax } from "@/modules/taxes/domain/entities/tax.entity";
import { InventoryProductByVariant } from "@/modules/inventory/domain/entities/inventory-product-by-variant.entity";
import { randomBytes } from "crypto";
import { InventoryProductVolumeDiscountVariant } from "@/modules/inventory-price/domain/entities/inventory-product-volume-discount-variant.entity";
import { InventoryProductMarketplaceCategoryPrice } from "@/modules/inventory-price/domain/entities/inventory-product-marketplace-category-price.entity";

@Injectable()
export class InventoryProductPriceSeeder implements Seeder {
  private readonly logger = new Logger(InventoryProductPriceSeeder.name);

  constructor(
    @InjectRepository(InventoryProduct)
    private readonly inventoryProductRepository: Repository<InventoryProduct>,
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
    private readonly taxRepository: Repository<Tax>,
    @InjectRepository(InventoryProductByVariant)
    private readonly inventoryProductByVariantRepository: Repository<InventoryProductByVariant>,
    @InjectRepository(InventoryProductMarketplaceCategoryPrice)
    private readonly marketplaceCategoryPriceRepository: Repository<InventoryProductMarketplaceCategoryPrice>
  ) {}

  async createMany(): Promise<void> {
    try {
      this.logger.log("Starting inventory product price seeding...");

      // Find all inventory products that don't have pricing information
      const productsWithoutPricing = await this.inventoryProductRepository
        .createQueryBuilder("product")
        .leftJoin("product.pricing_informations", "pricing")
        .where("pricing.id IS NULL")
        .getMany();

      if (productsWithoutPricing.length === 0) {
        this.logger.log("No products found without pricing information");
        return;
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

      // Get active marketplace price categories
      const marketplacePriceCategories = await this.priceCategoryRepository
        .createQueryBuilder("category")
        .where("category.type = :type AND category.status = true", {
          type: "marketplace",
        })
        .getMany();

      // Get active tax
      const activeTax = await this.taxRepository
        .createQueryBuilder("tax")
        .where("tax.status = true")
        .getOne();

      const now = new Date();

      // Create pricing information for each product
      for (const product of productsWithoutPricing) {
        // Create pricing information
        const pricingInfo = await this.inventoryPriceRepository.save({
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
        });

        // Create customer category prices
        for (const category of customerPriceCategories) {
          await this.customerCategoryPriceRepository.save({
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
            price_category_custom_percentage: 0,
            created_at: now,
            updated_at: now,
          });
        }

        // Create marketplace category prices
        for (const category of marketplacePriceCategories) {
          await this.marketplaceCategoryPriceRepository.save({
            inventory_product_pricing_information_id: pricingInfo.id,
            price_category_id: category.id,
            price_category_name: category.name,
            price_category_percentage: category.percentage,
            price_category_set_default: category.set_default,
            price: 0,
            price_category_custom_percentage: 0,
            is_custom_price_category: false,
            created_at: now,
            updated_at: now,
          });
        }

        // Get product variants
        const productVariants = await this.inventoryProductByVariantRepository
          .createQueryBuilder("variant")
          .where("variant.inventory_product_id = :productId", {
            productId: product.id,
          })
          .getMany();

        // Create variant prices if variants exist
        if (productVariants.length > 0) {
          for (const variant of productVariants) {
            // Check if variant prices already exist
            const existingPrices = await this.variantPriceRepository
              .createQueryBuilder("price")
              .where("price.inventory_product_by_variant_id = :variantId", {
                variantId: variant.id,
              })
              .getMany();

            // Only create prices if they don't exist
            if (existingPrices.length === 0) {
              // Create prices for both customer and custom categories
              const allPriceCategories = [
                ...customerPriceCategories,
                ...customPriceCategories,
                ...marketplacePriceCategories,
              ];

              for (const category of allPriceCategories) {
                const timestamp = Date.now().toString(20);
                const randomStr = randomBytes(12).toString("hex");
                await this.variantPriceRepository.save({
                  id: `${randomStr}${timestamp}`,
                  inventory_product_by_variant_id: variant.id,
                  price_category_id: category.id,
                  price: 0,
                  status: false,
                  usd_price: 0,
                  exchange_rate: 0,
                  adjustment_percentage: 0,
                  created_at: now,
                  updated_at: now,
                });
              }
            }

            // Check if variant discount prices already exist
            const existingDiscountVariant =
              await this.inventoryDiscountVariantPriceRepository
                .createQueryBuilder("price")
                .where("price.inventory_product_by_variant_id = :variantId", {
                  variantId: variant.id,
                })
                .getMany();

            if (existingDiscountVariant.length == 0) {
              // Create variant discount prices
              const timestamp = Date.now().toString(20);
              const randomStr = randomBytes(12).toString("hex");
              await this.inventoryDiscountVariantPriceRepository.save({
                id: `${randomStr}${timestamp}`,
                inventory_product_pricing_information_id: pricingInfo.id,
                inventory_product_by_variant_id: variant.id,
                inventory_product_by_variant_full_product_name:
                  variant.full_product_name,
                inventory_product_by_variant_sku: variant.sku_product_variant,
                status: false,
              });
            }
          }
        }

        this.logger.log(
          `Created pricing information for product ID: ${product.id}`
        );
      }

      this.logger.log(
        `Successfully created pricing information for ${productsWithoutPricing.length} products`
      );
    } catch (error) {
      this.logger.error("Error seeding inventory product prices:", error);
      throw error;
    }
  }
}
