import { Injectable } from '@nestjs/common';
import { RoleSeeder } from './role.seeder';
import { UserSeeder } from './user.seeder';
import { FeatureSeeder } from './feature.seeder';
import { PermissionSeeder } from './permission.seeder';
import { Logger } from '@nestjs/common';

@Injectable()
export class DatabaseSeeder {
  private readonly logger = new Logger(DatabaseSeeder.name);

  constructor(
    private readonly roleSeeder: RoleSeeder,
    private readonly featureSeeder: FeatureSeeder,
    private readonly permissionSeeder: PermissionSeeder,
    private readonly userSeeder: UserSeeder
  ) {}

  async seed() {
    try {
      this.logger.log('Starting database seeding...');

      // Seed roles first
      this.logger.log('Seeding roles...');
      await this.roleSeeder.createMany();

      // Then seed features
      this.logger.log('Seeding features...');
      await this.featureSeeder.createMany();

      // Then seed permissions
      this.logger.log('Seeding permissions...');
      await this.permissionSeeder.createMany();

      // Finally seed users
      this.logger.log('Seeding users...');
      await this.userSeeder.createMany();

      this.logger.log('Database seeding completed successfully');
    } catch (error) {
      this.logger.error('Error during database seeding:', error);
      throw error;
    }
  }
}