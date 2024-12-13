import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Brand } from './domain/entities/brand.entity';
import { BrandRepository } from './domain/repositories/brand.repository';
import { BrandService } from './application/services/brand.service';
import { BrandController } from './presentation/controllers/brand.controller';
import { BrandValidator } from './domain/validators/brand.validator';
import { PaginationModule } from '@/common/pagination/pagination.module';
import { TransformersModule } from '@/common/transformers/transformers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Brand]),
    PaginationModule,
    TransformersModule
  ],
  providers: [
    BrandRepository,
    BrandService,
    BrandValidator
  ],
  controllers: [BrandController],
  exports: [BrandRepository],
})
export class BrandsModule {}