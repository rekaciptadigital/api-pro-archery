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
        "deleted_at" TIMESTAMP,
        CONSTRAINT "fk_inventory_product_pricing_informations_inventory_product" FOREIGN KEY ("inventory_product_id") REFERENCES "inventory_products"("id") ON DELETE CASCADE
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
        "price_category_percentage" NUMERIC(10,2) NOT NULL DEFAULT 0,
        "price_category_set_default" BOOLEAN NOT NULL DEFAULT false,
        "pre_tax_price" NUMERIC(19,2) NOT NULL DEFAULT 0,
        "tax_inclusive_price" NUMERIC(19,2) NOT NULL DEFAULT 0,
        "tax_id" BIGINT NOT NULL,
        "tax_percentage" NUMERIC(19,2) NOT NULL DEFAULT 0,
        "is_custom_tax_inclusive_price" BOOLEAN NOT NULL DEFAULT false,
        "price_category_custom_percentage" NUMERIC(10,2) NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "fk_inventory_product_customer_category_prices_pricing" FOREIGN KEY ("inventory_product_pricing_information_id") REFERENCES "inventory_product_pricing_informations"("id") ON DELETE CASCADE
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
        "usd_price" NUMERIC(19,2) NOT NULL DEFAULT 0,
        "exchange_rate" NUMERIC(19,2) NOT NULL DEFAULT 0,
        "adjustment_percentage" NUMERIC(19,2) NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "fk_ipbvp_inventory_product_by_variant" FOREIGN KEY ("inventory_product_by_variant_id") REFERENCES "inventory_product_by_variants"("id"),
        CONSTRAINT "fk_ipbvp_price_category" FOREIGN KEY ("price_category_id") REFERENCES "price_categories"("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_ipbvp_price_category_id" ON "inventory_product_by_variant_prices" ("price_category_id")
    `);

    // Create inventory_product_global_discounts table (updated)
    await queryRunner.query(`
      CREATE TABLE "inventory_product_global_discounts" (
        "id" VARCHAR(255) PRIMARY KEY,
        "inventory_product_pricing_information_id" BIGINT NOT NULL,
        "quantity" INTEGER NOT NULL DEFAULT 0,
        "discount_percentage" NUMERIC(19,2) NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "fk_inventory_product_global_discounts_pricing" FOREIGN KEY ("inventory_product_pricing_information_id") REFERENCES "inventory_product_pricing_informations"("id") ON DELETE CASCADE
      )
    `);

    // Create inventory_product_global_discount_price_categories table (updated)
    await queryRunner.query(`
      CREATE TABLE "inventory_product_global_discount_price_categories" (
        "id" VARCHAR(255) PRIMARY KEY,
        "inventory_product_global_discount_id" VARCHAR(255) NOT NULL,
        "price_category_type" VARCHAR(255) NOT NULL,
        "price_category_id" BIGINT NOT NULL,
        "price_category_name" VARCHAR(255) NOT NULL,
        "price_category_percentage" NUMERIC(10,2) NOT NULL DEFAULT 0,
        "price_category_set_default" BOOLEAN NOT NULL DEFAULT false,
        "price" NUMERIC(19,2) NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "fk_ipgdpc_global_discount" FOREIGN KEY ("inventory_product_global_discount_id") REFERENCES "inventory_product_global_discounts"("id") ON DELETE CASCADE
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
        "status" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "fk_inventory_product_volume_discount_variants_pricing" FOREIGN KEY ("inventory_product_pricing_information_id") REFERENCES "inventory_product_pricing_informations"("id") ON DELETE CASCADE
      )
    `);

    // Create inventory_product_volume_discount_variant_qty table
    await queryRunner.query(`
      CREATE TABLE "inventory_product_volume_discount_variant_qty" (
        "id" VARCHAR(255) PRIMARY KEY,
        "inventory_product_vol_disc_variant_id" VARCHAR(255) NOT NULL,
        "quantity" INTEGER NOT NULL DEFAULT 0,
        "discount_percentage" NUMERIC(19,2) NOT NULL DEFAULT 0,
        "status" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "fk_ipvdvq_volume_discount_variant" FOREIGN KEY ("inventory_product_vol_disc_variant_id") REFERENCES "inventory_product_volume_discount_variants"("id") ON DELETE CASCADE
      )
    `);

    // Create inventory_product_volume_discount_variant_price_categories table
    await queryRunner.query(`
      CREATE TABLE "inventory_product_volume_discount_variant_price_categories" (
        "id" VARCHAR(255) PRIMARY KEY,
        "inventory_product_vol_disc_variant_qty_id" VARCHAR(255) NOT NULL,
        "price_category_type" VARCHAR(255) NOT NULL,
        "price_category_id" BIGINT NOT NULL,
        "price_category_name" VARCHAR(255) NOT NULL,
        "price_category_percentage" NUMERIC(10,2) NOT NULL DEFAULT 0,
        "price_category_set_default" BOOLEAN NOT NULL DEFAULT false,
        "price" NUMERIC(19,2) NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "fk_ipvdvpc_volume_discount_variant_qty" FOREIGN KEY ("inventory_product_vol_disc_variant_qty_id") REFERENCES "inventory_product_volume_discount_variant_qty"("id") ON DELETE CASCADE
      )
    `);

    // Create inventory_product_marketplace_category_prices table
    await queryRunner.query(`
      CREATE TABLE "inventory_product_marketplace_category_prices" (
        "id" BIGSERIAL PRIMARY KEY,
        "inventory_product_pricing_information_id" BIGINT NOT NULL,
        "price_category_id" BIGINT NOT NULL,
        "price_category_name" VARCHAR(255) NOT NULL,
        "price_category_percentage" NUMERIC(10,2) NOT NULL DEFAULT 0,
        "price_category_set_default" BOOLEAN NOT NULL DEFAULT false,
        "price" NUMERIC(19,2) NOT NULL DEFAULT 0,
        "price_category_custom_percentage" NUMERIC(10,2) NOT NULL DEFAULT 0,
        "is_custom_price_category" BOOLEAN NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "fk_inventory_product_marketplace_category_prices_pricing" FOREIGN KEY ("inventory_product_pricing_information_id") REFERENCES "inventory_product_pricing_informations"("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop module tables
    await queryRunner.query(
      `DROP TABLE "inventory_product_marketplace_category_prices"`
    );
    await queryRunner.query(
      `DROP TABLE "inventory_product_volume_discount_variant_price_categories"`
    );
    await queryRunner.query(
      `DROP TABLE "inventory_product_volume_discount_variant_qty"`
    );
    await queryRunner.query(
      `DROP TABLE "inventory_product_volume_discount_variants"`
    );
    await queryRunner.query(
      `DROP TABLE "inventory_product_global_discount_price_categories"`
    );
    await queryRunner.query(`DROP TABLE "inventory_product_global_discounts"`);

    // Drop remaining tables
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
