import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryLocation } from './domain/entities/inventory-location.entity';
import { InventoryLocationRepository } from './domain/repositories/inventory-location.repository';
import { InventoryLocationService } from './application/services/inventory-location.service';
import { InventoryLocationController } from './presentation/controllers/inventory-location.controller';
import { InventoryLocationValidator } from './domain/validators/inventory-location.validator';
import { PaginationModule } from '@/common/pagination/pagination.module';
import { TransformersModule } from '@/common/transformers/transformers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([InventoryLocation]),
    PaginationModule,
    TransformersModule
  ],
  providers: [
    InventoryLocationRepository,
    InventoryLocationService,
    InventoryLocationValidator
  ],
  controllers: [InventoryLocationController],
  exports: [InventoryLocationRepository],
})
export class InventoryLocationsModule {}