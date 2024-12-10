import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateAuthTablesStructure1701234567894 implements MigrationInterface {
  name = "UpdateAuthTablesStructure1701234567894";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add role_id to api_endpoints table
    await queryRunner.query(`
      ALTER TABLE "api_endpoints"
      ADD COLUMN "role_id" bigint,
      ADD CONSTRAINT "FK_api_endpoints_role_id"
      FOREIGN KEY ("role_id")
      REFERENCES "roles"("id")
      ON DELETE SET NULL;
    `);

    // Create index for role_id
    await queryRunner.query(`
      CREATE INDEX "idx_api_endpoints_role_id" 
      ON "api_endpoints"("role_id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_api_endpoints_role_id"`);
    await queryRunner.query(`
      ALTER TABLE "api_endpoints" 
      DROP CONSTRAINT IF EXISTS "FK_api_endpoints_role_id",
      DROP COLUMN "role_id";
    `);
  }
}