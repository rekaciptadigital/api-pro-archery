import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { NotDeleteAndUpdateAt } from "@/common/entities/notDeleteAndUpdateAt.entity";
import { InventoryProduct } from "./inventory-product.entity";

@Entity("inventory_product_categories")
export class InventoryProductCategory extends NotDeleteAndUpdateAt {
  @Column("bigint")
  inventory_product_id: number;

  @Column("bigint")
  product_category_id: number;

  @Column("bigint", { nullable: true })
  product_category_parent: number | null;

  @Column()
  product_category_name: string;

  @Column("smallint", { default: 1 })
  category_hierarchy: number;

  @ManyToOne(() => InventoryProduct, (product) => product.categories, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "inventory_product_id" })
  inventory_product: InventoryProduct;
}
