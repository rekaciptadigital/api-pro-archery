import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  BeforeInsert,
  AfterInsert,
  AfterUpdate,
  AfterSoftRemove,
  getManager,
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

  @Column({ type: "timestamp", nullable: true })
  deleted_at: Date;

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
    // Generate a random string ID (not UUID)
    this.id = randomBytes(12).toString("hex");
  }

  @AfterInsert()
  @AfterUpdate()
  @AfterSoftRemove()
  async createHistory() {
    const history = {
      id: randomBytes(12).toString("hex"),
      inventory_product_by_variant_id: this.id,
      inventory_product_id: this.inventory_product_id,
      full_product_name: this.full_product_name,
      sku_product_variant: this.sku_product_variant,
      sku_product_unique_code: this.sku_product_unique_code,
    };

    await getManager()
      .getRepository("inventory_product_by_variant_histories")
      .save(history);
  }
}
