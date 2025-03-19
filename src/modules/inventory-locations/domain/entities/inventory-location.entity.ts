import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { BaseEntity } from "@/common/entities/base.entity";

@Entity("inventory_locations")
export class InventoryLocation extends BaseEntity {
  @Column({ length: 20 })
  code: string;

  @Column()
  name: string;

  @Column({ length: 50 })
  type: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "boolean", default: true })
  status: boolean;

  @Column({ name: "parent_id", nullable: true })
  parent_id: number | null;

  @ManyToOne(() => InventoryLocation, (location) => location.children)
  @JoinColumn({ name: "parent_id" })
  parent: InventoryLocation | null;

  @OneToMany(() => InventoryLocation, (location) => location.parent)
  children: InventoryLocation[];
}
