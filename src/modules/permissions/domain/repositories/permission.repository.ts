import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, FindOptionsWhere } from 'typeorm';
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

  async findAndCount(options?: FindManyOptions<RoleFeaturePermission>): Promise<[RoleFeaturePermission[], number]> {
    return this.permissionRepository.findAndCount(options);
  }

  async findOneWithRelations(id: number): Promise<RoleFeaturePermission | null> {
    return this.permissionRepository.findOne({
      where: { id } as FindOptionsWhere<RoleFeaturePermission>,
      relations: ['role', 'feature'],
    });
  }
}