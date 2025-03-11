import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFieldsToInventoryProductByVariantPriceHistories1702432900004
  implements MigrationInterface
{
  name = "AddFieldsToInventoryProductByVariantPriceHistories1702432900004";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add missing fields to inventory_product_by_variant_price_histories table
    await queryRunner.query(`
      ALTER TABLE "inventory_product_by_variant_price_histories"
      ADD COLUMN IF NOT EXISTS "price_category_name" VARCHAR(255),
      ADD COLUMN IF NOT EXISTS "price_category_percentage" NUMERIC(10,2) NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "price_category_set_default" BOOLEAN NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS "price_category_type" VARCHAR(255) NOT NULL DEFAULT 'regular'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove fields from inventory_product_by_variant_price_histories table
    await queryRunner.query(`
      ALTER TABLE "inventory_product_by_variant_price_histories"
      DROP COLUMN IF EXISTS "price_category_type",
      DROP COLUMN IF EXISTS "price_category_set_default",
      DROP COLUMN IF EXISTS "price_category_percentage",
      DROP COLUMN IF EXISTS "price_category_name"
    `);
  }
}
