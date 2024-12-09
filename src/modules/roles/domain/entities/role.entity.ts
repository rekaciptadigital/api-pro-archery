import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { RoleFeaturePermission } from '../../../permissions/domain/entities/role-feature-permission.entity';

@Entity('roles')
export class Role extends BaseEntity {
  @Column({ nullable: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'boolean', default: true })
  status: boolean;

  @OneToMany(() => RoleFeaturePermission, permission => permission.role)
  role_feature_permissions: RoleFeaturePermission[];
}