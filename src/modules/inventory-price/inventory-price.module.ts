import { PaginationModule } from "@/common/pagination/pagination.module";
import { TransformersModule } from "@/common/transformers/transformers.module";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { InventoryPriceRepository } from "./domain/repositories/inventory-price.repository";
import { InventoryPriceController } from "./presentation/inventory-price.controller";
// Inventory-price entities
import { InventoryProductByVariantPriceHistory } from "./domain/entities/inventory-product-by-variant-price-history.entity";
import { InventoryProductByVariantPrice } from "./domain/entities/inventory-product-by-variant-price.entity";
import { InventoryProductCustomerCategoryPriceHistory } from "./domain/entities/inventory-product-customer-category-price-history.entity";
import { InventoryProductCustomerCategoryPrice } from "./domain/entities/inventory-product-customer-category-price.entity";
import { InventoryProductGlobalDiscountHistory } from "./domain/entities/inventory-product-global-discount-history.entity";
import { InventoryProductGlobalDiscountPriceCategoryHistory } from "./domain/entities/inventory-product-global-discount-price-category-history.entity";
import { InventoryProductGlobalDiscountPriceCategory } from "./domain/entities/inventory-product-global-discount-price-category.entity";
import { InventoryProductGlobalDiscount } from "./domain/entities/inventory-product-global-discount.entity";
import { InventoryProductPricingInformationHistory } from "./domain/entities/inventory-product-pricing-information-history.entity";
import { InventoryProductPricingInformation } from "./domain/entities/inventory-product-pricing-information.entity";
import { InventoryProductVolumeDiscountVariantHistory } from "./domain/entities/inventory-product-volume-discount-variant-history.entity";
import { InventoryProductVolumeDiscountVariantPriceCatHis } from "./domain/entities/inventory-product-volume-discount-variant-price-cat-his.entity";
import { InventoryProductVolumeDiscountVariantPriceCategory } from "./domain/entities/inventory-product-volume-discount-variant-price-category.entity";
import { InventoryProductVolumeDiscountVariant } from "./domain/entities/inventory-product-volume-discount-variant.entity";
import { InventoryProductVolumeDiscountVariantQtyHis } from "./domain/entities/inventory-product-volume-discount-variant-qty-his.entity";
import { InventoryProductVolumeDiscountVariantQty } from "./domain/entities/inventory-product-volume-discount-variant-qty.entity";
// Inventory module entities
import { InventoryProductByVariantHistory } from "../inventory/domain/entities/inventory-product-by-variant-history.entity";
import { InventoryProductByVariant } from "../inventory/domain/entities/inventory-product-by-variant.entity";
import { InventoryProductSelectedVariant } from "../inventory/domain/entities/inventory-product-selected-variant.entity";
import { InventoryProduct } from "../inventory/domain/entities/inventory-product.entity";
import { InventoryPriceService } from "./applications/services/inventory-price.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
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
      // Inventory module entities
      InventoryProduct,
      InventoryProductSelectedVariant,
      InventoryProductByVariant,
      InventoryProductByVariantHistory,
      // ...existing entities if any...
    ]),
    PaginationModule,
    TransformersModule,
  ],
  providers: [InventoryPriceRepository, InventoryPriceService],
  controllers: [InventoryPriceController],
  exports: [InventoryPriceRepository],
})
export class InventoryPriceModule {}
