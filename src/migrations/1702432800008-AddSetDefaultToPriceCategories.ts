import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSetDefaultToPriceCategories1702432800008
  implements MigrationInterface
{
  name = "AddSetDefaultToPriceCategories1702432800008";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "price_categories"
      ADD COLUMN IF NOT EXISTS "set_default" boolean NOT NULL DEFAULT false
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "price_categories" DROP COLUMN "set_default"`
    );
  }
}
