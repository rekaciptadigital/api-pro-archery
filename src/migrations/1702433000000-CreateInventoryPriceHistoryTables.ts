import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateInventoryPriceHistoryTables1702433000000
  implements MigrationInterface
{
  name = "CreateInventoryPriceHistoryTables1702433000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create inventory_product_pricing_information_histories table
    await queryRunner.query(`
      CREATE TABLE "inventory_product_pricing_information_histories" (
        "id" VARCHAR(255) PRIMARY KEY,
        "inventory_product_pricing_information" BIGINT NOT NULL,
        "inventory_product_id" BIGINT NOT NULL,
        "old_usd_price" NUMERIC(19,2) NOT NULL DEFAULT 0,
        "new_usd_price" NUMERIC(19,2) NOT NULL DEFAULT 0,
        "old_exchange_rate" NUMERIC(19,2) NOT NULL DEFAULT 0,
        "new_exchange_rate" NUMERIC(19,2) NOT NULL DEFAULT 0,
        "old_adjustment_percentage" NUMERIC(19,2) NOT NULL DEFAULT 0,
        "new_adjustment_percentage" NUMERIC(19,2) NOT NULL DEFAULT 0,
        "old_price_hb_real" NUMERIC(19,2) NOT NULL DEFAULT 0,
        "new_price_hb_real" NUMERIC(19,2) NOT NULL DEFAULT 0,
        "old_hb_adjustment_price" NUMERIC(19,2) NOT NULL DEFAULT 0,
        "new_hb_adjustment_price" NUMERIC(19,2) NOT NULL DEFAULT 0,
        "old_is_manual_product_variant_price_edit" BOOLEAN NOT NULL DEFAULT false,
        "new_is_manual_product_variant_price_edit" BOOLEAN NOT NULL DEFAULT false,
        "old_is_enable_volume_discount" BOOLEAN NOT NULL DEFAULT false,
        "new_is_enable_volume_discount" BOOLEAN NOT NULL DEFAULT false,
        "old_is_enable_volume_discount_by_product_variant" BOOLEAN NOT NULL DEFAULT false,
        "new_is_enable_volume_discount_by_product_variant" BOOLEAN NOT NULL DEFAULT false,
        "user_id" BIGINT NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "fk_ipih_inventory_product" FOREIGN KEY ("inventory_product_id") REFERENCES "inventory_products"("id"),
        CONSTRAINT "fk_ipih_user" FOREIGN KEY ("user_id") REFERENCES "users"("id")
      )
    `);

    // Create inventory_product_customer_category_price_histories table
    await queryRunner.query(`
      CREATE TABLE "inventory_product_customer_category_price_histories" (
        "id" VARCHAR(255) PRIMARY KEY,
        "inventory_product_pricing_information_history_id" VARCHAR(255) NOT NULL,
        "price_category_id" BIGINT NOT NULL,
        "old_price_category_name" VARCHAR(255) NOT NULL,
        "new_price_category_name" VARCHAR(255) NOT NULL,
        "old_price_category_percentage" NUMERIC(10,2) NOT NULL,
        "new_price_category_percentage" NUMERIC(10,2) NOT NULL,
        "old_price_category_set_default" BOOLEAN NOT NULL DEFAULT false,
        "new_price_category_set_default" BOOLEAN NOT NULL DEFAULT false,
        "old_pre_tax_price" NUMERIC(19,2) NOT NULL DEFAULT 0,
        "new_pre_tax_price" NUMERIC(19,2) NOT NULL DEFAULT 0,
        "old_tax_inclusive_price" NUMERIC(19,2) NOT NULL DEFAULT 0,
        "new_tax_inclusive_price" NUMERIC(19,2) NOT NULL DEFAULT 0,
        "tax_id" BIGINT NOT NULL,
        "old_tax_percentage" NUMERIC(19,2) NOT NULL DEFAULT 0,
        "new_tax_percentage" NUMERIC(19,2) NOT NULL DEFAULT 0,
        "old_is_custom_tax_inclusive_price" BOOLEAN NOT NULL DEFAULT false,
        "new_is_custom_tax_inclusive_price" BOOLEAN NOT NULL DEFAULT false,
        "old_price_category_custom_percentage" NUMERIC(10,2) NOT NULL DEFAULT 0,
        "new_price_category_custom_percentage" NUMERIC(10,2) NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "fk_ipccp_history" FOREIGN KEY ("inventory_product_pricing_information_history_id") REFERENCES "inventory_product_pricing_information_histories"("id") ON DELETE CASCADE
      )
    `);

    // Create inventory_product_by_variant_price_histories table
    await queryRunner.query(`
      CREATE TABLE "inventory_product_by_variant_price_histories" (
        "id" VARCHAR(255) PRIMARY KEY,
        "inventory_product_pricing_information_history_id" VARCHAR(255) NOT NULL,
        "inventory_product_by_variant_id" VARCHAR(255) NOT NULL,
        "price_category_id" BIGINT NOT NULL,
        "old_price_category_type" VARCHAR(255) NOT NULL,
        "new_price_category_type" VARCHAR(255) NOT NULL,
        "old_price_category_name" VARCHAR(255) NOT NULL,
        "new_price_category_name" VARCHAR(255) NOT NULL,
        "old_price_category_percentage" NUMERIC(10,2) NOT NULL,
        "new_price_category_percentage" NUMERIC(10,2) NOT NULL,
        "old_price_category_set_default" BOOLEAN NOT NULL DEFAULT false,
        "new_price_category_set_default" BOOLEAN NOT NULL DEFAULT false,
        "old_price" NUMERIC(19,2) NOT NULL DEFAULT 0,
        "new_price" NUMERIC(19,2) NOT NULL DEFAULT 0,
        "old_status" BOOLEAN NOT NULL DEFAULT true,
        "new_status" BOOLEAN NOT NULL DEFAULT true,
        "old_usd_price" NUMERIC(19,2) NOT NULL DEFAULT 0,
        "new_usd_price" NUMERIC(19,2) NOT NULL DEFAULT 0,
        "old_exchange_rate" NUMERIC(19,2) NOT NULL DEFAULT 0,
        "new_exchange_rate" NUMERIC(19,2) NOT NULL DEFAULT 0,
        "old_adjustment_percentage" NUMERIC(19,2) NOT NULL DEFAULT 0,
        "new_adjustment_percentage" NUMERIC(19,2) NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "fk_ipbvph_history" FOREIGN KEY ("inventory_product_pricing_information_history_id") REFERENCES "inventory_product_pricing_information_histories"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_ipbvph_variant" FOREIGN KEY ("inventory_product_by_variant_id") REFERENCES "inventory_product_by_variants"("id")
      )
    `);

    // Create inventory_product_global_discount_histories table
    await queryRunner.query(`
      CREATE TABLE "inventory_product_global_discount_histories" (
        "id" VARCHAR(255) PRIMARY KEY,
        "inventory_product_pricing_information_history_id" VARCHAR(255) NOT NULL,
        "old_quantity" INTEGER NOT NULL DEFAULT 0,
        "new_quantity" INTEGER NOT NULL DEFAULT 0,
        "old_discount_percentage" NUMERIC(19,2) NOT NULL DEFAULT 0,
        "new_discount_percentage" NUMERIC(19,2) NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "fk_ipgdh_history" FOREIGN KEY ("inventory_product_pricing_information_history_id") REFERENCES "inventory_product_pricing_information_histories"("id") ON DELETE CASCADE
      )
    `);

    // Create inventory_product_global_discount_price_category_histories table
    await queryRunner.query(`
      CREATE TABLE "inventory_product_global_discount_price_category_histories" (
        "id" VARCHAR(255) PRIMARY KEY,
        "inventory_product_pricing_information_history_id" VARCHAR(255) NOT NULL,
        "price_category_id" BIGINT NOT NULL,
        "old_price_category_type" VARCHAR(255) NOT NULL,
        "new_price_category_type" VARCHAR(255) NOT NULL,
        "old_price_category_name" VARCHAR(255) NOT NULL,
        "new_price_category_name" VARCHAR(255) NOT NULL,
        "old_price_category_percentage" NUMERIC(10,2) NOT NULL,
        "new_price_category_percentage" NUMERIC(10,2) NOT NULL,
        "old_price_category_set_default" BOOLEAN NOT NULL DEFAULT false,
        "new_price_category_set_default" BOOLEAN NOT NULL DEFAULT false,
        "old_price" NUMERIC(19,2) NOT NULL DEFAULT 0,
        "new_price" NUMERIC(19,2) NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "fk_ipgdpch_history" FOREIGN KEY ("inventory_product_pricing_information_history_id") REFERENCES "inventory_product_pricing_information_histories"("id") ON DELETE CASCADE
      )
    `);

    // Create inventory_product_marketplace_category_price_histories table
    await queryRunner.query(`
      CREATE TABLE "inventory_product_marketplace_category_price_histories" (
        "id" VARCHAR(255) PRIMARY KEY,
        "inventory_product_pricing_information_history_id" VARCHAR(255) NOT NULL,
        "price_category_id" BIGINT NOT NULL,
        "old_price_category_name" VARCHAR(255) NOT NULL,
        "new_price_category_name" VARCHAR(255) NOT NULL,
        "old_price_category_percentage" NUMERIC(10,2) NOT NULL,
        "new_price_category_percentage" NUMERIC(10,2) NOT NULL,
        "old_price_category_set_default" BOOLEAN NOT NULL DEFAULT false,
        "new_price_category_set_default" BOOLEAN NOT NULL DEFAULT false,
        "old_price" NUMERIC(19,2) NOT NULL DEFAULT 0,
        "new_price" NUMERIC(19,2) NOT NULL DEFAULT 0,
        "old_price_category_custom_percentage" NUMERIC(10,2) NOT NULL DEFAULT 0,
        "new_price_category_custom_percentage" NUMERIC(10,2) NOT NULL DEFAULT 0,
        "old_is_custom_price_category" BOOLEAN NOT NULL DEFAULT false,
        "new_is_custom_price_category" BOOLEAN NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "fk_ipmcph_history" FOREIGN KEY ("inventory_product_pricing_information_history_id") REFERENCES "inventory_product_pricing_information_histories"("id") ON DELETE CASCADE
      )
    `);

    // Create inventory_product_volume_discount_variant_histories table
    await queryRunner.query(`
      CREATE TABLE "inventory_product_volume_discount_variant_histories" (
        "id" VARCHAR(255) PRIMARY KEY,
        "inventory_product_pricing_information_history_id" VARCHAR(255) NOT NULL,
        "inventory_product_by_variant_id" VARCHAR(255) NOT NULL,
        "old_inventory_product_by_variant_full_product_name" TEXT NOT NULL,
        "new_inventory_product_by_variant_full_product_name" TEXT NOT NULL,
        "old_inventory_product_by_variant_sku" TEXT NOT NULL,
        "new_inventory_product_by_variant_sku" TEXT NOT NULL,
        "old_status" BOOLEAN NOT NULL DEFAULT true,
        "new_status" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "fk_ipvdvh_history" FOREIGN KEY ("inventory_product_pricing_information_history_id") REFERENCES "inventory_product_pricing_information_histories"("id") ON DELETE CASCADE
      )
    `);

    // Create inventory_product_volume_discount_variant_qty_his table
    await queryRunner.query(`
      CREATE TABLE "inventory_product_volume_discount_variant_qty_his" (
        "id" VARCHAR(255) PRIMARY KEY,
        "inventory_product_vol_disc_variant_his_id" VARCHAR(255) NOT NULL,
        "old_quantity" INTEGER NOT NULL DEFAULT 0,
        "new_quantity" INTEGER NOT NULL DEFAULT 0,
        "old_discount_percentage" NUMERIC(19,2) NOT NULL,
        "new_discount_percentage" NUMERIC(19,2) NOT NULL,
        "old_status" BOOLEAN NOT NULL DEFAULT true,
        "new_status" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "fk_ipvdvqh_variant_history" FOREIGN KEY ("inventory_product_vol_disc_variant_his_id") REFERENCES "inventory_product_volume_discount_variant_histories"("id") ON DELETE CASCADE
      )
    `);

    // Create inventory_product_volume_discount_variant_price_cat_his table
    await queryRunner.query(`
      CREATE TABLE "inventory_product_volume_discount_variant_price_cat_his" (
        "id" VARCHAR(255) PRIMARY KEY,
        "inventory_product_vol_disc_variant_qty_his_id" VARCHAR(255) NOT NULL,
        "price_category_id" BIGINT NOT NULL,
        "old_price_category_type" VARCHAR(255) NOT NULL,
        "new_price_category_type" VARCHAR(255) NOT NULL,
        "old_price_category_name" VARCHAR(255) NOT NULL,
        "new_price_category_name" VARCHAR(255) NOT NULL,
        "old_price_category_percentage" NUMERIC(10,2) NOT NULL,
        "new_price_category_percentage" NUMERIC(10,2) NOT NULL,
        "old_price_category_set_default" BOOLEAN NOT NULL DEFAULT false,
        "new_price_category_set_default" BOOLEAN NOT NULL DEFAULT false,
        "old_price" NUMERIC(19,2) NOT NULL DEFAULT 0,
        "new_price" NUMERIC(19,2) NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "fk_ipvdvpch_volume_discount_variant_qty_history" FOREIGN KEY ("inventory_product_vol_disc_variant_qty_his_id") REFERENCES "inventory_product_volume_discount_variant_qty_his"("id") ON DELETE CASCADE
      )
    `);

    // Create indexes
    await queryRunner.query(`
      CREATE INDEX "idx_ipih_inventory_product_id" ON "inventory_product_pricing_information_histories" ("inventory_product_id");
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_ipccp_history_id" ON "inventory_product_customer_category_price_histories" ("inventory_product_pricing_information_history_id");
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_ipbvph_history_id" ON "inventory_product_by_variant_price_histories" ("inventory_product_pricing_information_history_id");
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_ipgdh_history_id" ON "inventory_product_global_discount_histories" ("inventory_product_pricing_information_history_id");
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_ipgdpch_history_id" ON "inventory_product_global_discount_price_category_histories" ("inventory_product_pricing_information_history_id");
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_ipmcph_history_id" ON "inventory_product_marketplace_category_price_histories" ("inventory_product_pricing_information_history_id");
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_ipvdvh_history_id" ON "inventory_product_volume_discount_variant_histories" ("inventory_product_pricing_information_history_id");
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_ipvdvqh_variant_history_id" ON "inventory_product_volume_discount_variant_qty_his" ("inventory_product_vol_disc_variant_his_id");
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_ipvdvpch_qty_history_id" ON "inventory_product_volume_discount_variant_price_cat_his" ("inventory_product_vol_disc_variant_qty_his_id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes first
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_ipvdvpch_qty_history_id"`
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_ipvdvqh_variant_history_id"`
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_ipvdvh_history_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_ipmcph_history_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_ipgdpch_history_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_ipgdh_history_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_ipbvph_history_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_ipccp_history_id"`);
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_ipih_inventory_product_id"`
    );

    // Drop tables in reverse order of creation (to respect foreign key constraints)
    await queryRunner.query(
      `DROP TABLE IF EXISTS "inventory_product_volume_discount_variant_price_cat_his"`
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS "inventory_product_volume_discount_variant_qty_his"`
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS "inventory_product_volume_discount_variant_histories"`
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS "inventory_product_marketplace_category_price_histories"`
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS "inventory_product_global_discount_price_category_histories"`
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS "inventory_product_global_discount_histories"`
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS "inventory_product_by_variant_price_histories"`
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS "inventory_product_customer_category_price_histories"`
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS "inventory_product_pricing_information_histories"`
    );
  }
}
