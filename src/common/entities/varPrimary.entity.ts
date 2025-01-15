import { CreateDateColumn, PrimaryColumn, UpdateDateColumn } from "typeorm";

export abstract class VarPrimary {
  @PrimaryColumn("varchar")
  id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
