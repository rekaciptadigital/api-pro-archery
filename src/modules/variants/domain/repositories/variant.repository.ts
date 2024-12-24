import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, IsNull } from 'typeorm';
import { Variant } from '../entities/variant.entity';
import { VariantValue } from '../entities/variant-value.entity';
import { BaseRepository } from '@/common/repositories/base.repository';
import { VariantQueryBuilder } from '../builders/variant-query.builder';
import { VariantSortField, SortOrder } from '../../application/dtos/variant-query.dto';

@Injectable()
export class VariantRepository extends BaseRepository<Variant> {
  constructor(
    @InjectRepository(Variant)
    private readonly variantRepository: Repository<Variant>,
    @InjectRepository(VariantValue)
    private readonly variantValueRepository: Repository<VariantValue>,
    private readonly dataSource: DataSource
  ) {
    super(variantRepository);
  }

  async getActiveVariantsCount(): Promise<number> {
    return this.variantRepository.count({
      where: { deleted_at: IsNull() }
    });
  }

  async findVariants(
    skip: number,
    take: number,
    sort: VariantSortField = VariantSortField.ID,
    order: SortOrder = SortOrder.DESC,
    search?: string
  ): Promise<[Variant[], number]> {
    const queryBuilder = VariantQueryBuilder.create(this.variantRepository)
      .addSearch(search)
      .addPagination(skip, take)
      .addOrderBy(sort, order)
      .build();

    return queryBuilder.getManyAndCount();
  }

  async swapDisplayOrder(
    id: number,
    currentOrder: number,
    newOrder: number
  ): Promise<void> {
    await this.dataSource.transaction(async manager => {
      // Find variant with target display order
      const targetVariant = await manager.findOne(Variant, {
        where: { display_order: newOrder, deleted_at: IsNull() }
      });

      if (targetVariant) {
        // Update target variant's display order
        await manager.update(Variant, targetVariant.id, {
          display_order: currentOrder
        });
      }

      // Update current variant's display order
      await manager.update(Variant, id, {
        display_order: newOrder
      });
    });
  }

  async updateWithValues(
    id: number, 
    data: Partial<Variant>, 
    values?: string[]
  ): Promise<Variant> {
    return this.dataSource.transaction(async manager => {
      // Update variant basic info
      await manager.update(Variant, id, data);

      if (values) {
        // Delete existing values
        await manager.delete(VariantValue, { variant_id: id });

        // Create new values
        const variantValues = values.map(value => ({
          variant_id: id,
          value: value
        }));

        await manager.insert(VariantValue, variantValues);
      }

      // Return updated variant with values
      return manager.findOne(Variant, {
        where: { id },
        relations: ['values']
      }) as Promise<Variant>;
    });
  }

  async reorderAfterDelete(displayOrder: number): Promise<void> {
    await this.dataSource.transaction(async manager => {
      await manager
        .createQueryBuilder()
        .update(Variant)
        .set({
          display_order: () => 'display_order - 1'
        })
        .where('display_order > :displayOrder', { displayOrder })
        .andWhere('deleted_at IS NULL')
        .execute();
    });
  }

  async findWithDeleted(id: number): Promise<Variant | null> {
    return this.repository.findOne({
      where: { id } as any,
      withDeleted: true,
      relations: ['values']
    });
  }

  async restore(id: number): Promise<Variant | null> {
    await this.repository.restore(id);
    return this.findById(id);
  }
}