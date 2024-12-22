import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Brand } from '../entities/brand.entity';
import { BaseRepository } from '@/common/repositories/base.repository';

@Injectable()
export class BrandRepository extends BaseRepository<Brand> {
  constructor(
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>
  ) {
    super(brandRepository);
  }

  async findByCode(code: string, excludeId?: number): Promise<Brand | null> {
    const query = this.brandRepository.createQueryBuilder('brand')
      .where('LOWER(brand.code) = LOWER(:code)', { code })
      .andWhere('brand.deleted_at IS NULL');

    if (excludeId) {
      query.andWhere('brand.id != :id', { id: excludeId });
    }

    return query.getOne();
  }
}