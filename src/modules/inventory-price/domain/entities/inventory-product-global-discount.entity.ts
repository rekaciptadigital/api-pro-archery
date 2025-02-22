import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { VarPrimary } from "@/common/entities/varPrimary.entity";
import { randomBytes } from "crypto";
import { InventoryProductPricingInformation } from "./inventory-product-pricing-information.entity";

@Entity("inventory_product_global_discounts")
export class InventoryProductGlobalDiscount extends VarPrimary {
  @Column("varchar", { primary: true })
  id: string;

  @Column({ type: "bigint" })
  inventory_product_pricing_information_id: number;

  @Column({ type: "integer", default: 0 })
  quantity: number;

  @Column({ type: "numeric", precision: 19, scale: 2 })
  discount_percentage: number;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at: Date;

  @ManyToOne(
    () => InventoryProductPricingInformation,
    (pricing) => pricing.global_discounts
  )
  @JoinColumn({ name: "inventory_product_pricing_information_id" })
  pricing_information: InventoryProductPricingInformation;

  @BeforeInsert()
  generateId() {
    const timestamp = Date.now().toString(20);
    const randomStr = randomBytes(12).toString("hex");
    this.id = `${randomStr}${timestamp}`;
  }
}
