import { VarPrimary } from "@/common/entities/varPrimary.entity";
import { randomBytes } from "crypto";
import { BeforeInsert, Column, Entity } from "typeorm";

@Entity("inventory_product_customer_category_price_histories")
export class InventoryProductCustomerCategoryPriceHistory extends VarPrimary {
  @Column({ type: "varchar" })
  inventory_product_pricing_information_history_id: string;

  @Column({ type: "bigint" })
  price_category_id: number;

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
  old_pre_tax_price: number;

  @Column({ type: "numeric", precision: 19, scale: 2, default: 0 })
  new_pre_tax_price: number;

  @Column({ type: "numeric", precision: 19, scale: 2, default: 0 })
  old_tax_inclusive_price: number;

  @Column({ type: "numeric", precision: 19, scale: 2, default: 0 })
  new_tax_inclusive_price: number;

  @Column({ type: "bigint" })
  tax_id: number;

  @Column({ type: "numeric", precision: 19, scale: 2, default: 0 })
  old_tax_percentage: number;

  @Column({ type: "numeric", precision: 19, scale: 2, default: 0 })
  new_tax_percentage: number;

  @Column({ type: "boolean", default: false })
  old_is_custom_tax_inclusive_price: boolean;

  @Column({ type: "boolean", default: false })
  new_is_custom_tax_inclusive_price: boolean;

  @Column({ type: "numeric", precision: 10, scale: 2, default: 0 })
  old_price_category_custom_percentage: number;

  @Column({ type: "numeric", precision: 10, scale: 2, default: 0 })
  new_price_category_custom_percentage: number;

  @BeforeInsert()
  generateId() {
    const timestamp = Date.now().toString(20);
    const randomStr = randomBytes(12).toString("hex");
    this.id = `${randomStr}${timestamp}`;
  }
}
