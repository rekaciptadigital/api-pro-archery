import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  PrimaryColumn,
} from "typeorm";
import { VarPrimary } from "@/common/entities/varPrimary.entity";
import { InventoryProduct } from "./inventory-product.entity";
import { InventoryProductByVariant } from "./inventory-product-by-variant.entity";
import { randomBytes } from "crypto";

@Entity("inventory_product_by_variant_histories")
export class InventoryProductByVariantHistory extends VarPrimary {
  @Column("varchar")
  inventory_product_by_variant_id: string;

  @Column("bigint")
  inventory_product_id: number;

  @Column("text")
  full_product_name: string;

  @Column("text")
  sku_product_variant: string;

  @Column("integer")
  sku_product_unique_code: number;

  @ManyToOne(() => InventoryProductByVariant, (variant) => variant.histories, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "inventory_product_by_variant_id" })
  inventory_product_by_variant: InventoryProductByVariant;

  @ManyToOne(() => InventoryProduct, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "inventory_product_id" })
  inventory_product: InventoryProduct;

  @BeforeInsert()
  generateId() {
    // Generate a random string ID (not UUID)
    this.id = randomBytes(12).toString("hex");
  }
}
