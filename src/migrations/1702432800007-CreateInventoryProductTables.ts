import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateInventoryProductTables1702432800007
  implements MigrationInterface
{
  name = "CreateInventoryProductTables1702432800007";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create inventory_products table - updated to match entity
    await queryRunner.query(`
      CREATE TABLE "inventory_products" (
        "id" BIGSERIAL PRIMARY KEY,
        "brand_id" bigint NOT NULL,
        "brand_code" varchar NOT NULL,
        "brand_name" varchar NOT NULL,
        "product_type_id" bigint NOT NULL,
        "product_type_code" varchar NOT NULL,
        "product_type_name" varchar NOT NULL,
        "unique_code" text,
        "sku" text NOT NULL,
        "product_name" text NOT NULL,
        "full_product_name" text NOT NULL,
        "vendor_sku" text,
        "description" text,
        "unit" varchar NOT NULL,
        "slug" text NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP
      )
    `);

    // Create inventory_product_categories table - updated to match entity
    await queryRunner.query(`
      CREATE TABLE "inventory_product_categories" (
        "id" BIGSERIAL PRIMARY KEY,
        "inventory_product_id" bigint NOT NULL,
        "product_category_id" bigint NOT NULL,
        "product_category_parent" bigint,
        "product_category_name" varchar NOT NULL,
        "category_hierarchy" smallint DEFAULT 1,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "fk_inventory_product_categories" FOREIGN KEY ("inventory_product_id") 
          REFERENCES "inventory_products"("id") ON DELETE CASCADE
      )
    `);

    // Create inventory_product_selected_variants table - updated to match entity
    await queryRunner.query(`
      CREATE TABLE "inventory_product_selected_variants" (
        "id" BIGSERIAL PRIMARY KEY,
        "inventory_product_id" bigint NOT NULL,
        "variant_id" bigint NOT NULL,
        "variant_name" varchar NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "fk_inventory_product_variants" FOREIGN KEY ("inventory_product_id") 
          REFERENCES "inventory_products"("id") ON DELETE CASCADE
      )
    `);

    // Create inventory_product_selected_variant_values table - updated to match entity
    await queryRunner.query(`
      CREATE TABLE "inventory_product_selected_variant_values" (
        "id" BIGSERIAL PRIMARY KEY,
        "inventory_product_variant_id" bigint NOT NULL,
        "variant_value_id" bigint NOT NULL,
        "variant_value_name" varchar NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "fk_inventory_product_variant_values" FOREIGN KEY ("inventory_product_variant_id") 
          REFERENCES "inventory_product_selected_variants"("id") ON DELETE CASCADE
      )
    `);

    // Create inventory_product_by_variants table - updated to match entity
    await queryRunner.query(`
      CREATE TABLE "inventory_product_by_variants" (
        "id" varchar PRIMARY KEY,
        "inventory_product_id" bigint NOT NULL,
        "full_product_name" text NOT NULL,
        "sku_product_variant" text NOT NULL,
        "sku_product_unique_code" text NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "fk_inventory_product_by_variants" FOREIGN KEY ("inventory_product_id") 
          REFERENCES "inventory_products"("id") ON DELETE CASCADE
      )
    `);

    // Create inventory_product_by_variant_histories table - updated to match entity
    await queryRunner.query(`
      CREATE TABLE "inventory_product_by_variant_histories" (
        "id" varchar PRIMARY KEY,
        "inventory_product_by_variant_id" varchar NOT NULL,
        "inventory_product_id" bigint NOT NULL,
        "full_product_name" text NOT NULL,
        "sku_product_variant" text NOT NULL,
        "sku_product_unique_code" integer NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "fk_inventory_product_histories_variant" FOREIGN KEY ("inventory_product_by_variant_id") 
          REFERENCES "inventory_product_by_variants"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_inventory_product_histories_product" FOREIGN KEY ("inventory_product_id") 
          REFERENCES "inventory_products"("id") ON DELETE CASCADE
      )
    `);

    // Create indexes
    await queryRunner.query(`
      CREATE INDEX "idx_inventory_products_brand_id" ON "inventory_products"("brand_id");
      CREATE INDEX "idx_inventory_products_product_type_id" ON "inventory_products"("product_type_id");
      CREATE INDEX "idx_inventory_products_sku" ON "inventory_products"("sku");
      CREATE INDEX "idx_inventory_products_slug" ON "inventory_products"("slug");
      
      CREATE INDEX "idx_inventory_product_categories" ON "inventory_product_categories"("inventory_product_id", "product_category_id");
      CREATE INDEX "idx_inventory_product_variants" ON "inventory_product_selected_variants"("inventory_product_id", "variant_id");
      CREATE INDEX "idx_inventory_product_variant_values" ON "inventory_product_selected_variant_values"("inventory_product_variant_id", "variant_value_id");
      CREATE INDEX "idx_inventory_product_by_variants" ON "inventory_product_by_variants"("inventory_product_id");
      CREATE INDEX "idx_inventory_product_histories" ON "inventory_product_by_variant_histories"("inventory_product_by_variant_id", "inventory_product_id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_inventory_product_histories"`
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_inventory_product_by_variants"`
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_inventory_product_variant_values"`
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_inventory_product_variants"`
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_inventory_product_categories"`
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_inventory_products_slug"`
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_inventory_products_sku"`
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_inventory_products_product_type_id"`
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_inventory_products_brand_id"`
    );

    // Drop tables in reverse order
    await queryRunner.query(
      `DROP TABLE IF EXISTS "inventory_product_by_variant_histories"`
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS "inventory_product_by_variants"`
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS "inventory_product_selected_variant_values"`
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS "inventory_product_selected_variants"`
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS "inventory_product_categories"`
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "inventory_products"`);
  }
}
