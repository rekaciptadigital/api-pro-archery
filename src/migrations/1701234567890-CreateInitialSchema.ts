import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateInitialSchema1701234567890 implements MigrationInterface {
  name = "CreateInitialSchema1701234567890";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create users table
    await queryRunner.query(`
            CREATE TABLE "users" (
                "id" BIGSERIAL PRIMARY KEY,
                "nip" varchar(255),
                "nik" varchar(255),
                "first_name" varchar(255) NOT NULL,
                "last_name" varchar(255),
                "photo_profile" varchar(255),
                "email" varchar(255) NOT NULL UNIQUE,
                "password" varchar(255) NOT NULL,
                "phone_number" varchar(255),
                "address" text,
                "status" boolean NOT NULL DEFAULT true,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP
            )
        `);

    // Create roles table
    await queryRunner.query(`
            CREATE TABLE "roles" (
                "id" BIGSERIAL PRIMARY KEY,
                "name" varchar(255),
                "description" text,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP
            )
        `);

    // Create features table
    await queryRunner.query(`
            CREATE TABLE "features" (
                "id" BIGSERIAL PRIMARY KEY,
                "name" varchar(255) NOT NULL,
                "description" text,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP
            )
        `);

    // Create role_feature_permissions table
    await queryRunner.query(`
            CREATE TABLE "role_feature_permissions" (
                "id" BIGSERIAL PRIMARY KEY,
                "role_id" bigint NOT NULL,
                "feature_id" bigint NOT NULL,
                "methods" json NOT NULL,
                "status" boolean NOT NULL DEFAULT true,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                FOREIGN KEY ("role_id") REFERENCES "roles" ("id"),
                FOREIGN KEY ("feature_id") REFERENCES "features" ("id")
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "role_feature_permissions"`);
    await queryRunner.query(`DROP TABLE "features"`);
    await queryRunner.query(`DROP TABLE "roles"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
