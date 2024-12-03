import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "../../../common/entities/base.entity";
import { User } from "../../../users/domain/entities/user.entity";
import { Role } from "../../../roles/domain/entities/role.entity";

@Entity("user_roles")
export class UserRole extends BaseEntity {
  @Column("bigint")
  user_id: number;

  @Column("bigint")
  role_id: number;

  @Column({ type: "boolean", default: true })
  status: boolean;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user: User;

  @ManyToOne(() => Role)
  @JoinColumn({ name: "role_id" })
  role: Role;
}