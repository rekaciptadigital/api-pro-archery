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

  async findWithDeleted(id: number): Promise<Tax | null> {
    return this.taxRepository.findOne({
      where: { id } as FindOptionsWhere<Tax>,
      withDeleted: true
    });
  }

  async findAndCountWithDeleted(options: any = {}): Promise<[Tax[], number]> {
    return this.taxRepository.findAndCount({
      ...options,
      withDeleted: true
    });
  }

  async restore(id: number): Promise<Tax | null> {
    await this.taxRepository.restore(id);
    return this.findById(id);
  }
}