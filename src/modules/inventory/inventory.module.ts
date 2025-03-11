import { PaginationModule } from "@/common/pagination/pagination.module";
import { TransformersModule } from "@/common/transformers/transformers.module";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PriceCategoriesModule } from "@/modules/price-categories/price-categories.module";
import { TaxesModule } from "@/modules/taxes/taxes.module";
import { InventoryProductService } from "./application/services/inventory-product.service";
import { InventoryProductByVariantHistory } from "./domain/entities/inventory-product-by-variant-history.entity";
import { InventoryProductByVariant } from "./domain/entities/inventory-product-by-variant.entity";
import { InventoryProductCategory } from "./domain/entities/inventory-product-category.entity";
import { InventoryProductSelectedVariantValue } from "./domain/entities/inventory-product-selected-variant-value.entity";
import { InventoryProductSelectedVariant } from "./domain/entities/inventory-product-selected-variant.entity";
import { InventoryProduct } from "./domain/entities/inventory-product.entity";
import { InventoryProductRepository } from "./domain/repositories/inventory-product.repository";
import { InventoryProductController } from "./presentation/controllers/inventory-product.controller";
// Inventory-price entities
import { InventoryProductByVariantPriceHistory } from "../inventory-price/domain/entities/inventory-product-by-variant-price-history.entity";
import { InventoryProductByVariantPrice } from "../inventory-price/domain/entities/inventory-product-by-variant-price.entity";
import { InventoryProductCustomerCategoryPriceHistory } from "../inventory-price/domain/entities/inventory-product-customer-category-price-history.entity";
import { InventoryProductCustomerCategoryPrice } from "../inventory-price/domain/entities/inventory-product-customer-category-price.entity";
import { InventoryProductGlobalDiscountHistory } from "../inventory-price/domain/entities/inventory-product-global-discount-history.entity";
import { InventoryProductGlobalDiscountPriceCategoryHistory } from "../inventory-price/domain/entities/inventory-product-global-discount-price-category-history.entity";
import { InventoryProductGlobalDiscountPriceCategory } from "../inventory-price/domain/entities/inventory-product-global-discount-price-category.entity";
import { InventoryProductGlobalDiscount } from "../inventory-price/domain/entities/inventory-product-global-discount.entity";
import { InventoryProductMarketplaceCategoryPriceHistory } from "../inventory-price/domain/entities/inventory-product-marketplace-category-price-history.entity";
import { InventoryProductMarketplaceCategoryPrice } from "../inventory-price/domain/entities/inventory-product-marketplace-category-price.entity";
import { InventoryProductPricingInformationHistory } from "../inventory-price/domain/entities/inventory-product-pricing-information-history.entity";
import { InventoryProductPricingInformation } from "../inventory-price/domain/entities/inventory-product-pricing-information.entity";
import { InventoryProductVolumeDiscountVariantHistory } from "../inventory-price/domain/entities/inventory-product-volume-discount-variant-history.entity";
import { InventoryProductVolumeDiscountVariantPriceCatHis } from "../inventory-price/domain/entities/inventory-product-volume-discount-variant-price-cat-his.entity";
import { InventoryProductVolumeDiscountVariantPriceCategory } from "../inventory-price/domain/entities/inventory-product-volume-discount-variant-price-category.entity";
import { InventoryProductVolumeDiscountVariant } from "../inventory-price/domain/entities/inventory-product-volume-discount-variant.entity";
import { InventoryProductVolumeDiscountVariantQtyHis } from "../inventory-price/domain/entities/inventory-product-volume-discount-variant-qty-his.entity";
import { InventoryProductVolumeDiscountVariantQty } from "../inventory-price/domain/entities/inventory-product-volume-discount-variant-qty.entity";
import { PriceCategory } from "../price-categories/domain/entities/price-category.entity";
import { Tax } from "../taxes/domain/entities/tax.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      // Inventory entities
      InventoryProduct,
      InventoryProductCategory,
      InventoryProductSelectedVariant,
      InventoryProductSelectedVariantValue,
      InventoryProductByVariant,
      InventoryProductByVariantHistory,
      // Inventory-price entities
      InventoryProductPricingInformation,
      InventoryProductCustomerCategoryPrice,
      InventoryProductByVariantPrice,
      InventoryProductGlobalDiscount,
      InventoryProductGlobalDiscountPriceCategory,
      InventoryProductVolumeDiscountVariant,
      InventoryProductVolumeDiscountVariantPriceCategory,
      InventoryProductPricingInformationHistory,
      InventoryProductCustomerCategoryPriceHistory,
      InventoryProductByVariantPriceHistory,
      InventoryProductGlobalDiscountHistory,
      InventoryProductGlobalDiscountPriceCategoryHistory,
      InventoryProductVolumeDiscountVariantHistory,
      InventoryProductVolumeDiscountVariantPriceCatHis,
      InventoryProductVolumeDiscountVariantQty,
      InventoryProductVolumeDiscountVariantQtyHis,
      InventoryProductMarketplaceCategoryPrice,
      InventoryProductMarketplaceCategoryPriceHistory,
      // External entities needed for repository injection
      PriceCategory,
      Tax,
    ]),
    PaginationModule,
    TransformersModule,
    PriceCategoriesModule,
    TaxesModule,
  ],
  providers: [InventoryProductRepository, InventoryProductService],
  controllers: [InventoryProductController],
  exports: [InventoryProductRepository],
})
export class InventoryModule {}
