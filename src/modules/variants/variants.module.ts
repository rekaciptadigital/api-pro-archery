import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Variant } from './domain/entities/variant.entity';
import { VariantValue } from './domain/entities/variant-value.entity';
import { VariantRepository } from './domain/repositories/variant.repository';
import { VariantService } from './application/services/variant.service';
import { VariantController } from './presentation/controllers/variant.controller';
import { VariantValidator } from './domain/validators/variant.validator';
import { PaginationModule } from '@/common/pagination/pagination.module';
import { TransformersModule } from '@/common/transformers/transformers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Variant, VariantValue]),
    PaginationModule,
    TransformersModule
  ],
  providers: [
    VariantRepository,
    VariantService,
    VariantValidator
  ],
  controllers: [VariantController],
  exports: [VariantRepository],
})
export class VariantsModule {}