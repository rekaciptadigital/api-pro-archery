import { VarPrimary } from "@/common/entities/varPrimary.entity";
import { randomBytes } from "crypto";
import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { InventoryProductVolumeDiscountVariantQty } from "./inventory-product-volume-discount-variant-qty.entity";

@Entity("inventory_product_volume_discount_variant_price_categories")
export class InventoryProductVolumeDiscountVariantPriceCategory extends VarPrimary {
  @Column({ type: "varchar", length: 255 })
  inventory_product_vol_disc_variant_qty_id: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  price_category_type: string;

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

  @ManyToOne(
    () => InventoryProductVolumeDiscountVariantQty,
    (qty) => qty.price_categories
  )
  @JoinColumn({ name: "inventory_product_vol_disc_variant_qty_id" })
  volume_discount_variant_qty: InventoryProductVolumeDiscountVariantQty;

  @BeforeInsert()
  generateId() {
    const timestamp = Date.now().toString(20);
    const randomStr = randomBytes(12).toString("hex");
    this.id = `${randomStr}${timestamp}`;
  }
}
