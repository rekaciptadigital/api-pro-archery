import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "../../../common/entities/base.entity";
import { Role } from "../../../roles/domain/entities/role.entity";
import { Feature } from "../../../features/domain/entities/feature.entity";

@Entity("role_feature_permissions")
export class RoleFeaturePermission extends BaseEntity {
  @Column("bigint")
  role_id: number;

  @Column("bigint")
  feature_id: number;

  @Column("json")
  methods: Record<string, boolean>;

  @Column({
    type: "boolean",
    default: true,
  })
  status: boolean;

  @ManyToOne(() => Role)
  @JoinColumn({ name: "role_id" })
  role: Role;

  @ManyToOne(() => Feature)
  @JoinColumn({ name: "feature_id" })
  feature: Feature;
}
