import { Entity, PrimaryColumn, Column, CreateDateColumn } from "typeorm";

@Entity("inventory_product_by_variant_price_histories")
export class InventoryProductByVariantPriceHistory {
  @PrimaryColumn({ type: "varchar", length: 255 })
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
}
