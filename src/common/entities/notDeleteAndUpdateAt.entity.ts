import { CreateDateColumn, PrimaryGeneratedColumn } from "typeorm";

export abstract class NotDeleteAndUpdateAt {
  @PrimaryGeneratedColumn()
  id!: number;

  @CreateDateColumn()
  created_at!: Date;
}
