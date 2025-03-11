import { Entity, Column, CreateDateColumn, BeforeInsert } from "typeorm";
import { VarPrimary } from "@/common/entities/varPrimary.entity";
import { randomBytes } from "crypto";

@Entity("inventory_product_customer_category_price_histories")
export class InventoryProductCustomerCategoryPriceHistory extends VarPrimary {
  @Column({ type: "varchar" })
  inventory_product_pricing_information_history_id: string;

  @Column({ type: "bigint" })
  price_category_id: number;

  @Column({ type: "varchar", length: 255 })
  price_category_name: string;

  @Column({ type: "numeric", precision: 10, scale: 2 })
  price_category_percentage: number;

  @Column({ type: "boolean", default: false })
  price_category_set_default: boolean;

  @Column({ type: "numeric", precision: 19, scale: 2, default: 0 })
  pre_tax_price: number;

  @Column({ type: "numeric", precision: 19, scale: 2, default: 0 })
  tax_inclusive_price: number;

  @Column({ type: "bigint" })
  tax_id: number;

  @Column({ type: "numeric", precision: 19, scale: 2, default: 0 })
  tax_percentage: number;

  @Column({ type: "boolean", default: false })
  is_custom_tax_inclusive_price: boolean;

  @Column({ type: "numeric", precision: 10, scale: 2 })
  price_category_custom_percentage: number;

  @BeforeInsert()
  generateId() {
    const timestamp = Date.now().toString(20);
    const randomStr = randomBytes(12).toString("hex");
    this.id = `${randomStr}${timestamp}`;
  }
}
