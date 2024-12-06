import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Feature } from './domain/entities/feature.entity';
import { FeatureRepository } from './domain/repositories/feature.repository';
import { FeatureService } from './application/services/feature.service';
import { FeatureController } from './presentation/controllers/feature.controller';
import { FeatureValidator } from './domain/validators/feature.validator';
import { PaginationModule } from '../../common/pagination/pagination.module';
import { TransformersModule } from '../../common/transformers/transformers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Feature]),
    PaginationModule,
    TransformersModule
  ],
  providers: [
    FeatureRepository, 
    FeatureService,
    FeatureValidator
  ],
  controllers: [FeatureController],
  exports: [FeatureRepository],
})
export class FeaturesModule {}