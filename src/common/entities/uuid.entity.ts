import { CreateDateColumn, UpdateDateColumn, DeleteDateColumn, PrimaryGeneratedColumn } from 'typeorm';

export abstract class UUIDEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @DeleteDateColumn()
  deleted_at!: Date | null;
}