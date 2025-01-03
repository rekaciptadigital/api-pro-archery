import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PriceCategory } from './domain/entities/price-category.entity';
import { PriceCategoryRepository } from './domain/repositories/price-category.repository';
import { PriceCategoryService } from './application/services/price-category.service';
import { PriceCategoryController } from './presentation/controllers/price-category.controller';
import { TransformersModule } from '@/common/transformers/transformers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PriceCategory]),
    TransformersModule
  ],
  providers: [
    PriceCategoryRepository,
    PriceCategoryService
  ],
  controllers: [PriceCategoryController],
  exports: [PriceCategoryRepository],
})
export class PriceCategoriesModule {}