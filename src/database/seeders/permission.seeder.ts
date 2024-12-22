import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleFeaturePermission } from '../../modules/permissions/domain/entities/role-feature-permission.entity';
import { Role } from '../../modules/roles/domain/entities/role.entity';
import { Feature } from '../../modules/features/domain/entities/feature.entity';
import { Logger } from '@nestjs/common';

@Injectable()
export class PermissionSeeder {
  private readonly logger = new Logger(PermissionSeeder.name);

  constructor(
    @InjectRepository(RoleFeaturePermission)
    private readonly permissionRepository: Repository<RoleFeaturePermission>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Feature)
    private readonly featureRepository: Repository<Feature>
  ) {}

  async createMany(): Promise<void> {
    try {
      // Find super_admin role
      const superAdminRole = await this.roleRepository.findOne({
        where: { name: 'super_admin' }
      });

      if (!superAdminRole) {
        throw new Error('Super admin role not found');
      }

      // Get all features
      const features = await this.featureRepository.find();

      // Create full permissions for super admin
      for (const feature of features) {
        const existingPermission = await this.permissionRepository.findOne({
          where: {
            role_id: superAdminRole.id,
            feature_id: feature.id
          }
        });

        if (!existingPermission) {
          await this.permissionRepository.save({
            role_id: superAdminRole.id,
            feature_id: feature.id,
            methods: {
              get: true,
              post: true,
              put: true,
              patch: true,
              delete: true
            },
            status: true
          });
          this.logger.log(`Created permission for feature: ${feature.name}`);
        } else {
          this.logger.log(`Permission already exists for feature: ${feature.name}`);
        }
      }
    } catch (error) {
      this.logger.error('Error seeding permissions:', error);
      throw error;
    }
  }
}