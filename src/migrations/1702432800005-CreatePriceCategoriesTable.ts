import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePriceCategoriesTable1702432800005 implements MigrationInterface {
  name = 'CreatePriceCategoriesTable1702432800005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "price_categories" (
        "id" BIGSERIAL PRIMARY KEY,
        "type" varchar NOT NULL,
        "name" varchar NOT NULL,
        "formula" text,
        "percentage" decimal(10,2) NOT NULL,
        "status" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "uq_price_categories_type_name" UNIQUE ("type", "name")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_price_categories_type" ON "price_categories" ("type");
      CREATE INDEX "idx_price_categories_name" ON "price_categories" ("name");
      CREATE INDEX "idx_price_categories_status" ON "price_categories" ("status");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_price_categories_status"`);
    await queryRunner.query(`DROP INDEX "idx_price_categories_name"`);
    await queryRunner.query(`DROP INDEX "idx_price_categories_type"`);
    await queryRunner.query(`DROP TABLE "price_categories"`);
  }
}