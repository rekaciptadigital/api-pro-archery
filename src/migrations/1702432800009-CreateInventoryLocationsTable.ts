/*
  # Create Inventory Locations Table

  1. New Tables
    - `inventory_locations`
      - `id` (bigserial, primary key)
      - `code` (varchar(20), unique)
      - `name` (varchar(255))
      - `type` (varchar(50))
      - `description` (text, nullable)
      - `status` (boolean, default true)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `deleted_at` (timestamp, nullable)

  2. Indexes
    - Index on `code` for unique constraint lookups
    - Index on `name` for searching
    - Index on `type` for filtering
    - Index on `status` for filtering
*/

import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateInventoryLocationsTable1702432800009 implements MigrationInterface {
  name = 'CreateInventoryLocationsTable1702432800009';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "inventory_locations" (
        "id" BIGSERIAL PRIMARY KEY,
        "code" varchar(20) NOT NULL,
        "name" varchar(255) NOT NULL,
        "type" varchar(50) NOT NULL,
        "description" text,
        "status" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "uq_inventory_locations_code" UNIQUE ("code")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_inventory_locations_code" ON "inventory_locations" ("code");
      CREATE INDEX "idx_inventory_locations_name" ON "inventory_locations" ("name");
      CREATE INDEX "idx_inventory_locations_type" ON "inventory_locations" ("type");
      CREATE INDEX "idx_inventory_locations_status" ON "inventory_locations" ("status");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_inventory_locations_status"`);
    await queryRunner.query(`DROP INDEX "idx_inventory_locations_type"`);
    await queryRunner.query(`DROP INDEX "idx_inventory_locations_name"`);
    await queryRunner.query(`DROP INDEX "idx_inventory_locations_code"`);
    await queryRunner.query(`DROP TABLE "inventory_locations"`);
  }
}