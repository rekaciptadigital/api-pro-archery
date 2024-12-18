import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tax } from './domain/entities/tax.entity';
import { TaxRepository } from './domain/repositories/tax.repository';
import { TaxService } from './application/services/tax.service';
import { TaxController } from './presentation/controllers/tax.controller';
import { TaxValidator } from './domain/validators/tax.validator';
import { PaginationModule } from '@/common/pagination/pagination.module';
import { TransformersModule } from '@/common/transformers/transformers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tax]),
    PaginationModule,
    TransformersModule
  ],
  providers: [
    TaxRepository,
    TaxService,
    TaxValidator
  ],
  controllers: [TaxController],
  exports: [TaxRepository],
})
export class TaxesModule {}