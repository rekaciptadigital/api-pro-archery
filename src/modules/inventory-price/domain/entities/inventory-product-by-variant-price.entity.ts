import { VarPrimary } from "@/common/entities/varPrimary.entity";
import { InventoryProductByVariant } from "@/modules/inventory/domain/entities/inventory-product-by-variant.entity";
import { PriceCategory } from "@/modules/price-categories/domain/entities/price-category.entity";
import { randomBytes } from "crypto";
import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne } from "typeorm";

@Entity("inventory_product_by_variant_prices")
export class InventoryProductByVariantPrice extends VarPrimary {
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

  @Column({ type: "numeric", precision: 19, scale: 2, default: 0 })
  usd_price: number;

  @Column({ type: "numeric", precision: 19, scale: 2, default: 0 })
  exchange_rate: number;

  @Column({ type: "numeric", precision: 19, scale: 2, default: 0 })
  adjustment_percentage: number;

  @BeforeInsert()
  generateId() {
    const timestamp = Date.now().toString(20);
    const randomStr = randomBytes(12).toString("hex");
    this.id = `${randomStr}${timestamp}`;
  }
}
