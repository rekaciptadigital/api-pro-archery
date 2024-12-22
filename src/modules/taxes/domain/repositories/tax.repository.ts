import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Tax } from '../entities/tax.entity';
import { BaseRepository } from '@/common/repositories/base.repository';

@Injectable()
export class TaxRepository extends BaseRepository<Tax> {
  constructor(
    @InjectRepository(Tax)
    private readonly taxRepository: Repository<Tax>
  ) {
    super(taxRepository);
  }

  async findByName(name: string, excludeId?: number): Promise<Tax | null> {
    const query = this.taxRepository.createQueryBuilder('tax')
      .where('LOWER(tax.name) = LOWER(:name)', { name })
      .andWhere('tax.deleted_at IS NULL');

    if (excludeId) {
      query.andWhere('tax.id != :id', { id: excludeId });
    }

    return query.getOne();
  }

  async findByPercentage(percentage: number, excludeId?: number): Promise<Tax | null> {
    const query = this.taxRepository.createQueryBuilder('tax')
      .where('tax.percentage = :percentage', { percentage })
      .andWhere('tax.deleted_at IS NULL');

    if (excludeId) {
      query.andWhere('tax.id != :id', { id: excludeId });
    }

    return query.getOne();
  }
}