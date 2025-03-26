import { VarPrimary } from "@/common/entities/varPrimary.entity";
import { randomBytes } from "crypto";
import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { InventoryProductVolumeDiscountVariantHistory } from "./inventory-product-volume-discount-variant-history.entity";
import { InventoryProductVolumeDiscountVariantPriceCatHis } from "./inventory-product-volume-discount-variant-price-cat-his.entity";

@Entity("inventory_product_volume_discount_variant_qty_his")
export class InventoryProductVolumeDiscountVariantQtyHis extends VarPrimary {
  @Column({ type: "varchar", length: 255 })
  inventory_product_vol_disc_variant_his_id: string;

  @Column({ type: "integer", default: 0 })
  old_quantity: number;

  @Column({ type: "integer", default: 0 })
  new_quantity: number;

  @Column({ type: "numeric", precision: 19, scale: 2 })
  old_discount_percentage: number;

  @Column({ type: "numeric", precision: 19, scale: 2 })
  new_discount_percentage: number;

  @Column({ type: "boolean", default: true })
  old_status: boolean;

  @Column({ type: "boolean", default: true })
  new_status: boolean;

  @Column({ type: "boolean", default: false })
  is_deleted: boolean;

  @ManyToOne(
    () => InventoryProductVolumeDiscountVariantHistory,
    (history) => history.quantities,
    { onDelete: "CASCADE" }
  )
  @JoinColumn({ name: "inventory_product_vol_disc_variant_his_id" })
  volume_discount_variant_history: InventoryProductVolumeDiscountVariantHistory;

  @OneToMany(
    () => InventoryProductVolumeDiscountVariantPriceCatHis,
    (priceCategory) => priceCategory.volume_discount_variant_qty_history,
    { cascade: true }
  )
  price_categories: InventoryProductVolumeDiscountVariantPriceCatHis[];

  @BeforeInsert()
  generateId() {
    const timestamp = Date.now().toString(20);
    const randomStr = randomBytes(12).toString("hex");
    this.id = `${randomStr}${timestamp}`;
  }
}
