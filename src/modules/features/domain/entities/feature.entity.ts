import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('features')
export class Feature extends BaseEntity {
  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;
}