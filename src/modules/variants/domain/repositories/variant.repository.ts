import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, DataSource, IsNull } from 'typeorm';
import { Variant } from '../entities/variant.entity';
import { BaseRepository } from '@/common/repositories/base.repository';

@Injectable()
export class VariantRepository extends BaseRepository<Variant> {
  constructor(
    @InjectRepository(Variant)
    private readonly variantRepository: Repository<Variant>,
    private readonly dataSource: DataSource
  ) {
    super(variantRepository);
  }

  async getMaxDisplayOrder(): Promise<number> {
    const result = await this.variantRepository
      .createQueryBuilder('variant')
      .select('MAX(variant.display_order)', 'max')
      .where('variant.deleted_at IS NULL')
      .getRawOne();
    
    return result?.max || 0;
  }

  async createWithOrder(data: Partial<Variant>): Promise<Variant> {
    const variant = await this.dataSource.transaction(async manager => {
      await manager.createQueryBuilder()
        .update(Variant)
        .set({
          display_order: () => 'display_order + 1'
        })
        .where('display_order >= :order', { order: data.display_order })
        .andWhere('deleted_at IS NULL')
        .execute();

      const newVariant = manager.create(Variant, data);
      return await manager.save(newVariant);
    });

    return this.findById(variant.id) as Promise<Variant>;
  }

  async updateWithOrder(id: number, data: Partial<Variant>, oldDisplayOrder: number): Promise<Variant> {
    await this.dataSource.transaction(async manager => {
      const newDisplayOrder = data.display_order;
      
      if (newDisplayOrder && newDisplayOrder !== oldDisplayOrder) {
        if (newDisplayOrder > oldDisplayOrder) {
          await manager.createQueryBuilder()
            .update(Variant)
            .set({
              display_order: () => 'display_order - 1'
            })
            .where('display_order > :oldOrder AND display_order <= :newOrder', {
              oldOrder: oldDisplayOrder,
              newOrder: newDisplayOrder
            })
            .andWhere('deleted_at IS NULL')
            .execute();
        } else {
          await manager.createQueryBuilder()
            .update(Variant)
            .set({
              display_order: () => 'display_order + 1'
            })
            .where('display_order >= :newOrder AND display_order < :oldOrder', {
              oldOrder: oldDisplayOrder,
              newOrder: newDisplayOrder
            })
            .andWhere('deleted_at IS NULL')
            .execute();
        }
      }

      await manager.update(Variant, id, data);
    });

    return this.findById(id) as Promise<Variant>;
  }

  async softDeleteWithOrder(id: number, displayOrder: number): Promise<void> {
    await this.dataSource.transaction(async manager => {
      await manager.softDelete(Variant, id);

      await manager.createQueryBuilder()
        .update(Variant)
        .set({
          display_order: () => 'display_order - 1'
        })
        .where('display_order > :order', { order: displayOrder })
        .andWhere('deleted_at IS NULL')
        .execute();
    });
  }

  async isDisplayOrderTaken(displayOrder: number, excludeId?: number): Promise<boolean> {
    const query = this.variantRepository
      .createQueryBuilder('variant')
      .where('variant.display_order = :displayOrder', { displayOrder })
      .andWhere('variant.deleted_at IS NULL');

    if (excludeId) {
      query.andWhere('variant.id != :id', { id: excludeId });
    }

    const count = await query.getCount();
    return count > 0;
  }
}