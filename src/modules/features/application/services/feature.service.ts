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

  // ... other methods remain the same ...

  async remove(id: number) {
    const feature = await this.featureRepository.findById(id);
    if (!feature) {
      throw new NotFoundException('Feature not found');
    }
    await this.featureRepository.softDelete(id);
    return this.responseTransformer.transformDelete('Feature');
  }
}