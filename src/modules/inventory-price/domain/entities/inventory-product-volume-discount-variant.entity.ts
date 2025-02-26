import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  OneToMany,
} from "typeorm";
import { InventoryProductPricingInformation } from "./inventory-product-pricing-information.entity";
import { VarPrimary } from "@/common/entities/varPrimary.entity";
import { randomBytes } from "crypto";
import { InventoryProductVolumeDiscountVariantPriceCategory } from "./inventory-product-volume-discount-variant-price-category.entity";

@Entity("inventory_product_volume_discount_variants")
export class InventoryProductVolumeDiscountVariant extends VarPrimary {
  @Column({ type: "bigint" })
  inventory_product_pricing_information_id: number;

  @Column({ type: "varchar", length: 255 })
  inventory_product_by_variant_id: string;

  @Column({ type: "text" })
  inventory_product_by_variant_full_product_name: string;

  @Column({ type: "text" })
  inventory_product_by_variant_sku: string;

  @Column({ type: "integer", default: 0 })
  quantity: number;

  @Column({ type: "numeric", precision: 19, scale: 2 })
  discount_percentage: number;

  @Column({ type: "boolean", default: true })
  status: boolean;

  @ManyToOne(
    () => InventoryProductPricingInformation,
    (pricing) => pricing.volume_discount_variants
  )
  @JoinColumn({ name: "inventory_product_pricing_information_id" })
  pricing_information: InventoryProductPricingInformation;

  @OneToMany(
    () => InventoryProductVolumeDiscountVariantPriceCategory,
    (priceCategory) => priceCategory.volume_discount_variant
  )
  price_categories: InventoryProductVolumeDiscountVariantPriceCategory[];

  @BeforeInsert()
  generateId() {
    const timestamp = Date.now().toString(20);
    const randomStr = randomBytes(12).toString("hex");
    this.id = `${randomStr}${timestamp}`;
  }
}
