import { Injectable, NotFoundException } from '@nestjs/common';
import { FeatureRepository } from '../../domain/repositories/feature.repository';
import { CreateFeatureDto, UpdateFeatureDto, UpdateFeatureStatusDto } from '../dtos/feature.dto';

@Injectable()
export class FeatureService {
  constructor(private readonly featureRepository: FeatureRepository) {}

  async create(createFeatureDto: CreateFeatureDto) {
    const feature = await this.featureRepository.create(createFeatureDto);
    return {
      id: feature.id,
      name: feature.name,
      description: feature.description,
      status: feature.status,
    };
  }

  async findAll() {
    const features = await this.featureRepository.findAll();
    return features.map(feature => ({
      id: feature.id,
      name: feature.name,
      description: feature.description,
      status: feature.status,
    }));
  }

  async findOne(id: number) {
    const feature = await this.featureRepository.findById(id);
    if (!feature) {
      throw new NotFoundException('Feature not found');
    }
    return {
      id: feature.id,
      name: feature.name,
      description: feature.description,
      status: feature.status,
    };
  }

  async update(id: number, updateFeatureDto: UpdateFeatureDto) {
    const feature = await this.featureRepository.findById(id);
    if (!feature) {
      throw new NotFoundException('Feature not found');
    }
    await this.featureRepository.update(id, updateFeatureDto);
  }

  async updateStatus(id: number, updateStatusDto: UpdateFeatureStatusDto) {
    const feature = await this.featureRepository.findById(id);
    if (!feature) {
      throw new NotFoundException('Feature not found');
    }
    await this.featureRepository.update(id, updateStatusDto);
  }

  async remove(id: number) {
    const feature = await this.featureRepository.findById(id);
    if (!feature) {
      throw new NotFoundException('Feature not found');
    }
    await this.featureRepository.softDelete(id);
  }
}