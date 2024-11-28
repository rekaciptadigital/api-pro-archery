import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Feature } from './domain/entities/feature.entity';
import { FeatureRepository } from './domain/repositories/feature.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Feature])],
  providers: [FeatureRepository],
  exports: [FeatureRepository],
})
export class FeaturesModule {}