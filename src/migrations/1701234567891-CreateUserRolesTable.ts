import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserRolesTable1701234567891 implements MigrationInterface {
  name = "CreateUserRolesTable1701234567891";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "user_roles" (
        "id" BIGSERIAL PRIMARY KEY,
        "user_id" bigint NOT NULL,
        "role_id" bigint NOT NULL,
        "status" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        FOREIGN KEY ("user_id") REFERENCES "users" ("id"),
        FOREIGN KEY ("role_id") REFERENCES "roles" ("id")
      )
    `);

    // Add indexes for better query performance
    await queryRunner.query(`
      CREATE INDEX "idx_user_roles_user_id" ON "user_roles" ("user_id");
      CREATE INDEX "idx_user_roles_role_id" ON "user_roles" ("role_id");
      CREATE UNIQUE INDEX "idx_user_roles_user_role" ON "user_roles" ("user_id", "role_id") 
      WHERE deleted_at IS NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_user_roles_user_role"`);
    await queryRunner.query(`DROP INDEX "idx_user_roles_role_id"`);
    await queryRunner.query(`DROP INDEX "idx_user_roles_user_id"`);
    await queryRunner.query(`DROP TABLE "user_roles"`);
  }
}