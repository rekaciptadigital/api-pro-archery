import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateProductsTable1702432800003 implements MigrationInterface {
  name = 'CreateProductsTable1702432800003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create products table
    await queryRunner.query(`
      CREATE TABLE "products" (
        "id" BIGSERIAL PRIMARY KEY,
        "name" varchar NOT NULL,
        "sku" varchar NOT NULL UNIQUE,
        "description" text,
        "brand_id" bigint NOT NULL,
        "tax_id" bigint,
        "base_price" decimal(10,2) NOT NULL,
        "status" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "fk_products_brand" 
          FOREIGN KEY ("brand_id") 
          REFERENCES "brands"("id") 
          ON DELETE RESTRICT,
        CONSTRAINT "fk_products_tax" 
          FOREIGN KEY ("tax_id") 
          REFERENCES "taxes"("id") 
          ON DELETE SET NULL
      )
    `);

    // Create product_variants table
    await queryRunner.query(`
      CREATE TABLE "product_variants" (
        "id" BIGSERIAL PRIMARY KEY,
        "product_id" bigint NOT NULL,
        "variant_values" json NOT NULL,
        "price" decimal(10,2) NOT NULL,
        "stock" integer NOT NULL,
        "status" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "fk_product_variants_product" 
          FOREIGN KEY ("product_id") 
          REFERENCES "products"("id") 
          ON DELETE CASCADE
      )
    `);

    // Create indexes
    await queryRunner.query(`
      CREATE INDEX "idx_products_name" ON "products" ("name");
      CREATE INDEX "idx_products_sku" ON "products" ("sku");
      CREATE INDEX "idx_products_brand_id" ON "products" ("brand_id");
      CREATE INDEX "idx_products_tax_id" ON "products" ("tax_id");
      CREATE INDEX "idx_products_status" ON "products" ("status");
      CREATE INDEX "idx_product_variants_product_id" ON "product_variants" ("product_id");
      CREATE INDEX "idx_product_variants_status" ON "product_variants" ("status");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_product_variants_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_product_variants_product_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_products_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_products_tax_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_products_brand_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_products_sku"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_products_name"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "product_variants"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "products"`);
  }
}