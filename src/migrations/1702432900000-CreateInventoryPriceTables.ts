import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateInventoryPriceTables1702432900000
  implements MigrationInterface
{
  name = "CreateInventoryPriceTables1702432900000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create inventory_product_pricing_informations table
    await queryRunner.query(`
      CREATE TABLE "inventory_product_pricing_informations" (
        "id" BIGSERIAL PRIMARY KEY,
        "inventory_product_id" BIGINT NOT NULL,
        "usd_price" NUMERIC(19,2) NOT NULL DEFAULT 0,
        "exchange_rate" NUMERIC(19,2) NOT NULL DEFAULT 0,
        "adjustment_percentage" NUMERIC(19,2) NOT NULL DEFAULT 0,
        "price_hb_real" NUMERIC(19,2) NOT NULL DEFAULT 0,
        "hb_adjustment_price" NUMERIC(19,2) NOT NULL DEFAULT 0,
        "is_manual_product_variant_price_edit" BOOLEAN NOT NULL DEFAULT false,
        "is_enable_volume_discount" BOOLEAN NOT NULL DEFAULT false,
        "is_enable_volume_discount_by_product_variant" BOOLEAN NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_inventory_product_pricing_informations_inventory_product_id" ON "inventory_product_pricing_informations" ("inventory_product_id")
    `);

    // Create inventory_product_customer_category_prices table
    await queryRunner.query(`
      CREATE TABLE "inventory_product_customer_category_prices" (
        "id" BIGSERIAL PRIMARY KEY,
        "inventory_product_pricing_information_id" BIGINT NOT NULL,
        "price_category_id" BIGINT NOT NULL,
        "price_category_name" VARCHAR(255) NOT NULL,
        "price_category_percentage" NUMERIC(10,2) NOT NULL,
        "price_category_set_default" BOOLEAN NOT NULL DEFAULT false,
        "pre_tax_price" NUMERIC(19,2) NOT NULL DEFAULT 0,
        "tax_inclusive_price" NUMERIC(19,2) NOT NULL DEFAULT 0,
        "tax_id" BIGINT NOT NULL,
        "tax_percentage" NUMERIC(19,2) NOT NULL DEFAULT 0,
        "is_custom_tax_inclusive_price" BOOLEAN NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_ipccp_price_category_id" ON "inventory_product_customer_category_prices" ("price_category_id")
    `);

    // Create inventory_product_by_variant_prices table
    await queryRunner.query(`
      CREATE TABLE "inventory_product_by_variant_prices" (
        "id" VARCHAR(255) PRIMARY KEY,
        "inventory_product_by_variant_id" VARCHAR(255) NOT NULL,
        "price_category_id" BIGINT NOT NULL,
        "price" NUMERIC(19,2) NOT NULL DEFAULT 0,
        "status" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_ipbvp_price_category_id" ON "inventory_product_by_variant_prices" ("price_category_id")
    `);

    // Create inventory_product_global_discounts table
    await queryRunner.query(`
      CREATE TABLE "inventory_product_global_discounts" (
        "id" VARCHAR(255) PRIMARY KEY,
        "inventory_product_pricing_information_id" BIGINT NOT NULL,
        "quantity" INTEGER NOT NULL DEFAULT 0,
        "discount_percentage" NUMERIC(19,2) NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    // Create inventory_product_global_discount_price_categories table
    await queryRunner.query(`
      CREATE TABLE "inventory_product_global_discount_price_categories" (
        "id" VARCHAR(255) PRIMARY KEY,
        "inventory_product_global_discount_id" VARCHAR(255) NOT NULL,
        "price_category_id" BIGINT NOT NULL,
        "price_category_name" VARCHAR(255) NOT NULL,
        "price_category_percentage" NUMERIC(10,2) NOT NULL,
        "price_category_set_default" BOOLEAN NOT NULL DEFAULT false,
        "price" NUMERIC(19,2) NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    // Create inventory_product_volume_discount_variants table
    await queryRunner.query(`
      CREATE TABLE "inventory_product_volume_discount_variants" (
        "id" VARCHAR(255) PRIMARY KEY,
        "inventory_product_pricing_information_id" BIGINT NOT NULL,
        "inventory_product_by_variant_id" VARCHAR(255) NOT NULL,
        "inventory_product_by_variant_full_product_name" TEXT NOT NULL,
        "inventory_product_by_variant_sku" TEXT NOT NULL,
        "quantity" INTEGER NOT NULL DEFAULT 0,
        "discount_percentage" NUMERIC(19,2) NOT NULL,
        "status" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    // Create inventory_product_volume_discount_variant_price_categories table
    await queryRunner.query(`
      CREATE TABLE "inventory_product_volume_discount_variant_price_categories" (
        "id" VARCHAR(255) PRIMARY KEY,
        "inventory_product_volume_discount_variant_id" VARCHAR(255) NOT NULL,
        "price_category_id" BIGINT NOT NULL,
        "price_category_name" VARCHAR(255) NOT NULL,
        "price_category_percentage" NUMERIC(10,2) NOT NULL,
        "price_category_set_default" BOOLEAN NOT NULL DEFAULT false,
        "price" NUMERIC(19,2) NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    // Create history tables

    // inventory_product_pricing_information_histories
    await queryRunner.query(`
      CREATE TABLE "inventory_product_pricing_information_histories" (
        "id" VARCHAR(255) PRIMARY KEY,
        "inventory_product_pricing_information" BIGINT NOT NULL,
        "inventory_product_id" BIGINT NOT NULL,
        "usd_price" NUMERIC(19,2) NOT NULL DEFAULT 0,
        "exchange_rate" NUMERIC(19,2) NOT NULL DEFAULT 0,
        "adjustment_percentage" NUMERIC(19,2) NOT NULL DEFAULT 0,
        "price_hb_real" NUMERIC(19,2) NOT NULL DEFAULT 0,
        "hb_adjustment_price" NUMERIC(19,2) NOT NULL DEFAULT 0,
        "is_manual_product_variant_price_edit" BOOLEAN NOT NULL DEFAULT false,
        "is_enable_volume_discount" BOOLEAN NOT NULL DEFAULT false,
        "is_enable_volume_discount_by_product_variant" BOOLEAN NOT NULL DEFAULT false,
        "user_id" BIGINT NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    // inventory_product_customer_category_price_histories
    await queryRunner.query(`
      CREATE TABLE "inventory_product_customer_category_price_histories" (
        "id" VARCHAR(255) PRIMARY KEY,
        "inventory_product_pricing_information_history_id" VARCHAR NOT NULL,
        "inventory_product_id" BIGINT NOT NULL,
        "price_category_id" BIGINT NOT NULL,
        "price_category_name" VARCHAR(255) NOT NULL,
        "price_category_percentage" NUMERIC(10,2) NOT NULL,
        "price_category_set_default" BOOLEAN NOT NULL DEFAULT false,
        "pre_tax_price" NUMERIC(19,2) NOT NULL DEFAULT 0,
        "tax_inclusive_price" NUMERIC(19,2) NOT NULL DEFAULT 0,
        "tax_id" BIGINT NOT NULL,
        "tax_percentage" NUMERIC(19,2) NOT NULL DEFAULT 0,
        "is_custom_tax_inclusive_price" BOOLEAN NOT NULL DEFAULT false,
        "user_id" BIGINT NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    // inventory_product_by_variant_price_histories
    await queryRunner.query(`
      CREATE TABLE "inventory_product_by_variant_price_histories" (
        "id" VARCHAR(255) PRIMARY KEY,
        "inventory_product_pricing_information_history_id" VARCHAR NOT NULL,
        "inventory_product_by_variant_id" VARCHAR(255) NOT NULL,
        "price_category_id" BIGINT NOT NULL,
        "price" NUMERIC(19,2) NOT NULL DEFAULT 0,
        "status" BOOLEAN NOT NULL DEFAULT true,
        "user_id" BIGINT NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    // inventory_product_global_discount_histories
    await queryRunner.query(`
      CREATE TABLE "inventory_product_global_discount_histories" (
        "id" VARCHAR(255) PRIMARY KEY,
        "inventory_product_pricing_information_history_id" VARCHAR NOT NULL,
        "quantity" INTEGER NOT NULL DEFAULT 0,
        "discount_percentage" NUMERIC(19,2) NOT NULL,
        "user_id" BIGINT NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    // inventory_product_global_discount_price_category_histories
    await queryRunner.query(`
      CREATE TABLE "inventory_product_global_discount_price_category_histories" (
        "id" VARCHAR(255) PRIMARY KEY,
        "inventory_product_pricing_information_history_id" VARCHAR NOT NULL,
        "price_category_id" BIGINT NOT NULL,
        "price_category_name" VARCHAR(255) NOT NULL,
        "price_category_percentage" NUMERIC(10,2) NOT NULL,
        "price_category_set_default" BOOLEAN NOT NULL DEFAULT false,
        "price" NUMERIC(19,2) NOT NULL DEFAULT 0,
        "user_id" BIGINT NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    // inventory_product_volume_discount_variant_histories
    await queryRunner.query(`
      CREATE TABLE "inventory_product_volume_discount_variant_histories" (
        "id" VARCHAR(255) PRIMARY KEY,
        "inventory_product_pricing_information_history_id" VARCHAR NOT NULL,
        "inventory_product_by_variant_id" VARCHAR(255) NOT NULL,
        "inventory_product_by_variant_full_product_name" TEXT NOT NULL,
        "inventory_product_by_variant_sku" TEXT NOT NULL,
        "quantity" INTEGER NOT NULL DEFAULT 0,
        "discount_percentage" NUMERIC(19,2) NOT NULL,
        "status" BOOLEAN NOT NULL DEFAULT true,
        "user_id" BIGINT NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    // inventory_product_volume_discount_variant_price_category_histories
    await queryRunner.query(`
      CREATE TABLE "inventory_product_volume_discount_variant_price_category_histories" (
        "id" VARCHAR(255) PRIMARY KEY,
        "inventory_product_pricing_information_history_id" VARCHAR NOT NULL,
        "price_category_id" BIGINT NOT NULL,
        "price_category_name" VARCHAR(255) NOT NULL,
        "price_category_percentage" NUMERIC(10,2) NOT NULL,
        "price_category_set_default" BOOLEAN NOT NULL DEFAULT false,
        "price" NUMERIC(19,2) NOT NULL DEFAULT 0,
        "user_id" BIGINT NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop history tables
    await queryRunner.query(
      `DROP TABLE "inventory_product_volume_discount_variant_price_category_histories"`
    );
    await queryRunner.query(
      `DROP TABLE "inventory_product_volume_discount_variant_histories"`
    );
    await queryRunner.query(
      `DROP TABLE "inventory_product_global_discount_price_category_histories"`
    );
    await queryRunner.query(
      `DROP TABLE "inventory_product_global_discount_histories"`
    );
    await queryRunner.query(
      `DROP TABLE "inventory_product_by_variant_price_histories"`
    );
    await queryRunner.query(
      `DROP TABLE "inventory_product_customer_category_price_histories"`
    );
    await queryRunner.query(
      `DROP TABLE "inventory_product_pricing_information_histories"`
    );

    // Drop module tables
    await queryRunner.query(
      `DROP INDEX "idx_inventory_product_volume_discount_variant_price_categories"`
    );
    await queryRunner.query(
      `DROP TABLE "inventory_product_volume_discount_variant_price_categories"`
    );
    await queryRunner.query(
      `DROP TABLE "inventory_product_volume_discount_variants"`
    );
    await queryRunner.query(
      `DROP TABLE "inventory_product_global_discount_price_categories"`
    );
    await queryRunner.query(`DROP TABLE "inventory_product_global_discounts"`);
    await queryRunner.query(`DROP INDEX "idx_ipbvp_price_category_id"`);
    await queryRunner.query(`DROP TABLE "inventory_product_by_variant_prices"`);
    await queryRunner.query(`DROP INDEX "idx_ipccp_price_category_id"`);
    await queryRunner.query(
      `DROP TABLE "inventory_product_customer_category_prices"`
    );
    await queryRunner.query(
      `DROP INDEX "idx_inventory_product_pricing_informations_inventory_product_id"`
    );
    await queryRunner.query(
      `DROP TABLE "inventory_product_pricing_informations"`
    );
  }
}
