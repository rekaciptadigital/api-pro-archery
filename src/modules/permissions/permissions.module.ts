import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleFeaturePermission } from './domain/entities/role-feature-permission.entity';
import { PermissionRepository } from './domain/repositories/permission.repository';
import { PermissionService } from './application/services/permission.service';
import { PermissionController } from './presentation/controllers/permission.controller';
import { RolesModule } from '../roles/roles.module';
import { FeaturesModule } from '../features/features.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RoleFeaturePermission]),
    RolesModule,
    FeaturesModule,
  ],
  providers: [PermissionRepository, PermissionService],
  controllers: [PermissionController],
  exports: [PermissionRepository],
})
export class PermissionsModule {}