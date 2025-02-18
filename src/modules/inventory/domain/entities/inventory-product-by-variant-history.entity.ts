import { randomBytes } from "crypto";
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";
import { InventoryProductByVariant } from "./inventory-product-by-variant.entity";
import { InventoryProduct } from "./inventory-product.entity";

@Entity("inventory_product_by_variant_histories")
export class InventoryProductByVariantHistory {
  @PrimaryColumn("varchar")
  id: string;

  @Column("varchar")
  inventory_product_by_variant_id: string;

  @Column("bigint")
  inventory_product_id: number;

  @Column("bigint", { nullable: true })
  user_id: number;

  @Column("text")
  full_product_name: string;

  @Column("text")
  sku_product_variant: string;

  @Column("text")
  sku_product_unique_code: string;

  @Column("text", { nullable: true })
  sku_vendor: string;

  @Column("boolean", { default: true })
  status: boolean;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

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
    const timestamp = Date.now().toString(20);
    const randomStr = randomBytes(12).toString("hex");
    this.id = `${randomStr}${timestamp}`;
  }
}
