import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, DataSource } from 'typeorm';
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

  async findWithDeleted(id: number): Promise<Variant | null> {
    return this.variantRepository.findOne({
      where: { id } as FindOptionsWhere<Variant>,
      withDeleted: true,
      relations: ['values']
    });
  }

  async findOneWithOptions(options: any): Promise<Variant | null> {
    return this.variantRepository.findOne({
      ...options,
      relations: ['values']
    });
  }

  async findById(id: number): Promise<Variant | null> {
    return this.variantRepository.findOne({
      where: { id } as FindOptionsWhere<Variant>,
      relations: ['values']
    });
  }

  async findAndCount(options: any = {}): Promise<[Variant[], number]> {
    return this.variantRepository.findAndCount({
      ...options,
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

  async createWithOrder(data: Partial<Variant>): Promise<Variant> {
    const variant = await this.dataSource.transaction(async manager => {
      // First shift up existing variants if needed
      await manager.createQueryBuilder()
        .update(Variant)
        .set({
          display_order: () => 'display_order + 1'
        })
        .where('display_order >= :order', { order: data.display_order })
        .andWhere('deleted_at IS NULL')
        .execute();

      // Then create the new variant
      const newVariant = manager.create(Variant, data);
      return await manager.save(newVariant);
    });

    // Fetch the complete variant with relations
    const completeVariant = await this.findById(variant.id);
    if (!completeVariant) {
      throw new Error('Failed to retrieve created variant');
    }

    return completeVariant;
  }

  async updateWithOrder(id: number, data: Partial<Variant>, oldDisplayOrder: number): Promise<Variant> {
    await this.dataSource.transaction(async manager => {
      const newDisplayOrder = data.display_order;
      
      if (newDisplayOrder && newDisplayOrder !== oldDisplayOrder) {
        if (newDisplayOrder > oldDisplayOrder) {
          // Moving down: shift others up
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
          // Moving up: shift others down
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

      // Update the variant
      await manager.update(Variant, id, data);
    });

    // Fetch and return the updated variant with relations
    const updatedVariant = await this.findById(id);
    if (!updatedVariant) {
      throw new Error('Failed to retrieve updated variant');
    }

    return updatedVariant;
  }

  async softDeleteWithOrder(id: number, displayOrder: number): Promise<void> {
    await this.dataSource.transaction(async manager => {
      // First soft delete the variant
      await manager.softDelete(Variant, id);

      // Then shift down the display orders
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