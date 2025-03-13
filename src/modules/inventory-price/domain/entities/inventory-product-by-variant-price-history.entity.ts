import { VarPrimary } from "@/common/entities/varPrimary.entity";
import { InventoryProductByVariant } from "@/modules/inventory/domain/entities/inventory-product-by-variant.entity";
import { PriceCategory } from "@/modules/price-categories/domain/entities/price-category.entity";
import { randomBytes } from "crypto";
import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { InventoryProductPricingInformationHistory } from "./inventory-product-pricing-information-history.entity";

@Entity("inventory_product_by_variant_price_histories")
export class InventoryProductByVariantPriceHistory extends VarPrimary {
  @Column({ type: "varchar" })
  inventory_product_pricing_information_history_id: string;

  @ManyToOne(() => InventoryProductPricingInformationHistory)
  @JoinColumn({ name: "inventory_product_pricing_information_history_id" })
  pricing_information_history: InventoryProductPricingInformationHistory;

  @Column({ type: "varchar", length: 255 })
  inventory_product_by_variant_id: string;

  @ManyToOne(() => InventoryProductByVariant)
  @JoinColumn({ name: "inventory_product_by_variant_id" })
  inventory_product_by_variant: InventoryProductByVariant;

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

  @ManyToOne(() => PriceCategory)
  @JoinColumn({ name: "price_category_id" })
  price_category: PriceCategory;

  @Column({ type: "numeric", precision: 19, scale: 2, default: 0 })
  old_price: number;

  @Column({ type: "numeric", precision: 19, scale: 2, default: 0 })
  new_price: number;

  @Column({ type: "boolean", default: true })
  old_status: boolean;

  @Column({ type: "boolean", default: true })
  new_status: boolean;

  @Column({ type: "numeric", precision: 19, scale: 2, default: 0 })
  old_usd_price: number;

  @Column({ type: "numeric", precision: 19, scale: 2, default: 0 })
  new_usd_price: number;

  @Column({ type: "numeric", precision: 19, scale: 2, default: 0 })
  old_exchange_rate: number;

  @Column({ type: "numeric", precision: 19, scale: 2, default: 0 })
  new_exchange_rate: number;

  @Column({ type: "numeric", precision: 19, scale: 2, default: 0 })
  old_adjustment_percentage: number;

  @Column({ type: "numeric", precision: 19, scale: 2, default: 0 })
  new_adjustment_percentage: number;

  @BeforeInsert()
  generateId() {
    const timestamp = Date.now().toString(20);
    const randomStr = randomBytes(12).toString("hex");
    this.id = `${randomStr}${timestamp}`;
  }
}
