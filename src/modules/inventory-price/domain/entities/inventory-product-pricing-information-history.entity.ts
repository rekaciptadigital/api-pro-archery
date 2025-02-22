import { Entity, Column, CreateDateColumn, BeforeInsert } from "typeorm";
import { VarPrimary } from "@/common/entities/varPrimary.entity";
import { randomBytes } from "crypto";

@Entity("inventory_product_pricing_information_histories")
export class InventoryProductPricingInformationHistory extends VarPrimary {
  @Column("varchar", { primary: true })
  id: string;

  @Column({ type: "bigint" })
  inventory_product_pricing_information: number;

  @Column({ type: "bigint" })
  inventory_product_id: number;

  @Column({ type: "numeric", precision: 19, scale: 2, default: 0 })
  usd_price: number;

  @Column({ type: "numeric", precision: 19, scale: 2, default: 0 })
  exchange_rate: number;

  @Column({ type: "numeric", precision: 19, scale: 2, default: 0 })
  adjustment_percentage: number;

  @Column({ type: "numeric", precision: 19, scale: 2, default: 0 })
  price_hb_real: number;

  @Column({ type: "numeric", precision: 19, scale: 2, default: 0 })
  hb_adjustment_price: number;

  @Column({ type: "boolean", default: false })
  is_manual_product_variant_price_edit: boolean;

  @Column({ type: "boolean", default: false })
  is_enable_volume_discount: boolean;

  @Column({ type: "boolean", default: false })
  is_enable_volume_discount_by_product_variant: boolean;

  @Column({ type: "bigint" })
  user_id: number;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @BeforeInsert()
  generateId() {
    const timestamp = Date.now().toString(20);
    const randomStr = randomBytes(12).toString("hex");
    this.id = `${randomStr}${timestamp}`;
  }
}
