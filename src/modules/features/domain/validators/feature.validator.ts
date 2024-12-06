import { Injectable } from '@nestjs/common';
import { FeatureRepository } from '../repositories/feature.repository';
import { FeatureException } from '../exceptions/feature.exception';
import { HttpStatus } from '@nestjs/common';

@Injectable()
export class FeatureValidator {
  constructor(private readonly featureRepository: FeatureRepository) {}

  async validateName(name: string): Promise<void> {
    await this.validateNameNotEmpty(name);
    await this.validateNameUnique(name);
  }

  async validateForOperation(name: string, excludeId?: number): Promise<void> {
    await this.validateNameNotEmpty(name);
    await this.validateNameUniqueForUpdate(name, excludeId);
  }

  private async validateNameNotEmpty(name: string): Promise<void> {
    if (!name || name.trim().length === 0) {
      throw new FeatureException('Feature name cannot be empty');
    }
  }

  private async validateNameUnique(name: string): Promise<void> {
    const existingFeature = await this.featureRepository.findByNameCaseInsensitive(name);

    if (existingFeature) {
      throw new FeatureException(
        'A feature with this name already exists (case-insensitive match)',
        HttpStatus.CONFLICT
      );
    }
  }

  private async validateNameUniqueForUpdate(name: string, excludeId?: number): Promise<void> {
    const existingFeature = await this.featureRepository.findByNameCaseInsensitive(name);

    if (existingFeature && existingFeature.id !== excludeId) {
      throw new FeatureException(
        'Another feature with this name already exists (case-insensitive match)',
        HttpStatus.CONFLICT
      );
    }
  }
}