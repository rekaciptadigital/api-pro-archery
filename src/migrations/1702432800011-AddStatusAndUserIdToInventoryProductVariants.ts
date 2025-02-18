import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStatusAndUserIdToInventoryProductVariants1702432800011
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Alter sku_product_unique_code to match entity type (text)
    await queryRunner.query(`
      ALTER TABLE "inventory_product_by_variant_histories"
      ALTER COLUMN "sku_product_unique_code" TYPE text
      USING sku_product_unique_code::text
    `);

    // Create index for user_id if not exists
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_inventory_product_histories_user_id" 
      ON "inventory_product_by_variant_histories"("user_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop index if exists
    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_inventory_product_histories_user_id"
    `);

    // Revert sku_product_unique_code back to original type
    await queryRunner.query(`
      ALTER TABLE "inventory_product_by_variant_histories"
      ALTER COLUMN "sku_product_unique_code" TYPE integer
      USING CASE 
        WHEN sku_product_unique_code ~ '^[0-9]+$' 
        THEN sku_product_unique_code::integer 
        ELSE 0 
      END
    `);
  }
}
