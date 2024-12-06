import { Injectable } from '@nestjs/common';
import { FeatureRepository } from '../repositories/feature.repository';
import { FeatureException } from '../exceptions/feature.exception';
import { HttpStatus } from '@nestjs/common';

@Injectable()
export class FeatureValidator {
  constructor(private readonly featureRepository: FeatureRepository) {}

  async validateName(name: string): Promise<void> {
    if (!name || name.trim().length === 0) {
      throw new FeatureException('Feature name cannot be empty');
    }

    const existingFeature = await this.featureRepository.findByNameCaseInsensitive(name);

    if (existingFeature && !existingFeature.deleted_at) {
      throw new FeatureException(
        'A feature with this name already exists (case-insensitive match)',
        HttpStatus.CONFLICT
      );
    }
  }

  async validateForOperation(name: string, excludeId?: number): Promise<void> {
    const existingFeature = await this.featureRepository.findByNameCaseInsensitive(name);

    if (existingFeature && !existingFeature.deleted_at && existingFeature.id !== excludeId) {
      throw new FeatureException(
        'An active feature with this name already exists (case-insensitive match). Please delete it first.',
        HttpStatus.CONFLICT
      );
    }
  }
}