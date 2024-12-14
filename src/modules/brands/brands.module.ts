import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Brand } from './domain/entities/brand.entity';
import { BrandRepository } from './domain/repositories/brand.repository';
import { BrandListService } from './application/services/brand-list.service';
import { BrandController } from './presentation/controllers/brand.controller';
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
    BrandListService
  ],
  controllers: [BrandController],
  exports: [BrandRepository],
})
export class BrandsModule {}