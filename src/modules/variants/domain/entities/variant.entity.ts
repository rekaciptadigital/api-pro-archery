import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { VariantValue } from './variant-value.entity';

@Entity('variants')
export class Variant extends BaseEntity {
  @Column()
  name: string;

  @Column()
  display_order: number;

  @Column({ type: 'boolean', default: true })
  status: boolean;

  @OneToMany(() => VariantValue, value => value.variant, {
    cascade: true,
    eager: true
  })
  values: VariantValue[];
}