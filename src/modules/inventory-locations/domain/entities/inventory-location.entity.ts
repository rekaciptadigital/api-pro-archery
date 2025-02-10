import { Entity, Column } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';

@Entity('inventory_locations')
export class InventoryLocation extends BaseEntity {
  @Column({ length: 20 })
  code: string;

  @Column()
  name: string;

  @Column({ length: 50 })
  type: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'boolean', default: true })
  status: boolean;
}