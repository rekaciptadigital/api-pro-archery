import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { NotDeleteAndUpdateAt } from "@/common/entities/notDeleteAndUpdateAt.entity";
import { InventoryProduct } from "./inventory-product.entity";
import { InventoryProductSelectedVariantValue } from "./inventory-product-selected-variant-value.entity";

@Entity("inventory_product_selected_variants")
export class InventoryProductSelectedVariant extends NotDeleteAndUpdateAt {
  @Column("bigint")
  inventory_product_id: number;

  @Column("bigint")
  variant_id: number;

  @Column()
  variant_name: string;

  @ManyToOne(() => InventoryProduct, (product) => product.variants, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "inventory_product_id" })
  inventory_product: InventoryProduct;

  @OneToMany(
    () => InventoryProductSelectedVariantValue,
    (value) => value.inventory_product_variant,
    {
      cascade: true,
    }
  )
  values: InventoryProductSelectedVariantValue[];
}
