import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feature } from '../entities/feature.entity';
import { BaseRepository } from '../../../common/repositories/base.repository';

@Injectable()
export class FeatureRepository extends BaseRepository<Feature> {
  constructor(
    @InjectRepository(Feature)
    private readonly featureRepository: Repository<Feature>
  ) {
    super(featureRepository);
  }

  async findByNameCaseInsensitive(name: string, excludeId?: number): Promise<Feature | null> {
    const query = this.featureRepository.createQueryBuilder('feature')
      .where('LOWER(feature.name) = LOWER(:name)', { name })
      .andWhere('feature.deleted_at IS NULL');

    if (excludeId) {
      query.andWhere('feature.id != :id', { id: excludeId });
    }

    return query.getOne();
  }

  async findWithDeleted(id: number): Promise<Feature | null> {
    return this.repository.findOne({
      where: { id } as any,
      withDeleted: true
    });
  }

  async restore(id: number): Promise<Feature | null> {
    await this.repository.restore(id);
    return this.findById(id);
  }
}