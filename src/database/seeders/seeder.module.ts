import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import configuration from "../../config/configuration";
import { validate } from "../../config/env.validation";
import { PasswordService } from "../../modules/auth/application/services/password.service";
import { Feature } from "../../modules/features/domain/entities/feature.entity";
import { RoleFeaturePermission } from "../../modules/permissions/domain/entities/role-feature-permission.entity";
import { Role } from "../../modules/roles/domain/entities/role.entity";
import { UserRole } from "../../modules/user-roles/domain/entities/user-role.entity";
import { User } from "../../modules/users/domain/entities/user.entity";
import { DatabaseSeeder } from "./database.seeder";
import { FeatureSeeder } from "./feature.seeder";
import { PermissionSeeder } from "./permission.seeder";
import { RoleSeeder } from "./role.seeder";
import { UserSeeder } from "./user.seeder";

// Auth entities
import { ApiEndpoint } from "../../modules/auth/domain/entities/api-endpoint.entity";
import { AuthToken } from "../../modules/auth/domain/entities/auth-token.entity";
import { MenuPermission } from "../../modules/auth/domain/entities/menu-permission.entity";
import { UserSession } from "../../modules/auth/domain/entities/user-session.entity";

// Brand entities
import { Brand } from "../../modules/brands/domain/entities/brand.entity";

// Price Category entities
import { PriceCategory } from "../../modules/price-categories/domain/entities/price-category.entity";

// Product Category entities
import { ProductCategory } from "../../modules/product-categories/domain/entities/product-category.entity";

// Product Type entities
import { ProductType } from "../../modules/product-types/domain/entities/product-type.entity";

// Tax entities
import { Tax } from "../../modules/taxes/domain/entities/tax.entity";

// Variant entities
import { VariantValue } from "../../modules/variants/domain/entities/variant-value.entity";
import { Variant } from "../../modules/variants/domain/entities/variant.entity";

// Inventory Location entities
import { InventoryLocation } from "../../modules/inventory-locations/domain/entities/inventory-location.entity";

// Inventory entities
import { InventoryProductByVariantHistory } from "../../modules/inventory/domain/entities/inventory-product-by-variant-history.entity";
import { InventoryProductByVariant } from "../../modules/inventory/domain/entities/inventory-product-by-variant.entity";
import { InventoryProductCategory } from "../../modules/inventory/domain/entities/inventory-product-category.entity";
import { InventoryProductSelectedVariantValue } from "../../modules/inventory/domain/entities/inventory-product-selected-variant-value.entity";
import { InventoryProductSelectedVariant } from "../../modules/inventory/domain/entities/inventory-product-selected-variant.entity";
import { InventoryProduct } from "../../modules/inventory/domain/entities/inventory-product.entity";

// Inventory-price entities
import { InventoryProductByVariantPriceHistory } from "../../modules/inventory-price/domain/entities/inventory-product-by-variant-price-history.entity";
import { InventoryProductByVariantPrice } from "../../modules/inventory-price/domain/entities/inventory-product-by-variant-price.entity";
import { InventoryProductCustomerCategoryPriceHistory } from "../../modules/inventory-price/domain/entities/inventory-product-customer-category-price-history.entity";
import { InventoryProductCustomerCategoryPrice } from "../../modules/inventory-price/domain/entities/inventory-product-customer-category-price.entity";
import { InventoryProductGlobalDiscountHistory } from "../../modules/inventory-price/domain/entities/inventory-product-global-discount-history.entity";
import { InventoryProductGlobalDiscountPriceCategoryHistory } from "../../modules/inventory-price/domain/entities/inventory-product-global-discount-price-category-history.entity";
import { InventoryProductGlobalDiscountPriceCategory } from "../../modules/inventory-price/domain/entities/inventory-product-global-discount-price-category.entity";
import { InventoryProductGlobalDiscount } from "../../modules/inventory-price/domain/entities/inventory-product-global-discount.entity";
import { InventoryProductPricingInformationHistory } from "../../modules/inventory-price/domain/entities/inventory-product-pricing-information-history.entity";
import { InventoryProductPricingInformation } from "../../modules/inventory-price/domain/entities/inventory-product-pricing-information.entity";
import { InventoryProductVolumeDiscountVariantHistory } from "../../modules/inventory-price/domain/entities/inventory-product-volume-discount-variant-history.entity";
import { InventoryProductVolumeDiscountVariantPriceCatHis } from "../../modules/inventory-price/domain/entities/inventory-product-volume-discount-variant-price-cat-his.entity";
import { InventoryProductVolumeDiscountVariantPriceCategory } from "../../modules/inventory-price/domain/entities/inventory-product-volume-discount-variant-price-category.entity";
import { InventoryProductVolumeDiscountVariant } from "../../modules/inventory-price/domain/entities/inventory-product-volume-discount-variant.entity";
import { InventoryProductVolumeDiscountVariantQtyHis } from "../../modules/inventory-price/domain/entities/inventory-product-volume-discount-variant-qty-his.entity";
import { InventoryProductVolumeDiscountVariantQty } from "../../modules/inventory-price/domain/entities/inventory-product-volume-discount-variant-qty.entity";
import { InventoryProductPriceSeeder } from "./inventory-product-price.seeder";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        host: configService.get("database.host"),
        port: configService.get("database.port"),
        username: configService.get("database.user"),
        password: configService.get("database.password"),
        database: configService.get("database.name"),
        entities: [
          // Auth & User Management
          Role,
          User,
          UserRole,
          Feature,
          RoleFeaturePermission,
          AuthToken,
          UserSession,
          ApiEndpoint,
          MenuPermission,

          // Product Management
          Brand,
          PriceCategory,
          ProductCategory,
          ProductType,
          Tax,
          Variant,
          VariantValue,

          // Inventory Management
          InventoryLocation,
          InventoryProduct,
          InventoryProductCategory,
          InventoryProductSelectedVariant,
          InventoryProductSelectedVariantValue,
          InventoryProductByVariant,
          InventoryProductByVariantHistory,

          // Inventory Price Management
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
        ],
        synchronize: false,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([
      // Auth & User Management
      Role,
      User,
      UserRole,
      Feature,
      RoleFeaturePermission,
      AuthToken,
      UserSession,
      ApiEndpoint,
      MenuPermission,

      // Product Management
      Brand,
      PriceCategory,
      ProductCategory,
      ProductType,
      Tax,
      Variant,
      VariantValue,

      // Inventory Management
      InventoryLocation,
      InventoryProduct,
      InventoryProductCategory,
      InventoryProductSelectedVariant,
      InventoryProductSelectedVariantValue,
      InventoryProductByVariant,
      InventoryProductByVariantHistory,

      // Inventory Price Management
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
    ]),
  ],
  providers: [
    DatabaseSeeder,
    RoleSeeder,
    UserSeeder,
    FeatureSeeder,
    PermissionSeeder,
    PasswordService,
    InventoryProductPriceSeeder,
  ],
  exports: [DatabaseSeeder],
})
export class SeederModule {}
