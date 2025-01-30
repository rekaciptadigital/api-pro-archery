import { Entity, Column, OneToMany } from "typeorm";
import { BaseEntity } from "@/common/entities/base.entity";
import { InventoryProductCategory } from "./inventory-product-category.entity";
import { InventoryProductSelectedVariant } from "./inventory-product-selected-variant.entity";
import { InventoryProductByVariant } from "./inventory-product-by-variant.entity";

@Entity("inventory_products")
export class InventoryProduct extends BaseEntity {
  @Column("bigint")
  brand_id: number;

  @Column()
  brand_code: string;

  @Column()
  brand_name: string;

  @Column("bigint")
  product_type_id: number;

  @Column()
  product_type_code: string;

  @Column()
  product_type_name: string;

  @Column("text", { nullable: true })
  unique_code: string;

  @Column("text")
  sku: string;

  @Column("text")
  product_name: string;

  @Column("text")
  full_product_name: string;

  @Column("text", { nullable: true })
  vendor_sku: string;

  @Column("text", { nullable: true })
  description: string;

  @Column()
  unit: string;

  @Column("text")
  slug: string;

  @OneToMany(
    () => InventoryProductCategory,
    (category) => category.inventory_product,
    {
      cascade: true,
    }
  )
  categories: InventoryProductCategory[];

  @OneToMany(
    () => InventoryProductSelectedVariant,
    (variant) => variant.inventory_product,
    {
      cascade: true,
    }
  )
  variants: InventoryProductSelectedVariant[];

  @OneToMany(
    () => InventoryProductByVariant,
    (productVariant) => productVariant.inventory_product,
    {
      cascade: true,
    }
  )
  product_by_variant: InventoryProductByVariant[];
}
