import { MigrationInterface, QueryRunner } from "typeorm";

export class AddParentIdToInventoryLocations1702432800015
  implements MigrationInterface
{
  name = "AddParentIdToInventoryLocations1702432800015";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "inventory_locations"
      ADD COLUMN "parent_id" BIGINT,
      ADD CONSTRAINT "fk_inventory_locations_parent"
      FOREIGN KEY ("parent_id")
      REFERENCES "inventory_locations"("id")
      ON DELETE SET NULL
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_inventory_locations_parent_id"
      ON "inventory_locations"("parent_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_inventory_locations_parent_id"`);
    await queryRunner.query(`
      ALTER TABLE "inventory_locations"
      DROP CONSTRAINT "fk_inventory_locations_parent",
      DROP COLUMN "parent_id"
    `);
  }
}
