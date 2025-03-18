import { Entity, Column } from "typeorm";
import { BaseEntity } from "@/common/entities/base.entity";

@Entity("price_categories")
export class PriceCategory extends BaseEntity {
  @Column()
  type: string;

  @Column()
  name: string;

  @Column({ type: "text", nullable: true })
  formula: string;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  percentage: number;

  @Column({ type: "boolean", default: true })
  status: boolean;

  @Column({ type: "boolean", default: false })
  set_default: boolean;
}
