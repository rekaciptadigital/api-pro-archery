import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Seeder } from "./seeder.interface";
import { InventoryProduct } from "@/modules/inventory/domain/entities/inventory-product.entity";
import { InventoryProductPricingInformation } from "@/modules/inventory-price/domain/entities/inventory-product-pricing-information.entity";

@Injectable()
export class InventoryProductPriceSeeder implements Seeder {
  private readonly logger = new Logger(InventoryProductPriceSeeder.name);

  constructor(
    @InjectRepository(InventoryProduct)
    private readonly inventoryProductRepository: Repository<InventoryProduct>,
    @InjectRepository(InventoryProductPricingInformation)
    private readonly inventoryPriceRepository: Repository<InventoryProductPricingInformation>
  ) {}

  async createMany(): Promise<void> {
    try {
      this.logger.log("Starting inventory product price seeding...");

      // Find all inventory products that don't have pricing information
      const productsWithoutPricing = await this.inventoryProductRepository
        .createQueryBuilder("product")
        .leftJoin(
          "product.pricing_informations",
          "pricing",
          "pricing.deleted_at IS NULL"
        )
        .where("pricing.id IS NULL")
        .andWhere("product.deleted_at IS NULL")
        .getMany();

      if (productsWithoutPricing.length === 0) {
        this.logger.log("No products found without pricing information");
        return;
      }

      // Create default pricing information for each product
      for (const product of productsWithoutPricing) {
        const pricingInfo = this.inventoryPriceRepository.create({
          inventory_product_id: product.id,
          usd_price: 0,
          exchange_rate: 0,
          adjustment_percentage: 0,
          price_hb_real: 0,
          hb_adjustment_price: 0,
          is_manual_product_variant_price_edit: false,
          is_enable_volume_discount: false,
          is_enable_volume_discount_by_product_variant: false,
        });

        await this.inventoryPriceRepository.save(pricingInfo);
        this.logger.log(
          `Created default pricing information for product ID: ${product.id}`
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