import { MigrationInterface, QueryRunner } from "typeorm";

export class AddGlobalDiscountHistories1702433100000
  implements MigrationInterface
{
  name = "AddGlobalDiscountHistories1702433100000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "inventory_product_global_discount_price_category_histories"
      ADD COLUMN "inventory_product_global_discount_history_id" VARCHAR(255) NOT NULL,
      ADD CONSTRAINT "fk_inventory_product_global_discount_price_category_histories"
      FOREIGN KEY ("inventory_product_global_discount_history_id")
      REFERENCES "inventory_product_global_discount_histories"("id")
      ON DELETE SET NULL
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_inventory_product_global_discount_price_category_history_id"
      ON "inventory_product_global_discount_histories"("id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "idx_inventory_product_global_discount_price_category_history_id"`
    );
    await queryRunner.query(`
      ALTER TABLE "inventory_product_global_discount_price_category_histories"
      DROP CONSTRAINT "fk_inventory_product_global_discount_price_category_histories",
      DROP COLUMN "inventory_product_global_discount_history_id"
    `);
  }
}
