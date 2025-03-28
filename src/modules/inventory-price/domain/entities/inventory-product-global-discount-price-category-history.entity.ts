import { VarPrimary } from "@/common/entities/varPrimary.entity";
import { randomBytes } from "crypto";
import { BeforeInsert, Column, Entity } from "typeorm";

@Entity("inventory_product_global_discount_price_category_histories")
export class InventoryProductGlobalDiscountPriceCategoryHistory extends VarPrimary {
  @Column({ type: "varchar" })
  inventory_product_pricing_information_history_id: string;

  @Column({ type: "varchar", length: 255 })
  inventory_product_global_discount_history_id: string;

  @Column({ type: "bigint" })
  price_category_id: number;

  @Column({ type: "varchar", length: 255, nullable: false })
  old_price_category_type: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  new_price_category_type: string;

  @Column({ type: "varchar", length: 255 })
  old_price_category_name: string;

  @Column({ type: "varchar", length: 255 })
  new_price_category_name: string;

  @Column({ type: "numeric", precision: 10, scale: 2 })
  old_price_category_percentage: number;

  @Column({ type: "numeric", precision: 10, scale: 2 })
  new_price_category_percentage: number;

  @Column({ type: "boolean", default: false })
  old_price_category_set_default: boolean;

  @Column({ type: "boolean", default: false })
  new_price_category_set_default: boolean;

  @Column({ type: "numeric", precision: 19, scale: 2, default: 0 })
  old_price: number;

  @Column({ type: "numeric", precision: 19, scale: 2, default: 0 })
  new_price: number;

  @Column({ type: "boolean", default: false })
  is_deleted: boolean;

  @BeforeInsert()
  generateId() {
    const timestamp = Date.now().toString(20);
    const randomStr = randomBytes(12).toString("hex");
    this.id = `${randomStr}${timestamp}`;
  }
}
