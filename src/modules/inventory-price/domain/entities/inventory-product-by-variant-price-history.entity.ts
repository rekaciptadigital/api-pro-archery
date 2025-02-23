import { Entity, Column, CreateDateColumn, BeforeInsert } from "typeorm";
import { VarPrimary } from "@/common/entities/varPrimary.entity";
import { randomBytes } from "crypto";

@Entity("inventory_product_by_variant_price_histories")
export class InventoryProductByVariantPriceHistory extends VarPrimary {
  @Column("varchar", { primary: true })
  id: string;

  @Column({ type: "varchar" })
  inventory_product_pricing_information_history_id: string;

  @Column({ type: "varchar", length: 255 })
  inventory_product_by_variant_id: string;

  @Column({ type: "bigint" })
  price_category_id: number;

  @Column({ type: "numeric", precision: 19, scale: 2, default: 0 })
  price: number;

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
