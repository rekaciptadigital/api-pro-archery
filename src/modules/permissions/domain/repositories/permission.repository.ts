import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleFeaturePermission } from '../entities/role-feature-permission.entity';
import { BaseRepository } from '../../../common/repositories/base.repository';

@Injectable()
export class PermissionRepository extends BaseRepository<RoleFeaturePermission> {
  constructor(
    @InjectRepository(RoleFeaturePermission)
    repository: Repository<RoleFeaturePermission>,
  ) {
    super(repository);
  }

  async findByRoleAndFeature(roleId: number, featureId: number): Promise<RoleFeaturePermission | null> {
    return this.findOne({
      role_id: roleId,
      feature_id: featureId,
    } as any);
  }
}