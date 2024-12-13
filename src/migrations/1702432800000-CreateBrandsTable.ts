import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateBrandsTable1702432800000 implements MigrationInterface {
  name = 'CreateBrandsTable1702432800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "brands" (
        "id" BIGSERIAL PRIMARY KEY,
        "name" varchar NOT NULL,
        "code" varchar NOT NULL UNIQUE,
        "description" text,
        "status" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_brands_name" ON "brands" ("name");
      CREATE INDEX "idx_brands_code" ON "brands" ("code");
      CREATE INDEX "idx_brands_status" ON "brands" ("status");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_brands_status"`);
    await queryRunner.query(`DROP INDEX "idx_brands_code"`);
    await queryRunner.query(`DROP INDEX "idx_brands_name"`);
    await queryRunner.query(`DROP TABLE "brands"`);
  }
}