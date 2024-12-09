import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "../../../common/entities/base.entity";
import { User } from "../../../users/domain/entities/user.entity";

@Entity("auth_tokens")
export class AuthToken extends BaseEntity {
  @Column("bigint")
  user_id: number;

  @Column()
  refresh_token: string;

  @Column()
  expires_at: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user: User;
}