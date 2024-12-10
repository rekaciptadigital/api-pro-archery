import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { UUIDEntity } from "../../../../common/entities/uuid.entity";
import { User } from "../../../users/domain/entities/user.entity";

@Entity("user_sessions")
export class UserSession extends UUIDEntity {
  @Column("bigint")
  user_id!: number;

  @Column()
  token!: string;

  @Column({ nullable: true })
  ip_address!: string;

  @Column({ type: "text", nullable: true })
  user_agent!: string;

  @Column()
  last_activity!: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user!: User;
}