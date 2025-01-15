import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { NotDeleteAndUpdateAt } from "@/common/entities/notDeleteAndUpdateAt.entity";
import { InventoryProductSelectedVariant } from "./inventory-product-selected-variant.entity";

@Entity("inventory_product_selected_variant_values")
export class InventoryProductSelectedVariantValue extends NotDeleteAndUpdateAt {
  @Column("bigint")
  inventory_product_variant_id: number;

  @Column("bigint")
  variant_value_id: number;

  @Column()
  variant_value_name: string;

  @ManyToOne(
    () => InventoryProductSelectedVariant,
    (variant) => variant.values,
    {
      onDelete: "CASCADE",
    }
  )
  @JoinColumn({ name: "inventory_product_variant_id" })
  inventory_product_variant: InventoryProductSelectedVariant;
}
