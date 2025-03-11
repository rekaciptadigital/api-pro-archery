import { BaseEntity } from "@/common/entities/base.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { InventoryProductPricingInformation } from "./inventory-product-pricing-information.entity";

@Entity("inventory_product_marketplace_category_prices")
export class InventoryProductMarketplaceCategoryPrice extends BaseEntity {
  @Column({ type: "bigint" })
  inventory_product_pricing_information_id: number;

  @Column({ type: "bigint" })
  price_category_id: number;

  @Column({ type: "varchar", length: 255, nullable: false })
  price_category_name: string;

  @Column({ type: "numeric", precision: 10, scale: 2, nullable: false })
  price_category_percentage: number;

  @Column({ type: "boolean", default: false, nullable: false })
  price_category_set_default: boolean;

  @Column({ type: "numeric", precision: 19, scale: 2, default: 0, nullable: false })
  price: number;

  @Column({ type: "numeric", precision: 10, scale: 2, nullable: false })
  price_category_custom_percentage: number;

  @Column({ type: "boolean", default: false, nullable: false })
  is_custom_price_category: boolean;

  @ManyToOne(
    () => InventoryProductPricingInformation,
    (pricing) => pricing.marketplace_category_prices,
    { onDelete: "CASCADE" }
  )
  @JoinColumn({ name: "inventory_product_pricing_information_id" })
  pricing_information: InventoryProductPricingInformation;
}