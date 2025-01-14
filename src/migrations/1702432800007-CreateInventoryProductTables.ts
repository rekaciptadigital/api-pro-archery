import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateInventoryProductTables1702432800007 implements MigrationInterface {
  name = 'CreateInventoryProductTables1702432800007';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create inventory_products table
    await queryRunner.query(`
      CREATE TABLE "inventory_products" (
        "id" BIGSERIAL PRIMARY KEY,
        "brand_id" bigint NOT NULL,
        "brand_code" varchar(255) NOT NULL,
        "brand_name" varchar(255) NOT NULL,
        "product_type_id" bigint NOT NULL,
        "product_type_code" varchar(255) NOT NULL,
        "product_type_name" varchar(255) NOT NULL,
        "unique_code" varchar(50),
        "sku" text NOT NULL,
        "product_name" varchar(255) NOT NULL,
        "full_product_name" text NOT NULL,
        "vendor_sku" text,
        "description" text,
        "unit" varchar(255) NOT NULL,
        "slug" varchar(255) NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP
      )
    `);

    // Create inventory_product_categories table
    await queryRunner.query(`
      CREATE TABLE "inventory_product_categories" (
        "id" BIGSERIAL PRIMARY KEY,
        "inventory_product_id" bigint NOT NULL,
        "product_category_id" bigint NOT NULL,
        "product_category_parent" bigint,
        "product_category_name" varchar(255) NOT NULL,
        "category_hierarchy" smallint NOT NULL DEFAULT 1,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        FOREIGN KEY ("inventory_product_id") REFERENCES "inventory_products" ("id") ON DELETE CASCADE
      )
    `);

    // Create inventory_product_selected_variants table
    await queryRunner.query(`
      CREATE TABLE "inventory_product_selected_variants" (
        "id" BIGSERIAL PRIMARY KEY,
        "inventory_product_id" bigint NOT NULL,
        "variant_id" bigint NOT NULL,
        "variant_name" varchar(255) NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        FOREIGN KEY ("inventory_product_id") REFERENCES "inventory_products" ("id") ON DELETE CASCADE
      )
    `);

    // Create inventory_product_selected_variant_values table
    await queryRunner.query(`
      CREATE TABLE "inventory_product_selected_variant_values" (
        "id" BIGSERIAL PRIMARY KEY,
        "inventory_product_variant_id" bigint NOT NULL,
        "variant_value_id" bigint NOT NULL,
        "variant_value_name" varchar(255) NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        FOREIGN KEY ("inventory_product_variant_id") REFERENCES "inventory_product_selected_variants" ("id") ON DELETE CASCADE
      )
    `);

    // Create inventory_product_by_variants table
    await queryRunner.query(`
      CREATE TABLE "inventory_product_by_variants" (
        "id" varchar(255) PRIMARY KEY,
        "inventory_product_id" bigint NOT NULL,
        "full_product_name" text NOT NULL,
        "sku_product_variant" text NOT NULL,
        "sku_product_unique_code" integer NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        FOREIGN KEY ("inventory_product_id") REFERENCES "inventory_products" ("id") ON DELETE CASCADE
      )
    `);

    // Create inventory_product_by_variant_histories table
    await queryRunner.query(`
      CREATE TABLE "inventory_product_by_variant_histories" (
        "id" varchar(255) PRIMARY KEY,
        "inventory_product_by_variant_id" varchar(255) NOT NULL,
        "inventory_product_id" bigint NOT NULL,
        "full_product_name" text NOT NULL,
        "sku_product_variant" text NOT NULL,
        "sku_product_unique_code" integer NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        FOREIGN KEY ("inventory_product_by_variant_id") REFERENCES "inventory_product_by_variants" ("id") ON DELETE CASCADE,
        FOREIGN KEY ("inventory_product_id") REFERENCES "inventory_products" ("id") ON DELETE CASCADE
      )
    `);

    // Create indexes
    await queryRunner.query(`
      CREATE INDEX "idx_inventory_products_brand_id" ON "inventory_products" ("brand_id");
      CREATE INDEX "idx_inventory_products_product_type_id" ON "inventory_products" ("product_type_id");
      CREATE INDEX "idx_inventory_products_unique_code" ON "inventory_products" ("unique_code");
      CREATE INDEX "idx_inventory_products_sku" ON "inventory_products" ("sku");
      CREATE INDEX "idx_inventory_products_slug" ON "inventory_products" ("slug");
      
      CREATE INDEX "idx_inventory_product_categories_product_id" ON "inventory_product_categories" ("inventory_product_id");
      CREATE INDEX "idx_inventory_product_categories_category_id" ON "inventory_product_categories" ("product_category_id");
      
      CREATE INDEX "idx_inventory_product_variants_product_id" ON "inventory_product_selected_variants" ("inventory_product_id");
      CREATE INDEX "idx_inventory_product_variants_variant_id" ON "inventory_product_selected_variants" ("variant_id");
      
      CREATE INDEX "idx_inventory_product_variant_values_variant_id" ON "inventory_product_selected_variant_values" ("inventory_product_variant_id");
      
      CREATE INDEX "idx_inventory_product_by_variants_product_id" ON "inventory_product_by_variants" ("inventory_product_id");
      
      CREATE INDEX "idx_inventory_product_histories_variant_id" ON "inventory_product_by_variant_histories" ("inventory_product_by_variant_id");
      CREATE INDEX "idx_inventory_product_histories_product_id" ON "inventory_product_by_variant_histories" ("inventory_product_id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_inventory_product_histories_product_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_inventory_product_histories_variant_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_inventory_product_by_variants_product_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_inventory_product_variant_values_variant_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_inventory_product_variants_variant_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_inventory_product_variants_product_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_inventory_product_categories_category_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_inventory_product_categories_product_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_inventory_products_slug"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_inventory_products_sku"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_inventory_products_unique_code"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_inventory_products_product_type_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_inventory_products_brand_id"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE IF EXISTS "inventory_product_by_variant_histories"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "inventory_product_by_variants"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "inventory_product_selected_variant_values"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "inventory_product_selected_variants"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "inventory_product_categories"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "inventory_products"`);
  }
}