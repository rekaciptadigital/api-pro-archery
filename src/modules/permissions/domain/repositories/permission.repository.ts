import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleFeaturePermission } from '../entities/role-feature-permission.entity';
import { BaseRepository } from '../../../common/repositories/base.repository';

@Injectable()
export class PermissionRepository extends BaseRepository<RoleFeaturePermission> {
  constructor(
    @InjectRepository(RoleFeaturePermission)
    private readonly permissionRepository: Repository<RoleFeaturePermission>
  ) {
    super(permissionRepository);
  }

  async findOneWithRelations(id: number): Promise<RoleFeaturePermission | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['role', 'feature']
    });
  }

  async findByRoleAndFeature(roleId: number, featureId: number): Promise<RoleFeaturePermission | null> {
    return this.repository.findOne({
      where: {
        role_id: roleId,
        feature_id: featureId
      }
    });
  }

  async findWithDeleted(id: number): Promise<RoleFeaturePermission | null> {
    return this.repository.findOne({
      where: { id } as any,
      withDeleted: true
    });
  }

  async restore(id: number): Promise<RoleFeaturePermission | null> {
    await this.repository.restore(id);
    return this.findById(id);
  }
}