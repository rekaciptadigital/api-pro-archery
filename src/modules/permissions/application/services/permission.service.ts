import { Injectable, NotFoundException } from '@nestjs/common';
import { PermissionRepository } from '../../domain/repositories/permission.repository';
import { RoleRepository } from '../../../roles/domain/repositories/role.repository';
import { FeatureRepository } from '../../../features/domain/repositories/feature.repository';
import {
  CreatePermissionDto,
  UpdatePermissionDto,
  UpdatePermissionStatusDto,
} from '../dtos/permission.dto';

@Injectable()
export class PermissionService {
  constructor(
    private readonly permissionRepository: PermissionRepository,
    private readonly roleRepository: RoleRepository,
    private readonly featureRepository: FeatureRepository,
  ) {}

  async create(createPermissionDto: CreatePermissionDto) {
    const role = await this.roleRepository.findById(createPermissionDto.role_id);
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const feature = await this.featureRepository.findById(
      createPermissionDto.feature_id,
    );
    if (!feature) {
      throw new NotFoundException('Feature not found');
    }

    const permission = await this.permissionRepository.create({
      role_id: createPermissionDto.role_id,
      feature_id: createPermissionDto.feature_id,
      methods: createPermissionDto.permissions,
      status: createPermissionDto.status ?? true,
    });

    return {
      id: permission.id,
      role_id: permission.role_id,
      feature_id: permission.feature_id,
      permissions: permission.methods,
      status: permission.status,
    };
  }

  async update(id: number, updatePermissionDto: UpdatePermissionDto) {
    const permission = await this.permissionRepository.findById(id);
    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    await this.permissionRepository.update(id, {
      methods: {
        ...permission.methods,
        ...updatePermissionDto.permissions,
      },
    });
  }

  async updateStatus(id: number, updateStatusDto: UpdatePermissionStatusDto) {
    const permission = await this.permissionRepository.findById(id);
    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    await this.permissionRepository.update(id, {
      status: updateStatusDto.status,
    });
  }

  async remove(id: number) {
    const permission = await this.permissionRepository.findById(id);
    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    await this.permissionRepository.softDelete(id);
  }
}