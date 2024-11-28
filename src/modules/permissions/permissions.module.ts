import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleFeaturePermission } from './domain/entities/role-feature-permission.entity';
import { PermissionRepository } from './domain/repositories/permission.repository';

@Module({
  imports: [TypeOrmModule.forFeature([RoleFeaturePermission])],
  providers: [PermissionRepository],
  exports: [PermissionRepository],
})
export class PermissionsModule {}