import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feature } from '../entities/feature.entity';
import { BaseRepository } from '../../../common/repositories/base.repository';

@Injectable()
export class FeatureRepository extends BaseRepository<Feature> {
  constructor(
    @InjectRepository(Feature)
    repository: Repository<Feature>,
  ) {
    super(repository);
  }
}