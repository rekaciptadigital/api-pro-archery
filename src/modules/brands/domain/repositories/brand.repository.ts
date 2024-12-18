import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, ILike } from 'typeorm';
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
      .where('LOWER(brand.code) = LOWER(:code)', { code });

    if (excludeId) {
      query.andWhere('brand.id != :id', { id: excludeId });
    }

    return query.getOne();
  }

  async restore(id: number): Promise<Brand | null> {
    await this.brandRepository.restore(id);
    return this.findById(id);
  }

  async findWithDeleted(id: number): Promise<Brand | null> {
    return this.brandRepository.findOne({
      where: { id } as FindOptionsWhere<Brand>,
      withDeleted: true
    });
  }

  async findAndCountWithDeleted(options: any = {}): Promise<[Brand[], number]> {
    return this.brandRepository.findAndCount({
      ...options,
      withDeleted: true
    });
  }
}