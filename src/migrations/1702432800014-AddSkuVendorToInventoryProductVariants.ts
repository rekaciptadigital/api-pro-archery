import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSkuVendorToInventoryProductVariants1702432800014
  implements MigrationInterface
{
  name = "AddSkuVendorToInventoryProductVariants1702432800014";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "inventory_product_by_variants" ADD "sku_vendor" text`
    );
    await queryRunner.query(
      `ALTER TABLE "inventory_product_by_variant_histories" ADD "sku_vendor" text`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "inventory_product_by_variant_histories" DROP COLUMN "sku_vendor"`
    );
    await queryRunner.query(
      `ALTER TABLE "inventory_product_by_variants" DROP COLUMN "sku_vendor"`
    );
  }
}
