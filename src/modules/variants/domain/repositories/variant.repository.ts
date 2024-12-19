import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Variant } from '../entities/variant.entity';
import { BaseRepository } from '@/common/repositories/base.repository';

@Injectable()
export class VariantRepository extends BaseRepository<Variant> {
  constructor(
    @InjectRepository(Variant)
    private readonly variantRepository: Repository<Variant>
  ) {
    super(variantRepository);
  }

  async findWithDeleted(id: number): Promise<Variant | null> {
    return this.variantRepository.findOne({
      where: { id } as FindOptionsWhere<Variant>,
      withDeleted: true,
      relations: ['values']
    });
  }

  async restore(id: number): Promise<Variant | null> {
    await this.variantRepository.restore(id);
    return this.findById(id);
  }

  async getMaxDisplayOrder(): Promise<number> {
    const result = await this.variantRepository
      .createQueryBuilder('variant')
      .select('MAX(variant.display_order)', 'max')
      .where('variant.deleted_at IS NULL')
      .getRawOne();
    
    return result?.max || 0;
  }

  async shiftDisplayOrdersDown(fromOrder: number): Promise<void> {
    await this.variantRepository
      .createQueryBuilder()
      .update(Variant)
      .set({
        display_order: () => 'display_order - 1'
      })
      .where('display_order > :fromOrder', { fromOrder })
      .andWhere('deleted_at IS NULL')
      .execute();
  }
}