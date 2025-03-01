import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFieldsToInventoryPriceTables1702432900001
  implements MigrationInterface
{
  name = "AddFieldsToInventoryPriceTables1702432900001";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add fields to inventory_product_by_variant_prices table
    await queryRunner.query(`
      ALTER TABLE "inventory_product_by_variant_prices"
      ADD COLUMN "usd_price" NUMERIC(19,2) NOT NULL DEFAULT 0,
      ADD COLUMN "exchange_rate" NUMERIC(19,2) NOT NULL DEFAULT 0,
      ADD COLUMN "adjustment_percentage" NUMERIC(19,2) NOT NULL DEFAULT 0
    `);

    // Add fields to inventory_product_by_variant_price_histories table
    await queryRunner.query(`
      ALTER TABLE "inventory_product_by_variant_price_histories"
      ADD COLUMN "usd_price" NUMERIC(19,2) NOT NULL DEFAULT 0,
      ADD COLUMN "exchange_rate" NUMERIC(19,2) NOT NULL DEFAULT 0,
      ADD COLUMN "adjustment_percentage" NUMERIC(19,2) NOT NULL DEFAULT 0
    `);

    // Add field to inventory_product_customer_category_prices table
    await queryRunner.query(`
      ALTER TABLE "inventory_product_customer_category_prices"
      ADD COLUMN "price_category_custom_percentage" NUMERIC(10,2) NOT NULL DEFAULT 0
    `);

    // Add field to inventory_product_customer_category_price_histories table
    await queryRunner.query(`
      ALTER TABLE "inventory_product_customer_category_price_histories"
      ADD COLUMN "price_category_custom_percentage" NUMERIC(10,2) NOT NULL DEFAULT 0
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove fields from inventory_product_customer_category_price_histories table
    await queryRunner.query(`
      ALTER TABLE "inventory_product_customer_category_price_histories"
      DROP COLUMN "price_category_custom_percentage"
    `);

    // Remove field from inventory_product_customer_category_prices table
    await queryRunner.query(`
      ALTER TABLE "inventory_product_customer_category_prices"
      DROP COLUMN "price_category_custom_percentage"
    `);

    // Remove fields from inventory_product_by_variant_price_histories table
    await queryRunner.query(`
      ALTER TABLE "inventory_product_by_variant_price_histories"
      DROP COLUMN "adjustment_percentage",
      DROP COLUMN "exchange_rate",
      DROP COLUMN "usd_price"
    `);

    // Remove fields from inventory_product_by_variant_prices table
    await queryRunner.query(`
      ALTER TABLE "inventory_product_by_variant_prices"
      DROP COLUMN "adjustment_percentage",
      DROP COLUMN "exchange_rate",
      DROP COLUMN "usd_price"
    `);
  }
}
