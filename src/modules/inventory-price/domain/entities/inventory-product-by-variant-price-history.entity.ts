import {
  Entity,
  Column,
  CreateDateColumn,
  BeforeInsert,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { VarPrimary } from "@/common/entities/varPrimary.entity";
import { randomBytes } from "crypto";
import { PriceCategory } from "@/modules/price-categories/domain/entities/price-category.entity";
import { InventoryProductByVariant } from "@/modules/inventory/domain/entities/inventory-product-by-variant.entity";
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

  @ManyToOne(() => PriceCategory)
  @JoinColumn({ name: "price_category_id" })
  price_category: PriceCategory;

  @Column({ type: "numeric", precision: 19, scale: 2, default: 0 })
  price: number;

  @Column({ type: "boolean", default: true })
  status: boolean;

  @BeforeInsert()
  generateId() {
    const timestamp = Date.now().toString(20);
    const randomStr = randomBytes(12).toString("hex");
    this.id = `${randomStr}${timestamp}`;
  }
}
