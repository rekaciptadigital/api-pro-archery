import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStatusToRolesAndFeatures1701234567892 implements MigrationInterface {
  name = "AddStatusToRolesAndFeatures1701234567892";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add status column to roles table
    await queryRunner.query(`
      ALTER TABLE "roles" 
      ADD COLUMN IF NOT EXISTS "status" boolean NOT NULL DEFAULT true
    `);

    // Add status column to features table
    await queryRunner.query(`
      ALTER TABLE "features" 
      ADD COLUMN IF NOT EXISTS "status" boolean NOT NULL DEFAULT true
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "features" DROP COLUMN "status"`);
    await queryRunner.query(`ALTER TABLE "roles" DROP COLUMN "status"`);
  }
}