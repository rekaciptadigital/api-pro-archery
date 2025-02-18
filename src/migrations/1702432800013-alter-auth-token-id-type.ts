import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterAuthTokenIdType1702432800013 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop all existing constraints first
    await queryRunner.query(`
      DO $$ 
      DECLARE
        r record;
      BEGIN
        FOR r IN (SELECT constraint_name 
                 FROM information_schema.table_constraints 
                 WHERE table_name = 'auth_tokens' 
                 AND constraint_type = 'PRIMARY KEY') 
        LOOP
          EXECUTE 'ALTER TABLE auth_tokens DROP CONSTRAINT ' || quote_ident(r.constraint_name);
        END LOOP;
      END $$;
    `);

    // Change ID column type
    await queryRunner.query(`
      ALTER TABLE "auth_tokens" 
      ALTER COLUMN "id" TYPE varchar
      USING id::varchar
    `);

    // Add new primary key constraint with a unique name
    await queryRunner.query(`
      ALTER TABLE "auth_tokens"
      ADD CONSTRAINT "PK_auth_tokens_new" PRIMARY KEY ("id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the new primary key constraint
    await queryRunner.query(`
      ALTER TABLE "auth_tokens" 
      DROP CONSTRAINT IF EXISTS "PK_auth_tokens_new"
    `);

    // Change back to bigint
    await queryRunner.query(`
      ALTER TABLE "auth_tokens" 
      ALTER COLUMN "id" TYPE bigint 
      USING id::bigint
    `);

    // Add back original primary key
    await queryRunner.query(`
      ALTER TABLE "auth_tokens"
      ADD CONSTRAINT "PK_auth_tokens" PRIMARY KEY ("id")
    `);
  }
}
