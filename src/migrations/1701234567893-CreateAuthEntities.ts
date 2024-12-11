import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAuthEntities1701234567893 implements MigrationInterface {
  name = "CreateAuthEntities1701234567893";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create auth_tokens table
    await queryRunner.query(`
      CREATE TABLE "auth_tokens" (
        "id" BIGSERIAL PRIMARY KEY,
        "user_id" bigint NOT NULL,
        "refresh_token" varchar NOT NULL,
        "expires_at" TIMESTAMP NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "fk_auth_tokens_user" FOREIGN KEY ("user_id") 
          REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);

    // Create user_sessions table
    await queryRunner.query(`
      CREATE TABLE "user_sessions" (
        "id" BIGSERIAL PRIMARY KEY,
        "user_id" bigint NOT NULL,
        "token" varchar NOT NULL,
        "ip_address" varchar,
        "user_agent" text,
        "last_activity" TIMESTAMP NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "fk_user_sessions_user" FOREIGN KEY ("user_id") 
          REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);

    // Create api_endpoints table
    await queryRunner.query(`
      CREATE TABLE "api_endpoints" (
        "id" BIGSERIAL PRIMARY KEY,
        "path" varchar NOT NULL,
        "method" varchar NOT NULL,
        "description" text,
        "is_public" boolean NOT NULL DEFAULT false,
        "role_id" bigint,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "fk_api_endpoints_role" FOREIGN KEY ("role_id") 
          REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE CASCADE
      )
    `);

    // Create menu_permissions table
    await queryRunner.query(`
      CREATE TABLE "menu_permissions" (
        "id" BIGSERIAL PRIMARY KEY,
        "role_id" bigint NOT NULL,
        "menu_key" varchar NOT NULL,
        "can_view" boolean NOT NULL DEFAULT false,
        "can_create" boolean NOT NULL DEFAULT false,
        "can_edit" boolean NOT NULL DEFAULT false,
        "can_delete" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "fk_menu_permissions_role" FOREIGN KEY ("role_id") 
          REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);

    // Create indexes for better query performance
    await queryRunner.query(`
      CREATE INDEX "idx_auth_tokens_user_id" ON "auth_tokens" ("user_id");
      CREATE INDEX "idx_auth_tokens_refresh_token" ON "auth_tokens" ("refresh_token") WHERE deleted_at IS NULL;
      CREATE INDEX "idx_user_sessions_user_id" ON "user_sessions" ("user_id");
      CREATE INDEX "idx_user_sessions_token" ON "user_sessions" ("token") WHERE deleted_at IS NULL;
      CREATE INDEX "idx_api_endpoints_path_method" ON "api_endpoints" ("path", "method") WHERE deleted_at IS NULL;
      CREATE INDEX "idx_menu_permissions_role_menu" ON "menu_permissions" ("role_id", "menu_key") WHERE deleted_at IS NULL;
    `);

    // Create unique constraints
    await queryRunner.query(`
      CREATE UNIQUE INDEX "idx_api_endpoints_path_method_unique" 
        ON "api_endpoints" ("path", "method") 
        WHERE deleted_at IS NULL;
      
      CREATE UNIQUE INDEX "idx_menu_permissions_role_menu_unique" 
        ON "menu_permissions" ("role_id", "menu_key") 
        WHERE deleted_at IS NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_menu_permissions_role_menu_unique"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_api_endpoints_path_method_unique"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_menu_permissions_role_menu"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_api_endpoints_path_method"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_user_sessions_token"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_user_sessions_user_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_auth_tokens_refresh_token"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_auth_tokens_user_id"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE IF EXISTS "menu_permissions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "api_endpoints"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_sessions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "auth_tokens"`);
  }
}