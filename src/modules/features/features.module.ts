import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Feature } from './domain/entities/feature.entity';
import { FeatureRepository } from './domain/repositories/feature.repository';
import { FeatureService } from './application/services/feature.service';
import { FeatureController } from './presentation/controllers/feature.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Feature])],
  providers: [FeatureRepository, FeatureService],
  controllers: [FeatureController],
  exports: [FeatureRepository],
})
export class FeaturesModule {}