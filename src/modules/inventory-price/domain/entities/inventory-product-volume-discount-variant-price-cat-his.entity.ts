import { VarPrimary } from "@/common/entities/varPrimary.entity";
import { randomBytes } from "crypto";
import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { InventoryProductVolumeDiscountVariantQtyHis } from "./inventory-product-volume-discount-variant-qty-his.entity";

@Entity("inventory_product_volume_discount_variant_price_cat_his")
export class InventoryProductVolumeDiscountVariantPriceCatHis extends VarPrimary {
  @Column({ type: "varchar", length: 255, nullable: false })
  inventory_product_vol_disc_variant_qty_his_id: string;

  @Column({ type: "bigint", nullable: false })
  price_category_id: number;

  @Column({ type: "varchar", length: 255, nullable: false })
  old_price_category_type: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  new_price_category_type: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  old_price_category_name: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  new_price_category_name: string;

  @Column({ type: "numeric", precision: 10, scale: 2, nullable: false })
  old_price_category_percentage: number;

  @Column({ type: "numeric", precision: 10, scale: 2, nullable: false })
  new_price_category_percentage: number;

  @Column({ type: "boolean", default: false, nullable: false })
  old_price_category_set_default: boolean;

  @Column({ type: "boolean", default: false, nullable: false })
  new_price_category_set_default: boolean;

  @Column({
    type: "numeric",
    precision: 19,
    scale: 2,
    default: 0,
    nullable: false,
  })
  old_price: number;

  @Column({
    type: "numeric",
    precision: 19,
    scale: 2,
    default: 0,
    nullable: false,
  })
  new_price: number;

  @Column({ type: "boolean", default: false })
  is_deleted: boolean;

  @ManyToOne(
    () => InventoryProductVolumeDiscountVariantQtyHis,
    (qty) => qty.price_categories,
    { onDelete: "CASCADE" }
  )
  @JoinColumn({ name: "inventory_product_vol_disc_variant_qty_his_id" })
  volume_discount_variant_qty_history: InventoryProductVolumeDiscountVariantQtyHis;

  @BeforeInsert()
  generateId() {
    const timestamp = Date.now().toString(20);
    const randomStr = randomBytes(12).toString("hex");
    this.id = `${randomStr}${timestamp}`;
  }
}
