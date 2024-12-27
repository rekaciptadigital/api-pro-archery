import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateProductTypesTable1702432800004 implements MigrationInterface {
  name = 'CreateProductTypesTable1702432800004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "product_types" (
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
      CREATE INDEX "idx_product_types_name" ON "product_types" ("name");
      CREATE INDEX "idx_product_types_code" ON "product_types" ("code");
      CREATE INDEX "idx_product_types_status" ON "product_types" ("status");
      CREATE INDEX "idx_product_types_deleted_at" ON "product_types" ("deleted_at");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_product_types_deleted_at"`);
    await queryRunner.query(`DROP INDEX "idx_product_types_status"`);
    await queryRunner.query(`DROP INDEX "idx_product_types_code"`);
    await queryRunner.query(`DROP INDEX "idx_product_types_name"`);
    await queryRunner.query(`DROP TABLE "product_types"`);
  }
}