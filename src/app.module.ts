import { Module, MiddlewareConsumer, NestModule } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { UsersModule } from "./modules/users/users.module";
import { RolesModule } from "./modules/roles/roles.module";
import { FeaturesModule } from "./modules/features/features.module";
import { PermissionsModule } from "./modules/permissions/permissions.module";
import { UserRolesModule } from "./modules/user-roles/user-roles.module";
import { AuthModule } from "./modules/auth/auth.module";
import { CommonModule } from "./common/common.module";
import { TransformersModule } from "./common/transformers/transformers.module";
import { CorsMiddleware } from "./middleware/cors.middleware";
import { SwaggerAuthMiddleware } from "./common/middleware/swagger-auth.middleware";
import { JwtAuthGuard } from "./modules/auth/domain/guards/jwt-auth.guard";
import { PermissionGuard } from "./modules/auth/domain/guards/permission.guard";
import configuration from "./config/configuration";
import { validate } from "./config/env.validation";

@Module({
  imports: [
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
        migrationsRun: true,
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    RolesModule,
    FeaturesModule,
    PermissionsModule,
    UserRolesModule,
    AuthModule,
    CommonModule,
    TransformersModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorsMiddleware).forRoutes('*');
    consumer.apply(SwaggerAuthMiddleware).forRoutes('api/docs', 'api/docs-json');
  }
}