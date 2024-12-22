import { Injectable, NotFoundException } from '@nestjs/common';
import { FeatureRepository } from '../../domain/repositories/feature.repository';
import { CreateFeatureDto, UpdateFeatureDto, UpdateFeatureStatusDto } from '../dtos/feature.dto';
import { PaginationHelper } from '../../../../common/pagination/helpers/pagination.helper';
import { PaginationQueryDto } from '../../../../common/pagination/dto/pagination-query.dto';
import { ResponseTransformer } from '../../../../common/transformers/response.transformer';
import { FeatureValidator } from '../../domain/validators/feature.validator';
import { DomainException } from '@/common/exceptions/domain.exception';
import { HttpStatus } from '@nestjs/common';

@Injectable()
export class FeatureService {
  constructor(
    private readonly featureRepository: FeatureRepository,
    private readonly featureValidator: FeatureValidator,
    private readonly paginationHelper: PaginationHelper,
    private readonly responseTransformer: ResponseTransformer,
  ) {}

  async create(createFeatureDto: CreateFeatureDto) {
    await this.featureValidator.validateName(createFeatureDto.name);

    const feature = await this.featureRepository.create({
      ...createFeatureDto,
      status: createFeatureDto.status ?? true,
    });

    return this.responseTransformer.transform(feature);
  }

  async findAll(query: PaginationQueryDto) {
    const { skip, take } = this.paginationHelper.getSkipTake(query.page, query.limit);
    
    const [features, total] = await this.featureRepository.findAndCount({
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

    if (updateFeatureDto.name && updateFeatureDto.name.toLowerCase() !== feature.name.toLowerCase()) {
      await this.featureValidator.validateForOperation(updateFeatureDto.name, id);
    }

    const updated = await this.featureRepository.update(id, updateFeatureDto);
    return this.responseTransformer.transform(updated);
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
    return this.responseTransformer.transform({ message: 'Feature deleted successfully' });
  }

  async restore(id: number) {
    const feature = await this.featureRepository.findWithDeleted(id);
    if (!feature) {
      throw new NotFoundException('Feature not found');
    }

    if (!feature.deleted_at) {
      throw new DomainException('Feature is not deleted', HttpStatus.BAD_REQUEST);
    }

    const restored = await this.featureRepository.restore(id);
    if (!restored) {
      throw new DomainException('Failed to restore feature', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return this.responseTransformer.transform(restored);
  }
}