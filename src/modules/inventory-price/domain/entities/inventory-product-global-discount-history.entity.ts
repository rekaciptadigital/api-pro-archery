import { VarPrimary } from "@/common/entities/varPrimary.entity";
import { randomBytes } from "crypto";
import { BeforeInsert, Column, Entity } from "typeorm";

@Entity("inventory_product_global_discount_histories")
export class InventoryProductGlobalDiscountHistory extends VarPrimary {
  @Column({ type: "varchar" })
  inventory_product_pricing_information_history_id: string;

  @Column({ type: "integer", default: 0 })
  old_quantity: number;

  @Column({ type: "integer", default: 0 })
  new_quantity: number;

  @Column({ type: "numeric", precision: 19, scale: 2, default: 0 })
  old_discount_percentage: number;

  @Column({ type: "numeric", precision: 19, scale: 2, default: 0 })
  new_discount_percentage: number;

  @Column({ type: "boolean", default: false })
  is_deleted: boolean;

  @BeforeInsert()
  generateId() {
    const timestamp = Date.now().toString(20);
    const randomStr = randomBytes(12).toString("hex");
    this.id = `${randomStr}${timestamp}`;
  }
}
