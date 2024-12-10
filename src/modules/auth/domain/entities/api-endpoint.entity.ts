import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "../../../common/entities/base.entity";
import { Role } from "../../../roles/domain/entities/role.entity";

@Entity("api_endpoints")
export class ApiEndpoint extends BaseEntity {
  @Column()
  path: string;

  @Column()
  method: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ default: false })
  is_public: boolean;

  @Column({ name: "role_id", nullable: true })
  role_id: number;

  @ManyToOne(() => Role)
  @JoinColumn({ name: "role_id" })
  role: Role;
}