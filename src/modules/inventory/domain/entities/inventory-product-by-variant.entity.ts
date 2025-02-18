import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  BeforeInsert,
  DeleteDateColumn,
} from "typeorm";
import { VarPrimary } from "@/common/entities/varPrimary.entity";
import { InventoryProduct } from "./inventory-product.entity";
import { InventoryProductByVariantHistory } from "./inventory-product-by-variant-history.entity";
import { randomBytes } from "crypto";

@Entity("inventory_product_by_variants")
export class InventoryProductByVariant extends VarPrimary {
  @Column("varchar", { primary: true })
  id: string;

  @Column("bigint")
  inventory_product_id: number;

  @Column("text")
  full_product_name: string;

  @Column("text")
  sku_product_variant: string;

  @Column("text")
  sku_product_unique_code: string;

  @DeleteDateColumn()
  deleted_at: Date;

  @Column("boolean", { default: true })
  status: boolean;

  @ManyToOne(() => InventoryProduct, (product) => product.product_by_variant, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "inventory_product_id" })
  inventory_product: InventoryProduct;

  @OneToMany(
    () => InventoryProductByVariantHistory,
    (history) => history.inventory_product_by_variant,
    {
      cascade: true,
    }
  )
  histories: InventoryProductByVariantHistory[];

  @BeforeInsert()
  generateId() {
    const timestamp = Date.now().toString(20);
    const randomStr = randomBytes(12).toString("hex");
    this.id = `${randomStr}${timestamp}`;
  }
}
