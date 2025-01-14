import { Module, MiddlewareConsumer, NestModule } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

// Feature Modules
import { UsersModule } from "@/modules/users/users.module";
import { RolesModule } from "@/modules/roles/roles.module";
import { FeaturesModule } from "@/modules/features/features.module";
import { PermissionsModule } from "@/modules/permissions/permissions.module";
import { UserRolesModule } from "@/modules/user-roles/user-roles.module";
import { AuthModule } from "@/modules/auth/auth.module";
import { BrandsModule } from "@/modules/brands/brands.module";
import { TaxesModule } from "@/modules/taxes/taxes.module";
import { VariantsModule } from "@/modules/variants/variants.module";
import { ProductTypesModule } from "@/modules/product-types/product-types.module";
import { PriceCategoriesModule } from "@/modules/price-categories/price-categories.module";
import { ProductCategoriesModule } from "@/modules/product-categories/product-categories.module";
import { InventoryModule } from "@/modules/inventory/inventory.module";

// Common Modules
import { CommonModule } from "@/common/common.module";
import { TransformersModule } from "@/common/transformers/transformers.module";

// Middleware
import { CorsMiddleware } from "@/middleware/cors.middleware";
import { SwaggerAuthMiddleware } from "@/common/middleware/swagger-auth.middleware";

// Guards
import { JwtAuthGuard } from "@/modules/auth/domain/guards/jwt-auth.guard";

// Config
import configuration from "@/config/configuration";
import { validate } from "@/config/env.validation";

@Module({
  imports: [
    // Core Modules
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate,
    }),
    ThrottlerModule.forRoot([{
      ttl: 60,
      limit: 100,
    }]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        host: configService.get("database.host"),
        port: configService.get("database.port"),
        username: configService.get("database.user"),
        password: configService.get("database.password"),
        database: configService.get("database.name"),
        entities: [__dirname + "/**/*.entity{.ts,.js}"],
        synchronize: false,
        ssl: false,
        migrations: [__dirname + "/migrations/**/*{.ts,.js}"],
        migrationsRun: false,
      }),
      inject: [ConfigService],
    }),

    // Feature Modules
    UsersModule,
    RolesModule,
    FeaturesModule,
    PermissionsModule,
    UserRolesModule,
    AuthModule,
    BrandsModule,
    TaxesModule,
    VariantsModule,
    ProductTypesModule,
    PriceCategoriesModule,
    ProductCategoriesModule,
    InventoryModule,

    // Common Modules
    CommonModule,
    TransformersModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    }
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorsMiddleware).forRoutes('*');
    consumer.apply(SwaggerAuthMiddleware).forRoutes('api/docs', 'api/docs-json');
  }
}