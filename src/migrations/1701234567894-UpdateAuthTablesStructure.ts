import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateAuthTablesStructure1701234567894 implements MigrationInterface {
  name = "UpdateAuthTablesStructure1701234567894";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop existing foreign keys
    await queryRunner.query(`ALTER TABLE "auth_tokens" DROP CONSTRAINT IF EXISTS "FK_auth_tokens_user_id"`);
    await queryRunner.query(`ALTER TABLE "user_sessions" DROP CONSTRAINT IF EXISTS "FK_user_sessions_user_id"`);
    
    // Drop existing indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_auth_tokens_user_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_auth_tokens_refresh_token"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_user_sessions_user_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_user_sessions_token"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_api_endpoints_path_method"`);

    // Modify auth_tokens table
    await queryRunner.query(`
      ALTER TABLE "auth_tokens" 
      DROP CONSTRAINT IF EXISTS "PK_auth_tokens";
      
      ALTER TABLE "auth_tokens"
      DROP COLUMN "id",
      ADD COLUMN "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY;
    `);

    // Modify user_sessions table
    await queryRunner.query(`
      ALTER TABLE "user_sessions" 
      DROP CONSTRAINT IF EXISTS "PK_user_sessions";
      
      ALTER TABLE "user_sessions"
      DROP COLUMN "id",
      ADD COLUMN "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY;
    `);

    // Add role_id to api_endpoints table
    await queryRunner.query(`
      ALTER TABLE "api_endpoints"
      ADD COLUMN "role_id" bigint;
    `);

    // Add foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "auth_tokens"
      ADD CONSTRAINT "FK_auth_tokens_user_id"
      FOREIGN KEY ("user_id")
      REFERENCES "users"("id")
      ON DELETE CASCADE;

      ALTER TABLE "user_sessions"
      ADD CONSTRAINT "FK_user_sessions_user_id"
      FOREIGN KEY ("user_id")
      REFERENCES "users"("id")
      ON DELETE CASCADE;

      ALTER TABLE "api_endpoints"
      ADD CONSTRAINT "FK_api_endpoints_role_id"
      FOREIGN KEY ("role_id")
      REFERENCES "roles"("id")
      ON DELETE SET NULL;
    `);

    // Recreate indexes
    await queryRunner.query(`
      CREATE INDEX "idx_auth_tokens_user_id" ON "auth_tokens"("user_id");
      CREATE INDEX "idx_auth_tokens_refresh_token" ON "auth_tokens"("refresh_token");
      CREATE INDEX "idx_user_sessions_user_id" ON "user_sessions"("user_id");
      CREATE INDEX "idx_user_sessions_token" ON "user_sessions"("token");
      CREATE INDEX "idx_api_endpoints_path_method" ON "api_endpoints"("path", "method");
      CREATE INDEX "idx_api_endpoints_role_id" ON "api_endpoints"("role_id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_api_endpoints_role_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_api_endpoints_path_method"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_user_sessions_token"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_user_sessions_user_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_auth_tokens_refresh_token"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_auth_tokens_user_id"`);

    // Remove foreign key constraints
    await queryRunner.query(`ALTER TABLE "api_endpoints" DROP CONSTRAINT IF EXISTS "FK_api_endpoints_role_id"`);
    await queryRunner.query(`ALTER TABLE "user_sessions" DROP CONSTRAINT IF EXISTS "FK_user_sessions_user_id"`);
    await queryRunner.query(`ALTER TABLE "auth_tokens" DROP CONSTRAINT IF EXISTS "FK_auth_tokens_user_id"`);

    // Remove role_id from api_endpoints
    await queryRunner.query(`ALTER TABLE "api_endpoints" DROP COLUMN "role_id"`);

    // Revert user_sessions id to bigint
    await queryRunner.query(`
      ALTER TABLE "user_sessions" 
      DROP CONSTRAINT IF EXISTS "PK_user_sessions";
      
      ALTER TABLE "user_sessions"
      DROP COLUMN "id",
      ADD COLUMN "id" BIGSERIAL PRIMARY KEY;
    `);

    // Revert auth_tokens id to bigint
    await queryRunner.query(`
      ALTER TABLE "auth_tokens" 
      DROP CONSTRAINT IF EXISTS "PK_auth_tokens";
      
      ALTER TABLE "auth_tokens"
      DROP COLUMN "id",
      ADD COLUMN "id" BIGSERIAL PRIMARY KEY;
    `);

    // Recreate original foreign keys
    await queryRunner.query(`
      ALTER TABLE "auth_tokens"
      ADD CONSTRAINT "FK_auth_tokens_user_id"
      FOREIGN KEY ("user_id")
      REFERENCES "users"("id");

      ALTER TABLE "user_sessions"
      ADD CONSTRAINT "FK_user_sessions_user_id"
      FOREIGN KEY ("user_id")
      REFERENCES "users"("id");
    `);
  }
}