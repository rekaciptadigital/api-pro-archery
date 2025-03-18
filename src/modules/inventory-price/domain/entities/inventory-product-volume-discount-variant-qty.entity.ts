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
import { InventoryProductVolumeDiscountVariantPriceCategory } from "./inventory-product-volume-discount-variant-price-category.entity";
import { InventoryProductVolumeDiscountVariant } from "./inventory-product-volume-discount-variant.entity";

@Entity("inventory_product_volume_discount_variant_qty")
export class InventoryProductVolumeDiscountVariantQty extends VarPrimary {
  @Column({ type: "varchar", length: 255 })
  inventory_product_vol_disc_variant_id: string;

  @Column({ type: "integer", default: 0 })
  quantity: number;

  @Column({ type: "numeric", precision: 19, scale: 2, default: 0 })
  discount_percentage: number;

  @ManyToOne(
    () => InventoryProductVolumeDiscountVariant,
    (variant) => variant.quantities
  )
  @JoinColumn({ name: "inventory_product_vol_disc_variant_id" })
  volume_discount_variant: InventoryProductVolumeDiscountVariant;

  @OneToMany(
    () => InventoryProductVolumeDiscountVariantPriceCategory,
    (priceCategory) => priceCategory.volume_discount_variant_qty
  )
  price_categories: InventoryProductVolumeDiscountVariantPriceCategory[];

  @BeforeInsert()
  generateId() {
    const timestamp = Date.now().toString(20);
    const randomStr = randomBytes(12).toString("hex");
    this.id = `${randomStr}${timestamp}`;
  }
}
