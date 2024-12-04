import { Injectable, NotFoundException } from '@nestjs/common';
import { FeatureRepository } from '../../domain/repositories/feature.repository';
import { CreateFeatureDto, UpdateFeatureDto, UpdateFeatureStatusDto } from '../dtos/feature.dto';
import { PaginationHelper } from '../../../../common/pagination/helpers/pagination.helper';
import { PaginationQueryDto } from '../../../../common/pagination/dto/pagination-query.dto';
import { IsNull } from 'typeorm';

@Injectable()
export class FeatureService {
  constructor(
    private readonly featureRepository: FeatureRepository,
    private readonly paginationHelper: PaginationHelper,
  ) {}

  async create(createFeatureDto: CreateFeatureDto) {
    const feature = await this.featureRepository.create(createFeatureDto);
    return {
      id: feature.id,
      name: feature.name,
      description: feature.description,
      status: feature.status,
    };
  }

  async findAll(query: PaginationQueryDto) {
    const { skip, take } = this.paginationHelper.getSkipTake(query.page, query.limit);
    
    const [features, total] = await this.featureRepository.findAndCount({
      skip,
      take,
      order: { created_at: 'DESC' },
      where: {
        deleted_at: IsNull()
      }
    });

    return this.paginationHelper.paginate(features.map(feature => ({
      id: feature.id,
      name: feature.name,
      description: feature.description,
      status: feature.status,
      created_at: feature.created_at,
      updated_at: feature.updated_at
    })), {
      serviceName: 'features',
      totalItems: total,
      page: query.page,
      limit: query.limit,
    });
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