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
import { Feature } from "../modules/features/domain/entities/feature.entity";
import { RoleFeaturePermission } from "../modules/permissions/domain/entities/role-feature-permission.entity";
import { Role } from "../modules/roles/domain/entities/role.entity";
import { UserRole } from "../modules/user-roles/domain/entities/user-role.entity";
import { User } from "../modules/users/domain/entities/user.entity";
import { AuthToken } from "../modules/auth/domain/entities/auth-token.entity";
import { UserSession } from "../modules/auth/domain/entities/user-session.entity";
import { ApiEndpoint } from "../modules/auth/domain/entities/api-endpoint.entity";
import { MenuPermission } from "../modules/auth/domain/entities/menu-permission.entity";
import { Brand } from "../modules/brands/domain/entities/brand.entity";
import { Tax } from "../modules/taxes/domain/entities/tax.entity";
import { Variant } from "../modules/variants/domain/entities/variant.entity";
import { VariantValue } from "../modules/variants/domain/entities/variant-value.entity";
import { ProductType } from "../modules/product-types/domain/entities/product-type.entity";
import { CreatePriceCategoriesTable1702432800005 } from "@/migrations/1702432800005-CreatePriceCategoriesTable";
import { CreateProductCategoriesTable1702432800006 } from "@/migrations/1702432800006-CreateProductCategoriesTable";
import { PriceCategory } from "@/modules/price-categories/domain/entities/price-category.entity";
import { ProductCategory } from "@/modules/product-categories/domain/entities/product-category.entity";

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
  ],
  synchronize: false,
};

const dataSource = new DataSource(options);

export default dataSource;
