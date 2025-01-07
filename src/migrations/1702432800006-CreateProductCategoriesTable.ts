import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateProductCategoriesTable1702432800006 implements MigrationInterface {
  name = 'CreateProductCategoriesTable1702432800006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "product_categories" (
        "id" BIGSERIAL PRIMARY KEY,
        "name" varchar NOT NULL,
        "code" varchar NOT NULL UNIQUE,
        "description" text,
        "parent_id" bigint,
        "status" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "fk_product_categories_parent" 
          FOREIGN KEY ("parent_id") 
          REFERENCES "product_categories"("id") 
          ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_product_categories_name" ON "product_categories" ("name");
      CREATE INDEX "idx_product_categories_code" ON "product_categories" ("code");
      CREATE INDEX "idx_product_categories_parent_id" ON "product_categories" ("parent_id");
      CREATE INDEX "idx_product_categories_status" ON "product_categories" ("status");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_product_categories_status"`);
    await queryRunner.query(`DROP INDEX "idx_product_categories_parent_id"`);
    await queryRunner.query(`DROP INDEX "idx_product_categories_code"`);
    await queryRunner.query(`DROP INDEX "idx_product_categories_name"`);
    await queryRunner.query(`DROP TABLE "product_categories"`);
  }
}