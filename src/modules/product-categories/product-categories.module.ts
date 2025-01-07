import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductCategory } from './domain/entities/product-category.entity';
import { ProductCategoryRepository } from './domain/repositories/product-category.repository';
import { ProductCategoryService } from './application/services/product-category.service';
import { ProductCategoryController } from './presentation/controllers/product-category.controller';
import { ProductCategoryValidator } from './domain/validators/product-category.validator';
import { PaginationModule } from '@/common/pagination/pagination.module';
import { TransformersModule } from '@/common/transformers/transformers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductCategory]),
    PaginationModule,
    TransformersModule
  ],
  providers: [
    ProductCategoryRepository,
    ProductCategoryService,
    ProductCategoryValidator
  ],
  controllers: [ProductCategoryController],
  exports: [ProductCategoryRepository],
})
export class ProductCategoriesModule {}