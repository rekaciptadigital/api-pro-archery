import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsDeleteInQuantityHistoryPriceDiscountVariantAndGlobal1702433110000
  implements MigrationInterface
{
  name =
    "AddIsDeleteInQuantityHistoryPriceDiscountVariantAndGlobal1702433110000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "inventory_product_global_discount_histories"
      ADD COLUMN "is_deleted" BOOLEAN NOT NULL DEFAULT false
    `);

    await queryRunner.query(`
      ALTER TABLE "inventory_product_global_discount_price_category_histories"
      ADD COLUMN "is_deleted" BOOLEAN NOT NULL DEFAULT false
    `);

    await queryRunner.query(`
      ALTER TABLE "inventory_product_volume_discount_variant_qty_his"
      ADD COLUMN "is_deleted" BOOLEAN NOT NULL DEFAULT false
    `);

    await queryRunner.query(`
      ALTER TABLE "inventory_product_volume_discount_variant_price_cat_his"
      ADD COLUMN "is_deleted" BOOLEAN NOT NULL DEFAULT false
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "inventory_product_global_discount_histories"
      DROP COLUMN "is_deleted"
    `);

    await queryRunner.query(`
      ALTER TABLE "inventory_product_global_discount_price_category_histories"
      DROP COLUMN "is_deleted"
    `);

    await queryRunner.query(`
      ALTER TABLE "inventory_product_volume_discount_variant_qty_his"
      DROP COLUMN "is_deleted"
    `);

    await queryRunner.query(`
      ALTER TABLE "inventory_product_volume_discount_variant_price_cat_hisz"
      DROP COLUMN "is_deleted"
    `);
  }
}
