import { Entity, Column, ManyToOne, JoinColumn, BeforeInsert } from "typeorm";
import { randomBytes } from "crypto";
import { VarPrimary } from "@/common/entities/varPrimary.entity";
import { User } from "../../../users/domain/entities/user.entity";

@Entity("user_sessions")
export class UserSession extends VarPrimary {
  @Column("varchar", { primary: true })
  id: string;

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

  @BeforeInsert()
  generateId() {
    const timestamp = Date.now().toString(20);
    const randomStr = randomBytes(12).toString("hex");
    this.id = `${randomStr}${timestamp}`;
  }
}
