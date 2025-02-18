import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterUserSessionIdType1702432800012 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop all existing constraints first
    await queryRunner.query(`
      DO $$ 
      DECLARE
        r record;
      BEGIN
        FOR r IN (SELECT constraint_name 
                 FROM information_schema.table_constraints 
                 WHERE table_name = 'user_sessions' 
                 AND constraint_type = 'PRIMARY KEY') 
        LOOP
          EXECUTE 'ALTER TABLE user_sessions DROP CONSTRAINT ' || quote_ident(r.constraint_name);
        END LOOP;
      END $$;
    `);

    // Change ID column type
    await queryRunner.query(`
      ALTER TABLE "user_sessions" 
      ALTER COLUMN "id" TYPE varchar
      USING id::varchar
    `);

    // Add new primary key constraint with a unique name
    await queryRunner.query(`
      ALTER TABLE "user_sessions"
      ADD CONSTRAINT "PK_user_sessions_new" PRIMARY KEY ("id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the new primary key constraint
    await queryRunner.query(`
      ALTER TABLE "user_sessions" 
      DROP CONSTRAINT IF EXISTS "PK_user_sessions_new"
    `);

    // Change back to bigint
    await queryRunner.query(`
      ALTER TABLE "user_sessions" 
      ALTER COLUMN "id" TYPE bigint 
      USING id::bigint
    `);

    // Add back original primary key
    await queryRunner.query(`
      ALTER TABLE "user_sessions"
      ADD CONSTRAINT "PK_user_sessions" PRIMARY KEY ("id")
    `);
  }
}
