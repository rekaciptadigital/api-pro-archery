import { VarPrimary } from "@/common/entities/varPrimary.entity";
import { randomBytes } from "crypto";
import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { InventoryProductGlobalDiscount } from "./inventory-product-global-discount.entity";

@Entity("inventory_product_global_discount_price_categories")
export class InventoryProductGlobalDiscountPriceCategory extends VarPrimary {
  @Column({ type: "varchar", length: 255 })
  inventory_product_global_discount_id: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  price_category_type: string;

  @Column({ type: "bigint" })
  price_category_id: number;

  @Column({ type: "varchar", length: 255 })
  price_category_name: string;

  @Column({ type: "numeric", precision: 10, scale: 2 })
  price_category_percentage: number;

  @Column({ type: "boolean", default: false })
  price_category_set_default: boolean;

  @Column({ type: "numeric", precision: 19, scale: 2, default: 0 })
  price: number;

  @ManyToOne(
    () => InventoryProductGlobalDiscount,
    (discount) => discount.price_categories,
    { onDelete: "CASCADE" }
  )
  @JoinColumn({ name: "inventory_product_global_discount_id" })
  global_discount: InventoryProductGlobalDiscount;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      const timestamp = Date.now().toString(20);
      const randomStr = randomBytes(12).toString("hex");
      this.id = `${randomStr}${timestamp}`;
    }
  }
}
