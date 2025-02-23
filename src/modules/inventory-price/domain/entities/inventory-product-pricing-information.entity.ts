import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { InventoryProductCustomerCategoryPrice } from "./inventory-product-customer-category-price.entity";
import { InventoryProductGlobalDiscount } from "./inventory-product-global-discount.entity";
import { InventoryProductVolumeDiscountVariant } from "./inventory-product-volume-discount-variant.entity";
import { InventoryProduct } from "@/modules/inventory/domain/entities/inventory-product.entity";

@Entity("inventory_product_pricing_informations")
export class InventoryProductPricingInformation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "bigint" })
  inventory_product_id: number;

  @Column({ type: "numeric", precision: 19, scale: 2, default: 0 })
  usd_price: number;

  @Column({ type: "numeric", precision: 19, scale: 2, default: 0 })
  exchange_rate: number;

  @Column({ type: "numeric", precision: 19, scale: 2, default: 0 })
  adjustment_percentage: number;

  @Column({ type: "numeric", precision: 19, scale: 2, default: 0 })
  price_hb_real: number;

  @Column({ type: "numeric", precision: 19, scale: 2, default: 0 })
  hb_adjustment_price: number;

  @Column({ type: "boolean", default: false })
  is_manual_product_variant_price_edit: boolean;

  @Column({ type: "boolean", default: false })
  is_enable_volume_discount: boolean;

  @Column({ type: "boolean", default: false })
  is_enable_volume_discount_by_product_variant: boolean;

  @OneToMany(
    () => InventoryProductCustomerCategoryPrice,
    (price) => price.pricing_information
  )
  customer_category_prices: InventoryProductCustomerCategoryPrice[];

  @OneToMany(
    () => InventoryProductGlobalDiscount,
    (discount) => discount.pricing_information
  )
  global_discounts: InventoryProductGlobalDiscount[];

  @OneToMany(
    () => InventoryProductVolumeDiscountVariant,
    (variant) => variant.pricing_information
  )
  volume_discount_variants: InventoryProductVolumeDiscountVariant[];

  @ManyToOne(() => InventoryProduct)
  @JoinColumn({ name: "inventory_product_id" })
  inventory_product: InventoryProduct;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at: Date;

  @DeleteDateColumn({ type: "timestamp", nullable: true })
  deleted_at: Date | null;
}
