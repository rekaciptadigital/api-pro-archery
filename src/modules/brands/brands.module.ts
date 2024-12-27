import { PaginationModule } from "@/common/pagination/pagination.module";
import { TransformersModule } from "@/common/transformers/transformers.module";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BrandService } from "./application/services/brand.service";
import { Brand } from "./domain/entities/brand.entity";
import { BrandRepository } from "./domain/repositories/brand.repository";
import { BrandValidator } from "./domain/validators/brand.validator";
import { BrandController } from "./presentation/controllers/brand.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([Brand]),
    PaginationModule,
    TransformersModule,
  ],
  providers: [BrandRepository, BrandValidator, BrandService],
  controllers: [BrandController],
  exports: [BrandRepository],
})
export class BrandsModule {}
