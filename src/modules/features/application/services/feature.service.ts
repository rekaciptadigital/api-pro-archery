import { Injectable, NotFoundException } from '@nestjs/common';
import { FeatureRepository } from '../../domain/repositories/feature.repository';
import { CreateFeatureDto, UpdateFeatureDto, UpdateFeatureStatusDto } from '../dtos/feature.dto';
import { PaginationHelper } from '../../../../common/pagination/helpers/pagination.helper';
import { PaginationQueryDto } from '../../../../common/pagination/dto/pagination-query.dto';
import { ResponseTransformer } from '../../../../common/transformers/response.transformer';
import { IsNull } from 'typeorm';

@Injectable()
export class FeatureService {
  constructor(
    private readonly featureRepository: FeatureRepository,
    private readonly paginationHelper: PaginationHelper,
    private readonly responseTransformer: ResponseTransformer,
  ) {}

  async create(createFeatureDto: CreateFeatureDto) {
    const feature = await this.featureRepository.create({
      ...createFeatureDto,
      status: createFeatureDto.status ?? true,
    });
    return this.responseTransformer.transform(feature);
  }

  async findAll(query: PaginationQueryDto) {
    const { skip, take } = this.paginationHelper.getSkipTake(query.page, query.limit);
    const [features, total] = await this.featureRepository.findAndCount({
      where: { deleted_at: IsNull() },
      skip,
      take,
      order: { created_at: 'DESC' },
    });

    const paginationData = this.paginationHelper.generatePaginationData({
      serviceName: 'features',
      totalItems: total,
      page: query.page,
      limit: query.limit,
    });

    return this.responseTransformer.transformPaginated(
      features,
      total,
      query.page || 1,
      query.limit || 10,
      paginationData.links
    );
  }

  async findOne(id: number) {
    const feature = await this.featureRepository.findById(id);
    if (!feature) {
      throw new NotFoundException('Feature not found');
    }
    return this.responseTransformer.transform(feature);
  }

  async update(id: number, updateFeatureDto: UpdateFeatureDto) {
    const feature = await this.featureRepository.findById(id);
    if (!feature) {
      throw new NotFoundException('Feature not found');
    }
    await this.featureRepository.update(id, updateFeatureDto);
    return this.responseTransformer.transform({ message: 'Feature updated successfully' });
  }

  async updateStatus(id: number, updateStatusDto: UpdateFeatureStatusDto) {
    const feature = await this.featureRepository.findById(id);
    if (!feature) {
      throw new NotFoundException('Feature not found');
    }
    await this.featureRepository.update(id, updateStatusDto);
    return this.responseTransformer.transform({ message: 'Feature status updated successfully' });
  }

  async remove(id: number) {
    const feature = await this.featureRepository.findById(id);
    if (!feature) {
      throw new NotFoundException('Feature not found');
    }
    await this.featureRepository.softDelete(id);
    return this.responseTransformer.transformDelete('Feature');
  }
}