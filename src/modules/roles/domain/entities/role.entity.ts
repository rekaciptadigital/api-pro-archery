import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('roles')
export class Role extends BaseEntity {
  @Column({ nullable: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'boolean', default: true })
  status: boolean;
}