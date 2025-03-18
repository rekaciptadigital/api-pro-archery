import { VarPrimary } from "@/common/entities/varPrimary.entity";
import { randomBytes } from "crypto";
import { BeforeInsert, Column, Entity } from "typeorm";

@Entity("inventory_product_marketplace_category_price_histories")
export class InventoryProductMarketplaceCategoryPriceHistory extends VarPrimary {
  @Column({ type: "varchar", nullable: false })
  inventory_product_pricing_information_history_id: string;

  @Column({ type: "bigint", nullable: false })
  price_category_id: number;

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

  @Column({
    type: "numeric",
    precision: 10,
    scale: 2,
    nullable: false,
    default: 0,
  })
  old_price_category_custom_percentage: number;

  @Column({
    type: "numeric",
    precision: 10,
    scale: 2,
    nullable: false,
    default: 0,
  })
  new_price_category_custom_percentage: number;

  @Column({ type: "boolean", default: false, nullable: false })
  old_is_custom_price_category: boolean;

  @Column({ type: "boolean", default: false, nullable: false })
  new_is_custom_price_category: boolean;

  @BeforeInsert()
  generateId() {
    const timestamp = Date.now().toString(20);
    const randomStr = randomBytes(12).toString("hex");
    this.id = `${randomStr}${timestamp}`;
  }
}
