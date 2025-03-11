import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPriceCategoryTypeFields1702432900003
  implements MigrationInterface
{
  name = "AddPriceCategoryTypeFields1702432900003";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add price_category_type field to inventory_product_marketplace_category_prices table
    await queryRunner.query(`
      ALTER TABLE "inventory_product_marketplace_category_prices"
      ADD COLUMN "price_category_type" VARCHAR(50) NOT NULL DEFAULT 'regular'
    `);

    // Add price_category_type field to inventory_product_marketplace_category_price_histories table
    await queryRunner.query(`
      ALTER TABLE "inventory_product_marketplace_category_price_histories"
      ADD COLUMN "price_category_type" VARCHAR(50) NOT NULL DEFAULT 'regular'
    `);

    // Add price_category_type field to inventory_product_volume_discount_variant_price_categories table
    await queryRunner.query(`
      ALTER TABLE "inventory_product_volume_discount_variant_price_categories"
      ADD COLUMN "price_category_type" VARCHAR(50) NOT NULL DEFAULT 'regular'
    `);

    // Add price_category_type field to inventory_product_volume_discount_variant_price_cat_his table
    await queryRunner.query(`
      ALTER TABLE "inventory_product_volume_discount_variant_price_cat_his"
      ADD COLUMN "price_category_type" VARCHAR(50) NOT NULL DEFAULT 'regular'
    `);

    // Add price_category_type field to inventory_product_global_discount_price_categories table
    await queryRunner.query(`
      ALTER TABLE "inventory_product_global_discount_price_categories"
      ADD COLUMN "price_category_type" VARCHAR(50) NOT NULL DEFAULT 'regular'
    `);

    // Add price_category_type field to inventory_product_global_discount_price_category_histories table
    await queryRunner.query(`
      ALTER TABLE "inventory_product_global_discount_price_category_histories"
      ADD COLUMN "price_category_type" VARCHAR(50) NOT NULL DEFAULT 'regular'
    `);

    // Add price_category_type field to inventory_product_customer_category_prices table
    await queryRunner.query(`
      ALTER TABLE "inventory_product_customer_category_prices"
      ADD COLUMN "price_category_type" VARCHAR(50) NOT NULL DEFAULT 'regular'
    `);

    // Add price_category_type field to inventory_product_customer_category_price_histories table
    await queryRunner.query(`
      ALTER TABLE "inventory_product_customer_category_price_histories"
      ADD COLUMN "price_category_type" VARCHAR(50) NOT NULL DEFAULT 'regular'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove price_category_type field from inventory_product_customer_category_price_histories table
    await queryRunner.query(`
      ALTER TABLE "inventory_product_customer_category_price_histories"
      DROP COLUMN "price_category_type"
    `);

    // Remove price_category_type field from inventory_product_customer_category_prices table
    await queryRunner.query(`
      ALTER TABLE "inventory_product_customer_category_prices"
      DROP COLUMN "price_category_type"
    `);

    // Remove price_category_type field from inventory_product_global_discount_price_category_histories table
    await queryRunner.query(`
      ALTER TABLE "inventory_product_global_discount_price_category_histories"
      DROP COLUMN "price_category_type"
    `);

    // Remove price_category_type field from inventory_product_global_discount_price_categories table
    await queryRunner.query(`
      ALTER TABLE "inventory_product_global_discount_price_categories"
      DROP COLUMN "price_category_type"
    `);

    // Remove price_category_type field from inventory_product_volume_discount_variant_price_cat_his table
    await queryRunner.query(`
      ALTER TABLE "inventory_product_volume_discount_variant_price_cat_his"
      DROP COLUMN "price_category_type"
    `);

    // Remove price_category_type field from inventory_product_volume_discount_variant_price_categories table
    await queryRunner.query(`
      ALTER TABLE "inventory_product_volume_discount_variant_price_categories"
      DROP COLUMN "price_category_type"
    `);

    // Remove price_category_type field from inventory_product_marketplace_category_price_histories table
    await queryRunner.query(`
      ALTER TABLE "inventory_product_marketplace_category_price_histories"
      DROP COLUMN "price_category_type"
    `);

    // Remove price_category_type field from inventory_product_marketplace_category_prices table
    await queryRunner.query(`
      ALTER TABLE "inventory_product_marketplace_category_prices"
      DROP COLUMN "price_category_type"
    `);
  }
}
