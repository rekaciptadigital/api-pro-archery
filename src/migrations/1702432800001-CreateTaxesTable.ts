import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTaxesTable1702432800001 implements MigrationInterface {
  name = 'CreateTaxesTable1702432800001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "taxes" (
        "id" BIGSERIAL PRIMARY KEY,
        "name" varchar NOT NULL,
        "description" text,
        "percentage" decimal(5,2) NOT NULL,
        "status" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_taxes_name" ON "taxes" ("name");
      CREATE INDEX "idx_taxes_status" ON "taxes" ("status");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_taxes_status"`);
    await queryRunner.query(`DROP INDEX "idx_taxes_name"`);
    await queryRunner.query(`DROP TABLE "taxes"`);
  }
}