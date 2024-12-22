import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { Brand } from '@/modules/brands/domain/entities/brand.entity';
import { Tax } from '@/modules/taxes/domain/entities/tax.entity';
import { ProductVariant } from './product-variant.entity';

@Entity('products')
export class Product extends BaseEntity {
  @Column()
  name: string;

  @Column({ unique: true })
  sku: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column('bigint')
  brand_id: number;

  @Column('bigint', { nullable: true })
  tax_id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  base_price: number;

  @Column({ type: 'boolean', default: true })
  status: boolean;

  @ManyToOne(() => Brand)
  @JoinColumn({ name: 'brand_id' })
  brand: Brand;

  @ManyToOne(() => Tax)
  @JoinColumn({ name: 'tax_id' })
  tax: Tax;

  @OneToMany(() => ProductVariant, variant => variant.product, {
    cascade: true
  })
  variants: ProductVariant[];
}