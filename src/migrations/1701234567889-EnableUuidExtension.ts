import { MigrationInterface, QueryRunner } from "typeorm";

export class EnableUuidExtension1701234567889 implements MigrationInterface {
  name = "EnableUuidExtension1701234567889";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // PostgreSQL 16 has built-in UUID support, no need for uuid-ossp
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP EXTENSION IF EXISTS "pgcrypto"`);
  }
}