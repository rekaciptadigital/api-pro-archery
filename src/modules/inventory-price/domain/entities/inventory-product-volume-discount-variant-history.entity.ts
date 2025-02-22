import { Entity, Column, CreateDateColumn, BeforeInsert } from "typeorm";
import { VarPrimary } from "@/common/entities/varPrimary.entity";
import { randomBytes } from "crypto";

@Entity("inventory_product_volume_discount_variant_histories")
export class InventoryProductVolumeDiscountVariantHistory extends VarPrimary {
  @Column("varchar", { primary: true })
  id: string;

  @Column({ type: "varchar" })
  inventory_product_pricing_information_history_id: string;

  @Column({ type: "varchar", length: 255 })
  inventory_product_by_variant_id: string;

  @Column({ type: "text" })
  inventory_product_by_variant_full_product_name: string;

  @Column({ type: "text" })
  inventory_product_by_variant_sku: string;

  @Column({ type: "integer", default: 0 })
  quantity: number;

  @Column({ type: "numeric", precision: 19, scale: 2 })
  discount_percentage: number;

  @Column({ type: "boolean", default: true })
  status: boolean;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @BeforeInsert()
  generateId() {
    const timestamp = Date.now().toString(20);
    const randomStr = randomBytes(12).toString("hex");
    this.id = `${randomStr}${timestamp}`;
  }
}
