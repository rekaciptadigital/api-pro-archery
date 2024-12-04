import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { RoleFeaturePermission } from '../entities/role-feature-permission.entity';
import { BaseRepository } from '../../../common/repositories/base.repository';

@Injectable()
export class PermissionRepository extends BaseRepository<RoleFeaturePermission> {
  constructor(
    @InjectRepository(RoleFeaturePermission)
    private readonly permissionRepository: Repository<RoleFeaturePermission>,
  ) {
    super(permissionRepository);
  }

  async findWithRelationsAndCount(options: FindManyOptions<RoleFeaturePermission>) {
    return this.permissionRepository.findAndCount(options);
  }

  async findOneWithRelations(id: number): Promise<RoleFeaturePermission | null> {
    return this.permissionRepository.findOne({
      where: { id },
      relations: ['role', 'feature'],
    });
  }
}