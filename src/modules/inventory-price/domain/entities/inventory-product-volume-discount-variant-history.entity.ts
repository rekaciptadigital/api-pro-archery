import { VarPrimary } from "@/common/entities/varPrimary.entity";
import { randomBytes } from "crypto";
import { BeforeInsert, Column, Entity, OneToMany } from "typeorm";
import { InventoryProductVolumeDiscountVariantQtyHis } from "./inventory-product-volume-discount-variant-qty-his.entity";

@Entity("inventory_product_volume_discount_variant_histories")
export class InventoryProductVolumeDiscountVariantHistory extends VarPrimary {
  @Column({ type: "varchar" })
  inventory_product_pricing_information_history_id: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  inventory_product_by_variant_id: string;

  @Column({ type: "text", nullable: false })
  inventory_product_by_variant_full_product_name: string;

  @Column({ type: "text", nullable: false })
  inventory_product_by_variant_sku: string;

  @Column({ type: "boolean", default: true, nullable: false })
  status: boolean;

  @OneToMany(
    () => InventoryProductVolumeDiscountVariantQtyHis,
    (qty) => qty.volume_discount_variant_history,
    { cascade: true }
  )
  quantities: InventoryProductVolumeDiscountVariantQtyHis[];

  @BeforeInsert()
  generateId() {
    const timestamp = Date.now().toString(20);
    const randomStr = randomBytes(12).toString("hex");
    this.id = `${randomStr}${timestamp}`;
  }
}
