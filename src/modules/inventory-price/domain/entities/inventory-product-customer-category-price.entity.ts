import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { InventoryProductPricingInformation } from "./inventory-product-pricing-information.entity";

@Entity("inventory_product_customer_category_prices")
export class InventoryProductCustomerCategoryPrice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "bigint" })
  inventory_product_pricing_information_id: number;

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

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at: Date;

  @ManyToOne(
    () => InventoryProductPricingInformation,
    (pricing) => pricing.customer_category_prices
  )
  @JoinColumn({ name: "inventory_product_pricing_information_id" })
  pricing_information: InventoryProductPricingInformation;
}
