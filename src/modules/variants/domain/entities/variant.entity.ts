import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { VariantValue } from './variant-value.entity';

@Entity('variants')
export class Variant extends BaseEntity {
  @Column()
  name: string;

  @Column({ type: 'integer', nullable: true })
  display_order: number | null;

  @Column({ type: 'boolean', default: true })
  status: boolean;

  @OneToMany(() => VariantValue, value => value.variant, {
    cascade: true,
    eager: true
  })
  values: VariantValue[];
}