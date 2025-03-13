import { VarPrimary } from "@/common/entities/varPrimary.entity";
import { InventoryProduct } from "@/modules/inventory/domain/entities/inventory-product.entity";
import { User } from "@/modules/users/domain/entities/user.entity";
import { randomBytes } from "crypto";
import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne } from "typeorm";

@Entity("inventory_product_pricing_information_histories")
export class InventoryProductPricingInformationHistory extends VarPrimary {
  @Column({ type: "bigint" })
  inventory_product_pricing_information: number;

  @Column({ type: "bigint" })
  inventory_product_id: number;

  @ManyToOne(() => InventoryProduct)
  @JoinColumn({ name: "inventory_product_id" })
  inventory_product: InventoryProduct;

  @Column({ type: "numeric", precision: 19, scale: 2, default: 0 })
  old_usd_price: number;

  @Column({ type: "numeric", precision: 19, scale: 2, default: 0 })
  new_usd_price: number;

  @Column({ type: "numeric", precision: 19, scale: 2, default: 0 })
  old_exchange_rate: number;

  @Column({ type: "numeric", precision: 19, scale: 2, default: 0 })
  new_exchange_rate: number;

  @Column({ type: "numeric", precision: 19, scale: 2, default: 0 })
  old_adjustment_percentage: number;

  @Column({ type: "numeric", precision: 19, scale: 2, default: 0 })
  new_adjustment_percentage: number;

  @Column({ type: "numeric", precision: 19, scale: 2, default: 0 })
  old_price_hb_real: number;

  @Column({ type: "numeric", precision: 19, scale: 2, default: 0 })
  new_price_hb_real: number;

  @Column({ type: "numeric", precision: 19, scale: 2, default: 0 })
  old_hb_adjustment_price: number;

  @Column({ type: "numeric", precision: 19, scale: 2, default: 0 })
  new_hb_adjustment_price: number;

  @Column({ type: "boolean", default: false })
  old_is_manual_product_variant_price_edit: boolean;

  @Column({ type: "boolean", default: false })
  new_is_manual_product_variant_price_edit: boolean;

  @Column({ type: "boolean", default: false })
  old_is_enable_volume_discount: boolean;

  @Column({ type: "boolean", default: false })
  new_is_enable_volume_discount: boolean;

  @Column({ type: "boolean", default: false })
  old_is_enable_volume_discount_by_product_variant: boolean;

  @Column({ type: "boolean", default: false })
  new_is_enable_volume_discount_by_product_variant: boolean;

  @Column({ type: "bigint" })
  user_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user: User;

  @BeforeInsert()
  generateId() {
    const timestamp = Date.now().toString(20);
    const randomStr = randomBytes(12).toString("hex");
    this.id = `${randomStr}${timestamp}`;
  }
}
