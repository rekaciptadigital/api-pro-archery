import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { InventoryLocation } from '../entities/inventory-location.entity';
import { BaseRepository } from '@/common/repositories/base.repository';

@Injectable()
export class InventoryLocationRepository extends BaseRepository<InventoryLocation> {
  constructor(
    @InjectRepository(InventoryLocation)
    private readonly inventoryLocationRepository: Repository<InventoryLocation>
  ) {
    super(inventoryLocationRepository);
  }

  async findByCode(code: string): Promise<InventoryLocation | null> {
    return this.inventoryLocationRepository.findOne({
      where: {
        code,
        deleted_at: IsNull()
      }
    });
  }

  async findByCodeWithDeleted(code: string): Promise<InventoryLocation | null> {
    return this.inventoryLocationRepository.findOne({
      where: { code },
      withDeleted: true
    });
  }

  async findLocations(
    skip: number,
    take: number,
    search?: string,
    type?: string,
    status?: boolean
  ): Promise<[InventoryLocation[], number]> {
    const query = this.inventoryLocationRepository.createQueryBuilder('location')
      .where('location.deleted_at IS NULL');

    if (search) {
      query.andWhere(
        '(LOWER(location.name) LIKE LOWER(:search) OR LOWER(location.code) LIKE LOWER(:search))',
        { search: `%${search}%` }
      );
    }

    if (type) {
      query.andWhere('LOWER(location.type) = LOWER(:type)', { type });
    }

    if (status !== undefined) {
      query.andWhere('location.status = :status', { status });
    }

    query.orderBy('location.type', 'ASC')
      .addOrderBy('location.name', 'ASC')
      .skip(skip)
      .take(take);

    return query.getManyAndCount();
  }

  async findWithDeleted(id: number): Promise<InventoryLocation | null> {
    return this.repository.findOne({
      where: { id } as any,
      withDeleted: true
    });
  }

  async restore(id: number): Promise<InventoryLocation | null> {
    await this.repository.restore(id);
    return this.findById(id);
  }
}