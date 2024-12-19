import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { Variant } from './variant.entity';

@Entity('variant_values')
export class VariantValue extends BaseEntity {
  @Column('bigint')
  variant_id: number;

  @Column({ length: 50 })
  value: string;

  @ManyToOne(() => Variant, variant => variant.values, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'variant_id' })
  variant: Variant;
}