import { Injectable } from "@nestjs/common";
import { RoleSeeder } from "./role.seeder";
import { UserSeeder } from "./user.seeder";
import { FeatureSeeder } from "./feature.seeder";
import { PermissionSeeder } from "./permission.seeder";
import { Logger } from "@nestjs/common";
import { Seeder } from "./seeder.interface";

@Injectable()
export class DatabaseSeeder {
  private readonly logger = new Logger(DatabaseSeeder.name);
  private readonly seeders: Map<string, Seeder>;

  constructor(
    private readonly roleSeeder: RoleSeeder,
    private readonly featureSeeder: FeatureSeeder,
    private readonly permissionSeeder: PermissionSeeder,
    private readonly userSeeder: UserSeeder
  ) {
    this.seeders = new Map<string, Seeder>([
      ["roles", roleSeeder],
      ["features", featureSeeder],
      ["permissions", permissionSeeder],
      ["users", userSeeder],
    ]);
  }

  async seed(seederName?: string) {
    try {
      this.logger.log("Starting database seeding...");

      if (seederName) {
        // Run specific seeder
        const seeder = this.seeders.get(seederName);
        if (!seeder) {
          throw new Error(`Seeder ${seederName} not found`);
        }
        this.logger.log(`Seeding ${seederName}...`);
        await seeder.createMany();
      } else {
        // Run all seeders in sequence
        await this.roleSeeder.createMany();
        await this.featureSeeder.createMany();
        await this.permissionSeeder.createMany();
        await this.userSeeder.createMany();
      }

      this.logger.log("Database seeding completed successfully");
    } catch (error) {
      this.logger.error("Error during database seeding:", error);
      throw error;
    }
  }

  getAvailableSeeders(): string[] {
    return Array.from(this.seeders.keys());
  }
}
