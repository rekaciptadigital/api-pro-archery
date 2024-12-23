import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateVariantDisplayOrder1702432800003 implements MigrationInterface {
  name = 'UpdateVariantDisplayOrder1702432800003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Make display_order nullable and ensure it's integer type
    await queryRunner.query(`
      ALTER TABLE "variants" 
      ALTER COLUMN "display_order" TYPE integer,
      ALTER COLUMN "display_order" DROP NOT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert changes - make display_order required again
    await queryRunner.query(`
      UPDATE "variants" SET "display_order" = 0 WHERE "display_order" IS NULL;
      ALTER TABLE "variants" 
      ALTER COLUMN "display_order" SET NOT NULL;
    `);
  }
}