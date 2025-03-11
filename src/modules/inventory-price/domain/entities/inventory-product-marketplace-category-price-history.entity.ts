import { Entity, Column, CreateDateColumn, BeforeInsert } from "typeorm";
import { VarPrimary } from "@/common/entities/varPrimary.entity";
import { randomBytes } from "crypto";

@Entity("inventory_product_marketplace_category_price_histories")
export class InventoryProductMarketplaceCategoryPriceHistory extends VarPrimary {
  @Column({ type: "varchar", nullable: false })
  inventory_product_pricing_information_history_id: string;

  @Column({ type: "bigint", nullable: false })
  price_category_id: number;

  @Column({ type: "varchar", length: 255, nullable: false })
  price_category_name: string;

  @Column({ type: "numeric", precision: 10, scale: 2, nullable: false })
  price_category_percentage: number;

  @Column({ type: "boolean", default: false, nullable: false })
  price_category_set_default: boolean;

  @Column({
    type: "numeric",
    precision: 19,
    scale: 2,
    default: 0,
    nullable: false,
  })
  price: number;

  @Column({ type: "numeric", precision: 10, scale: 2, nullable: false })
  price_category_custom_percentage: number;

  @Column({ type: "boolean", default: false, nullable: false })
  is_custom_price_category: boolean;

  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  created_at: Date;

  @CreateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updated_at: Date;

  @BeforeInsert()
  generateId() {
    const timestamp = Date.now().toString(20);
    const randomStr = randomBytes(12).toString("hex");
    this.id = `${randomStr}${timestamp}`;
  }
}
