import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductType } from './domain/entities/product-type.entity';
import { ProductTypeRepository } from './domain/repositories/product-type.repository';
import { ProductTypeService } from './application/services/product-type.service';
import { ProductTypeController } from './presentation/controllers/product-type.controller';
import { ProductTypeValidator } from './domain/validators/product-type.validator';
import { PaginationModule } from '@/common/pagination/pagination.module';
import { TransformersModule } from '@/common/transformers/transformers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductType]),
    PaginationModule,
    TransformersModule
  ],
  providers: [
    ProductTypeRepository,
    ProductTypeService,
    ProductTypeValidator
  ],
  controllers: [ProductTypeController],
  exports: [ProductTypeRepository],
})
export class ProductTypesModule {}