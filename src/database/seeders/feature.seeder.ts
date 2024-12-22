import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feature } from '../../modules/features/domain/entities/feature.entity';
import { Logger } from '@nestjs/common';

@Injectable()
export class FeatureSeeder {
  private readonly logger = new Logger(FeatureSeeder.name);

  constructor(
    @InjectRepository(Feature)
    private readonly featureRepository: Repository<Feature>
  ) {}

  async createMany(): Promise<void> {
    try {
      const features = [
        {
          name: 'Brands Management',
          description: 'Manage product brands',
          status: true
        },
        {
          name: 'Taxes Management',
          description: 'Manage tax rates',
          status: true
        },
        {
          name: 'Variants Management',
          description: 'Manage product variants',
          status: true
        }
      ];

      for (const feature of features) {
        const existingFeature = await this.featureRepository.findOne({
          where: { name: feature.name }
        });

        if (!existingFeature) {
          await this.featureRepository.save(feature);
          this.logger.log(`Created feature: ${feature.name}`);
        } else {
          this.logger.log(`Feature already exists: ${feature.name}`);
        }
      }
    } catch (error) {
      this.logger.error('Error seeding features:', error);
      throw error;
    }
  }
}