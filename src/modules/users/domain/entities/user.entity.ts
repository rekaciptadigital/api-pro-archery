import { Entity, Column, OneToMany, JoinColumn } from "typeorm";
import { BaseEntity } from "../../../common/entities/base.entity";
import { UserRole } from "../../../user-roles/domain/entities/user-role.entity";

@Entity("users")
export class User extends BaseEntity {
  @Column({ type: 'varchar', length: 255, nullable: true })
  nip: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  nik: string;

  @Column({ type: 'varchar', length: 255, name: 'first_name' })
  first_name: string;

  @Column({ type: 'varchar', length: 255, name: 'last_name', nullable: true })
  last_name: string;

  @Column({ type: 'varchar', length: 255, name: 'photo_profile', nullable: true })
  photo_profile: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'varchar', length: 255, name: 'phone_number', nullable: true })
  phone_number: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'boolean', default: true })
  status: boolean;

  @OneToMany(() => UserRole, userRole => userRole.user)
  @JoinColumn()
  user_roles: UserRole[];
}