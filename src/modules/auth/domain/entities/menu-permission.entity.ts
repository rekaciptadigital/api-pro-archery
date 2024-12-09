import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "../../../common/entities/base.entity";
import { Role } from "../../../roles/domain/entities/role.entity";

@Entity("menu_permissions")
export class MenuPermission extends BaseEntity {
  @Column("bigint")
  role_id: number;

  @Column()
  menu_key: string;

  @Column({ default: false })
  can_view: boolean;

  @Column({ default: false })
  can_create: boolean;

  @Column({ default: false })
  can_edit: boolean;

  @Column({ default: false })
  can_delete: boolean;

  @ManyToOne(() => Role)
  @JoinColumn({ name: "role_id" })
  role: Role;
}