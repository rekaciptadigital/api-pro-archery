import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { VarPrimary } from "@/common/entities/varPrimary.entity";
import { randomBytes } from "crypto";
import { InventoryProductVolumeDiscountVariant } from "./inventory-product-volume-discount-variant.entity";

@Entity("inventory_product_volume_discount_variant_price_categories")
export class InventoryProductVolumeDiscountVariantPriceCategory extends VarPrimary {
  @Column("varchar", { primary: true })
  id: string;

  @Column({ type: "varchar", length: 255 })
  inventory_product_volume_discount_variant_id: string;

  @Column({ type: "bigint" })
  price_category_id: number;

  @Column({ type: "varchar", length: 255 })
  price_category_name: string;

  @Column({ type: "numeric", precision: 10, scale: 2 })
  price_category_percentage: number;

  @Column({ type: "boolean", default: false })
  price_category_set_default: boolean;

  @Column({ type: "numeric", precision: 19, scale: 2, default: 0 })
  price: number;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at: Date;

  @ManyToOne(() => InventoryProductVolumeDiscountVariant)
  @JoinColumn({ name: "inventory_product_volume_discount_variant_id" })
  volume_discount_variant: InventoryProductVolumeDiscountVariant;

  @BeforeInsert()
  generateId() {
    const timestamp = Date.now().toString(20);
    const randomStr = randomBytes(12).toString("hex");
    this.id = `${randomStr}${timestamp}`;
  }
}
