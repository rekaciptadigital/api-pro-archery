import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { BaseEntity } from "@/common/entities/base.entity";

@Entity("product_categories")
export class ProductCategory extends BaseEntity {
  @Column()
  name: string;

  @Column({ unique: true })
  code: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ name: "parent_id", nullable: true })
  parent_id: number | null;

  @Column({ type: "boolean", default: true })
  status: boolean;

  @ManyToOne(() => ProductCategory, (category) => category.children)
  @JoinColumn({ name: "parent_id" })
  parent: ProductCategory | null;

  @OneToMany(() => ProductCategory, (category) => category.parent)
  children: ProductCategory[];

  // Make hierarchy optional
  hierarchy?: ProductCategory | null;
}
