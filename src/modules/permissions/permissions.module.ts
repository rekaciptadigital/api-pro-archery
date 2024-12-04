import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleFeaturePermission } from './domain/entities/role-feature-permission.entity';
import { PermissionRepository } from './domain/repositories/permission.repository';
import { PermissionService } from './application/services/permission.service';
import { PermissionController } from './presentation/controllers/permission.controller';
import { RolesModule } from '../roles/roles.module';
import { FeaturesModule } from '../features/features.module';
import { PaginationModule } from '../../common/pagination/pagination.module';
import { TransformersModule } from '../../common/transformers/transformers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RoleFeaturePermission]),
    RolesModule,
    FeaturesModule,
    PaginationModule,
    TransformersModule
  ],
  providers: [PermissionRepository, PermissionService],
  controllers: [PermissionController],
  exports: [PermissionRepository],
})
export class PermissionsModule {}