import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager, IsNull } from 'typeorm';
import { Variant } from '../entities/variant.entity';

@Injectable()
export class DisplayOrderHelper {
  constructor(private readonly dataSource: DataSource) {}

  async getNextDisplayOrder(manager: EntityManager): Promise<number> {
    const result = await manager
      .createQueryBuilder(Variant, 'variant')
      .select('COUNT(*)', 'count')
      .where('variant.deleted_at IS NULL')
      .getRawOne();
    
    return (result?.count || 0) + 1;
  }

  async swapDisplayOrders(
    manager: EntityManager,
    variantId: number,
    currentOrder: number,
    newOrder: number
  ): Promise<void> {
    const targetVariant = await manager.findOne(Variant, {
      where: {
        display_order: newOrder,
        deleted_at: IsNull()
      }
    });

    if (targetVariant) {
      await manager.update(Variant, targetVariant.id, {
        display_order: currentOrder
      });
    }

    await manager.update(Variant, variantId, {
      display_order: newOrder
    });
  }

  async reorderAfterDelete(
    manager: EntityManager,
    deletedOrder: number
  ): Promise<void> {
    await manager
      .createQueryBuilder()
      .update(Variant)
      .set({
        display_order: () => 'display_order - 1'
      })
      .where('display_order > :deletedOrder', { deletedOrder })
      .andWhere('deleted_at IS NULL')
      .execute();
  }

  async findVariantByDisplayOrder(
    manager: EntityManager,
    displayOrder: number
  ): Promise<Variant | null> {
    return manager.findOne(Variant, {
      where: {
        display_order: displayOrder,
        deleted_at: IsNull()
      }
    });
  }
}