import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAuthTables1701234567893 implements MigrationInterface {
  name = "CreateAuthTables1701234567893";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create auth_tokens table
    await queryRunner.query(`
      CREATE TABLE "auth_tokens" (
        "id" BIGSERIAL PRIMARY KEY,
        "user_id" bigint NOT NULL,
        "refresh_token" varchar(255) NOT NULL,
        "expires_at" TIMESTAMP NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        FOREIGN KEY ("user_id") REFERENCES "users" ("id")
      )
    `);

    // Create user_sessions table
    await queryRunner.query(`
      CREATE TABLE "user_sessions" (
        "id" BIGSERIAL PRIMARY KEY,
        "user_id" bigint NOT NULL,
        "token" varchar(255) NOT NULL,
        "ip_address" varchar(45),
        "user_agent" text,
        "last_activity" TIMESTAMP NOT NULL DEFAULT now(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        FOREIGN KEY ("user_id") REFERENCES "users" ("id")
      )
    `);

    // Create api_endpoints table
    await queryRunner.query(`
      CREATE TABLE "api_endpoints" (
        "id" BIGSERIAL PRIMARY KEY,
        "path" varchar(255) NOT NULL,
        "method" varchar(10) NOT NULL,
        "description" text,
        "is_public" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP
      )
    `);

    // Create menu_permissions table
    await queryRunner.query(`
      CREATE TABLE "menu_permissions" (
        "id" BIGSERIAL PRIMARY KEY,
        "role_id" bigint NOT NULL,
        "menu_key" varchar(255) NOT NULL,
        "can_view" boolean NOT NULL DEFAULT false,
        "can_create" boolean NOT NULL DEFAULT false,
        "can_edit" boolean NOT NULL DEFAULT false,
        "can_delete" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        FOREIGN KEY ("role_id") REFERENCES "roles" ("id")
      )
    `);

    // Add indexes
    await queryRunner.query(`
      CREATE INDEX "idx_auth_tokens_user_id" ON "auth_tokens" ("user_id");
      CREATE INDEX "idx_auth_tokens_refresh_token" ON "auth_tokens" ("refresh_token");
      CREATE INDEX "idx_user_sessions_user_id" ON "user_sessions" ("user_id");
      CREATE INDEX "idx_user_sessions_token" ON "user_sessions" ("token");
      CREATE INDEX "idx_api_endpoints_path_method" ON "api_endpoints" ("path", "method");
      CREATE INDEX "idx_menu_permissions_role_id" ON "menu_permissions" ("role_id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "menu_permissions"`);
    await queryRunner.query(`DROP TABLE "api_endpoints"`);
    await queryRunner.query(`DROP TABLE "user_sessions"`);
    await queryRunner.query(`DROP TABLE "auth_tokens"`);
  }
}