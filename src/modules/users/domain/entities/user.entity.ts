import { Entity, Column } from "typeorm";
import { BaseEntity } from "../../../common/entities/base.entity";

@Entity("users")
export class User extends BaseEntity {
  @Column({ nullable: true })
  nip: string;

  @Column({ nullable: true })
  nik: string;

  @Column()
  first_name: string;

  @Column({ nullable: true })
  last_name: string;

  @Column({ nullable: true })
  photo_profile: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  phone_number: string;

  @Column({ type: "text", nullable: true })
  address: string;

  @Column({
    type: "boolean",
    default: true,
  })
  status: boolean;
}
