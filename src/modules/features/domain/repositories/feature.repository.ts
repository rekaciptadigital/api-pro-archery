import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, ILike, IsNull } from 'typeorm';
import { Feature } from '../entities/feature.entity';
import { BaseRepository } from '../../../common/repositories/base.repository';

@Injectable()
export class FeatureRepository extends BaseRepository<Feature> {
  constructor(
    @InjectRepository(Feature)
    private readonly featureRepository: Repository<Feature>,
  ) {
    super(featureRepository);
  }

  async findAndCount(options?: FindManyOptions<Feature>): Promise<[Feature[], number]> {
    return this.featureRepository.findAndCount(options);
  }

  async findByNameCaseInsensitive(name: string, excludeDeleted: boolean = true): Promise<Feature | null> {
    return this.featureRepository.findOne({
      where: {
        name: ILike(`${name}`),
        ...(excludeDeleted && { deleted_at: IsNull() }),
      },
    });
  }
}