import { AddStatusToInventoryVariants1702432800010 } from "@/migrations/1702432800010-add-status-to-inventory-variants";
import { AddStatusAndUserIdToInventoryProductVariants1702432800011 } from "@/migrations/1702432800011-AddStatusAndUserIdToInventoryProductVariants";
import { AlterUserSessionIdType1702432800012 } from "@/migrations/1702432800012-alter-user-session-id-type";
import { AlterAuthTokenIdType1702432800013 } from "@/migrations/1702432800013-alter-auth-token-id-type";
import { AddSkuVendorToInventoryProductVariants1702432800014 } from "@/migrations/1702432800014-AddSkuVendorToInventoryProductVariants";
import { CreateInventoryPriceTables1702432900000 } from "@/migrations/1702432900000-CreateInventoryPriceTables";
import { InventoryLocation } from "@/modules/inventory-locations/domain/entities/inventory-location.entity";
import { InventoryProductByVariantPriceHistory } from "@/modules/inventory-price/domain/entities/inventory-product-by-variant-price-history.entity";
import { InventoryProductByVariantPrice } from "@/modules/inventory-price/domain/entities/inventory-product-by-variant-price.entity";
import { InventoryProductCustomerCategoryPrice } from "@/modules/inventory-price/domain/entities/inventory-product-customer-category-price.entity";
import { InventoryProductGlobalDiscountHistory } from "@/modules/inventory-price/domain/entities/inventory-product-global-discount-history.entity";
import { InventoryProductGlobalDiscountPriceCategoryHistory } from "@/modules/inventory-price/domain/entities/inventory-product-global-discount-price-category-history.entity";
import { InventoryProductGlobalDiscountPriceCategory } from "@/modules/inventory-price/domain/entities/inventory-product-global-discount-price-category.entity";
import { InventoryProductGlobalDiscount } from "@/modules/inventory-price/domain/entities/inventory-product-global-discount.entity";
import { InventoryProductPricingInformationHistory } from "@/modules/inventory-price/domain/entities/inventory-product-pricing-information-history.entity";
import { InventoryProductPricingInformation } from "@/modules/inventory-price/domain/entities/inventory-product-pricing-information.entity";
import { InventoryProductVolumeDiscountVariantHistory } from "@/modules/inventory-price/domain/entities/inventory-product-volume-discount-variant-history.entity";
import { InventoryProductVolumeDiscountVariantPriceCategoryHistory } from "@/modules/inventory-price/domain/entities/inventory-product-volume-discount-variant-price-category-history.entity";
import { InventoryProductVolumeDiscountVariantPriceCategory } from "@/modules/inventory-price/domain/entities/inventory-product-volume-discount-variant-price-category.entity";
import { InventoryProductVolumeDiscountVariant } from "@/modules/inventory-price/domain/entities/inventory-product-volume-discount-variant.entity";
import { InventoryProductByVariantHistory } from "@/modules/inventory/domain/entities/inventory-product-by-variant-history.entity";
import { InventoryProductByVariant } from "@/modules/inventory/domain/entities/inventory-product-by-variant.entity";
import { InventoryProductCategory } from "@/modules/inventory/domain/entities/inventory-product-category.entity";
import { InventoryProductSelectedVariantValue } from "@/modules/inventory/domain/entities/inventory-product-selected-variant-value.entity";
import { InventoryProductSelectedVariant } from "@/modules/inventory/domain/entities/inventory-product-selected-variant.entity";
import { InventoryProduct } from "@/modules/inventory/domain/entities/inventory-product.entity";
import { PriceCategory } from "@/modules/price-categories/domain/entities/price-category.entity";
import { ProductCategory } from "@/modules/product-categories/domain/entities/product-category.entity";
import { config } from "dotenv";
import { DataSource, DataSourceOptions } from "typeorm";
import { CreateInitialSchema1701234567890 } from "../migrations/1701234567890-CreateInitialSchema";
import { CreateUserRolesTable1701234567891 } from "../migrations/1701234567891-CreateUserRolesTable";
import { AddStatusToRolesAndFeatures1701234567892 } from "../migrations/1701234567892-AddStatusToRolesAndFeatures";
import { CreateAuthEntities1701234567893 } from "../migrations/1701234567893-CreateAuthEntities";
import { CreateBrandsTable1702432800000 } from "../migrations/1702432800000-CreateBrandsTable";
import { CreateTaxesTable1702432800001 } from "../migrations/1702432800001-CreateTaxesTable";
import { CreateVariantsTable1702432800002 } from "../migrations/1702432800002-CreateVariantsTable";
import { CreateProductTypesTable1702432800004 } from "../migrations/1702432800004-CreateProductTypesTable";
import { CreatePriceCategoriesTable1702432800005 } from "../migrations/1702432800005-CreatePriceCategoriesTable";
import { CreateProductCategoriesTable1702432800006 } from "../migrations/1702432800006-CreateProductCategoriesTable";
import { CreateInventoryProductTables1702432800007 } from "../migrations/1702432800007-CreateInventoryProductTables";
import { AddSetDefaultToPriceCategories1702432800008 } from "../migrations/1702432800008-AddSetDefaultToPriceCategories";
import { CreateInventoryLocationsTable1702432800009 } from "../migrations/1702432800009-CreateInventoryLocationsTable";
import { ApiEndpoint } from "../modules/auth/domain/entities/api-endpoint.entity";
import { AuthToken } from "../modules/auth/domain/entities/auth-token.entity";
import { MenuPermission } from "../modules/auth/domain/entities/menu-permission.entity";
import { UserSession } from "../modules/auth/domain/entities/user-session.entity";
import { Brand } from "../modules/brands/domain/entities/brand.entity";
import { Feature } from "../modules/features/domain/entities/feature.entity";
import { RoleFeaturePermission } from "../modules/permissions/domain/entities/role-feature-permission.entity";
import { ProductType } from "../modules/product-types/domain/entities/product-type.entity";
import { Role } from "../modules/roles/domain/entities/role.entity";
import { Tax } from "../modules/taxes/domain/entities/tax.entity";
import { UserRole } from "../modules/user-roles/domain/entities/user-role.entity";
import { User } from "../modules/users/domain/entities/user.entity";
import { VariantValue } from "../modules/variants/domain/entities/variant-value.entity";
import { Variant } from "../modules/variants/domain/entities/variant.entity";

config();

const options: DataSourceOptions = {
  type: "postgres",
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || "5432"),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [
    User,
    Role,
    Feature,
    RoleFeaturePermission,
    UserRole,
    AuthToken,
    UserSession,
    ApiEndpoint,
    MenuPermission,
    Brand,
    Tax,
    Variant,
    VariantValue,
    ProductType,
    PriceCategory,
    ProductCategory,
    InventoryProduct,
    InventoryProductCategory,
    InventoryProductSelectedVariant,
    InventoryProductSelectedVariantValue,
    InventoryProductByVariant,
    InventoryProductByVariantHistory,
    InventoryLocation,
    InventoryProductPricingInformation,
    InventoryProductCustomerCategoryPrice,
    InventoryProductByVariantPrice,
    InventoryProductPricingInformationHistory,
    InventoryProductByVariantPriceHistory,
    InventoryProductGlobalDiscount,
    InventoryProductGlobalDiscountPriceCategory,
    InventoryProductGlobalDiscountHistory,
    InventoryProductGlobalDiscountPriceCategoryHistory,
    InventoryProductVolumeDiscountVariant,
    InventoryProductVolumeDiscountVariantHistory,
    InventoryProductVolumeDiscountVariantPriceCategory,
    InventoryProductVolumeDiscountVariantPriceCategoryHistory,
  ],
  migrations: [
    CreateInitialSchema1701234567890,
    CreateUserRolesTable1701234567891,
    AddStatusToRolesAndFeatures1701234567892,
    CreateAuthEntities1701234567893,
    CreateBrandsTable1702432800000,
    CreateTaxesTable1702432800001,
    CreateVariantsTable1702432800002,
    CreateProductTypesTable1702432800004,
    CreatePriceCategoriesTable1702432800005,
    CreateProductCategoriesTable1702432800006,
    CreateInventoryProductTables1702432800007,
    AddSetDefaultToPriceCategories1702432800008,
    CreateInventoryLocationsTable1702432800009,
    AddStatusToInventoryVariants1702432800010,
    AddStatusAndUserIdToInventoryProductVariants1702432800011,
    AlterUserSessionIdType1702432800012,
    AlterAuthTokenIdType1702432800013,
    AddSkuVendorToInventoryProductVariants1702432800014,
    CreateInventoryPriceTables1702432900000,
  ],
  synchronize: false,
};

const dataSource = new DataSource(options);

export default dataSource;
