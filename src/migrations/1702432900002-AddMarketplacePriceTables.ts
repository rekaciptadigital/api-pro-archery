import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMarketplacePriceTables1702432900002
  implements MigrationInterface
{
  name = "AddMarketplacePriceTables1702432900002";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create inventory_product_marketplace_category_prices table
    await queryRunner.query(`
      CREATE TABLE "inventory_product_marketplace_category_prices" (
        "id" BIGSERIAL PRIMARY KEY,
        "inventory_product_pricing_information_id" BIGINT NOT NULL,
        "price_category_id" BIGINT NOT NULL,
        "price_category_name" VARCHAR(255) NOT NULL,
        "price_category_percentage" NUMERIC(10,2) NOT NULL,
        "price_category_set_default" BOOLEAN NOT NULL DEFAULT false,
        "price" NUMERIC(19,2) NOT NULL DEFAULT 0,
        "price_category_custom_percentage" NUMERIC(10,2) NOT NULL,
        "is_custom_price_category" BOOLEAN NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "fk_inventory_product_marketplace_category_prices_pricing" FOREIGN KEY ("inventory_product_pricing_information_id") REFERENCES "inventory_product_pricing_informations"("id") ON DELETE CASCADE
      )
    `);

    // Remove inventory_product_id field from inventory_product_customer_category_price_histories table
    await queryRunner.query(`
      ALTER TABLE "inventory_product_customer_category_price_histories"
      DROP COLUMN "inventory_product_id"
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_ipmp_price_category_id" ON "inventory_product_marketplace_category_prices" ("price_category_id")
    `);

    // Create inventory_product_marketplace_category_price_histories table
    await queryRunner.query(`
      CREATE TABLE "inventory_product_marketplace_category_price_histories" (
        "id" VARCHAR(255) PRIMARY KEY,
        "inventory_product_pricing_information_history_id" VARCHAR(255) NOT NULL,
        "price_category_id" BIGINT NOT NULL,
        "price_category_name" VARCHAR(255) NOT NULL,
        "price_category_percentage" NUMERIC(10,2) NOT NULL,
        "price_category_set_default" BOOLEAN NOT NULL DEFAULT false,
        "price" NUMERIC(19,2) NOT NULL DEFAULT 0,
        "price_category_custom_percentage" NUMERIC(10,2) NOT NULL,
        "is_custom_price_category" BOOLEAN NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    // Add missing fields to inventory_product_volume_discount_variant_price_categories table
    await queryRunner.query(`
      ALTER TABLE "inventory_product_volume_discount_variant_price_categories"
      ADD COLUMN "price_category_custom_percentage" NUMERIC(10,2) NOT NULL DEFAULT 0,
      ADD COLUMN "is_custom_price_category" BOOLEAN NOT NULL DEFAULT false
    `);

    // Add missing fields to inventory_product_volume_discount_variant_price_cat_his table
    await queryRunner.query(`
      ALTER TABLE "inventory_product_volume_discount_variant_price_cat_his"
      ADD COLUMN "price_category_custom_percentage" NUMERIC(10,2) NOT NULL DEFAULT 0,
      ADD COLUMN "is_custom_price_category" BOOLEAN NOT NULL DEFAULT false
    `);

    // Add missing fields to inventory_product_global_discount_price_categories table
    await queryRunner.query(`
      ALTER TABLE "inventory_product_global_discount_price_categories"
      ADD COLUMN "price_category_custom_percentage" NUMERIC(10,2) NOT NULL DEFAULT 0,
      ADD COLUMN "is_custom_price_category" BOOLEAN NOT NULL DEFAULT false
    `);

    // Add missing fields to inventory_product_global_discount_price_category_histories table
    await queryRunner.query(`
      ALTER TABLE "inventory_product_global_discount_price_category_histories"
      ADD COLUMN "price_category_custom_percentage" NUMERIC(10,2) NOT NULL DEFAULT 0,
      ADD COLUMN "is_custom_price_category" BOOLEAN NOT NULL DEFAULT false
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove fields from inventory_product_global_discount_price_category_histories table
    await queryRunner.query(`
      ALTER TABLE "inventory_product_global_discount_price_category_histories"
      DROP COLUMN "is_custom_price_category",
      DROP COLUMN "price_category_custom_percentage"
    `);

    // Remove fields from inventory_product_global_discount_price_categories table
    await queryRunner.query(`
      ALTER TABLE "inventory_product_global_discount_price_categories"
      DROP COLUMN "is_custom_price_category",
      DROP COLUMN "price_category_custom_percentage"
    `);

    // Remove fields from inventory_product_volume_discount_variant_price_cat_his table
    await queryRunner.query(`
      ALTER TABLE "inventory_product_volume_discount_variant_price_cat_his"
      DROP COLUMN "is_custom_price_category",
      DROP COLUMN "price_category_custom_percentage"
    `);

    // Remove fields from inventory_product_volume_discount_variant_price_categories table
    await queryRunner.query(`
      ALTER TABLE "inventory_product_volume_discount_variant_price_categories"
      DROP COLUMN "is_custom_price_category",
      DROP COLUMN "price_category_custom_percentage"
    `);

    // Drop inventory_product_marketplace_category_price_histories table
    await queryRunner.query(
      `DROP TABLE "inventory_product_marketplace_category_price_histories"`
    );

    // Drop inventory_product_marketplace_category_prices table
    await queryRunner.query(`DROP INDEX "idx_ipmp_price_category_id"`);
    await queryRunner.query(
      `DROP TABLE "inventory_product_marketplace_category_prices"`
    );
  }
}
