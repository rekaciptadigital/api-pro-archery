import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateVariantsTable1702432800002 implements MigrationInterface {
  name = 'CreateVariantsTable1702432800002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create variants table with nullable display_order
    await queryRunner.query(`
      CREATE TABLE "variants" (
        "id" BIGSERIAL PRIMARY KEY,
        "name" varchar(255) NOT NULL,
        "display_order" integer,
        "status" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP
      )
    `);

    // Create variant_values table
    await queryRunner.query(`
      CREATE TABLE "variant_values" (
        "id" BIGSERIAL PRIMARY KEY,
        "variant_id" bigint NOT NULL,
        "value" varchar(50) NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "fk_variant_values_variant" 
        FOREIGN KEY ("variant_id") 
        REFERENCES "variants"("id") 
        ON DELETE CASCADE
      )
    `);

    // Create indexes
    await queryRunner.query(`
      CREATE INDEX "idx_variants_name" ON "variants" ("name");
      CREATE INDEX "idx_variants_display_order" ON "variants" ("display_order");
      CREATE INDEX "idx_variants_status" ON "variants" ("status");
      CREATE INDEX "idx_variant_values_variant_id" ON "variant_values" ("variant_id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_variant_values_variant_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_variants_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_variants_display_order"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_variants_name"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "variant_values"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "variants"`);
  }
}