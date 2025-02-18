import { PaginationModule } from "@/common/pagination/pagination.module";
import { TransformersModule } from "@/common/transformers/transformers.module";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { InventoryProductService } from "./application/services/inventory-product.service";
import { InventoryProductByVariantHistory } from "./domain/entities/inventory-product-by-variant-history.entity";
import { InventoryProductByVariant } from "./domain/entities/inventory-product-by-variant.entity";
import { InventoryProductCategory } from "./domain/entities/inventory-product-category.entity";
import { InventoryProductSelectedVariantValue } from "./domain/entities/inventory-product-selected-variant-value.entity";
import { InventoryProductSelectedVariant } from "./domain/entities/inventory-product-selected-variant.entity";
import { InventoryProduct } from "./domain/entities/inventory-product.entity";
import { InventoryProductRepository } from "./domain/repositories/inventory-product.repository";
import { InventoryProductController } from "./presentation/controllers/inventory-product.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InventoryProduct,
      InventoryProductCategory,
      InventoryProductSelectedVariant,
      InventoryProductSelectedVariantValue,
      InventoryProductByVariant,
      InventoryProductByVariantHistory,
    ]),
    PaginationModule,
    TransformersModule,
  ],
  providers: [InventoryProductRepository, InventoryProductService],
  controllers: [InventoryProductController],
  exports: [InventoryProductRepository],
})
export class InventoryModule {}
