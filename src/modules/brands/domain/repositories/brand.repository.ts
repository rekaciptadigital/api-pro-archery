import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, ILike, IsNull, Not } from 'typeorm';
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

  async findDeleted(options: any = {}): Promise<[Brand[], number]> {
    return this.brandRepository.findAndCount({
      ...options,
      where: {
        ...options.where,
        deleted_at: Not(IsNull())
      }
    });
  }

  async search(query: string): Promise<Brand[]> {
    return this.brandRepository.find({
      where: [
        { name: ILike(`%${query}%`) },
        { code: ILike(`%${query}%`) }
      ]
    });
  }
}