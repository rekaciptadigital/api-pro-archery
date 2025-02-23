import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { VarPrimary } from "@/common/entities/varPrimary.entity";
import { randomBytes } from "crypto";
import { InventoryProductPricingInformation } from "./inventory-product-pricing-information.entity";
import { InventoryProductGlobalDiscountPriceCategory } from "./inventory-product-global-discount-price-category.entity";

@Entity("inventory_product_global_discounts")
export class InventoryProductGlobalDiscount extends VarPrimary {
  @Column({ type: "bigint" })
  inventory_product_pricing_information_id: number;

  @Column({ type: "integer", default: 0 })
  quantity: number;

  @Column({ type: "numeric", precision: 19, scale: 2 })
  discount_percentage: number;

  @ManyToOne(
    () => InventoryProductPricingInformation,
    (pricing) => pricing.global_discounts,
    { onDelete: "CASCADE" }
  )
  @JoinColumn({ name: "inventory_product_pricing_information_id" })
  pricing_information: InventoryProductPricingInformation;

  @OneToMany(
    () => InventoryProductGlobalDiscountPriceCategory,
    (category) => category.global_discount,
    { cascade: true }
  )
  price_categories: InventoryProductGlobalDiscountPriceCategory[];

  @BeforeInsert()
  generateId() {
    const timestamp = Date.now().toString(20);
    const randomStr = randomBytes(12).toString("hex");
    this.id = `${randomStr}${timestamp}`;
  }
}
