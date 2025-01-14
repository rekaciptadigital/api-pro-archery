import { Entity, Column, ManyToOne, OneToMany, JoinColumn, BeforeInsert } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { InventoryProduct } from './inventory-product.entity';
import { InventoryProductByVariantHistory } from './inventory-product-by-variant-history.entity';
import { randomBytes } from 'crypto';

@Entity('inventory_product_by_variants')
export class InventoryProductByVariant extends BaseEntity {
  @Column('varchar', { primary: true })
  id: string;

  @Column('bigint')
  inventory_product_id: number;

  @Column('text')
  full_product_name: string;

  @Column('text')
  sku_product_variant: string;

  @Column('integer')
  sku_product_unique_code: number;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date;

  @ManyToOne(() => InventoryProduct, product => product.product_by_variant, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'inventory_product_id' })
  inventory_product: InventoryProduct;

  @OneToMany(() => InventoryProductByVariantHistory, history => history.inventory_product_by_variant, {
    cascade: true
  })
  histories: InventoryProductByVariantHistory[];

  @BeforeInsert()
  generateId() {
    // Generate a random string ID (not UUID)
    this.id = randomBytes(12).toString('hex');
  }
}