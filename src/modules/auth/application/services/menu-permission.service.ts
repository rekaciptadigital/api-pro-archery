import { Injectable, NotFoundException } from '@nestjs/common';
import { MenuPermissionRepository } from '../../domain/repositories/menu-permission.repository';
import { CreateMenuPermissionDto, UpdateMenuPermissionDto } from '../dtos/menu-permission.dto';
import { ResponseTransformer } from '@/common/transformers/response.transformer';
import { DomainException } from '@/common/exceptions/domain.exception';
import { HttpStatus } from '@nestjs/common';
import { RoleRepository } from '@/modules/roles/domain/repositories/role.repository';

@Injectable()
export class MenuPermissionService {
  constructor(
    private readonly menuPermissionRepository: MenuPermissionRepository,
    private readonly roleRepository: RoleRepository,
    private readonly responseTransformer: ResponseTransformer
  ) {}

  async create(createMenuPermissionDto: CreateMenuPermissionDto) {
    const role = await this.roleRepository.findById(createMenuPermissionDto.role_id);
    if (!role) {
      throw new DomainException('Role not found', HttpStatus.NOT_FOUND);
    }

    const existingPermission = await this.menuPermissionRepository.findByRoleAndMenuKey(
      createMenuPermissionDto.role_id,
      createMenuPermissionDto.menu_key
    );

    if (existingPermission) {
      throw new DomainException(
        'Menu permission already exists for this role and menu',
        HttpStatus.CONFLICT
      );
    }

    const permission = await this.menuPermissionRepository.create(createMenuPermissionDto);
    return this.responseTransformer.transform(permission);
  }

  async findAll() {
    const permissions = await this.menuPermissionRepository.findAll();
    return this.responseTransformer.transform(permissions);
  }

  async findOne(id: number) {
    const permission = await this.menuPermissionRepository.findById(id);
    if (!permission) {
      throw new NotFoundException('Menu permission not found');
    }
    return this.responseTransformer.transform(permission);
  }

  async update(id: number, updateMenuPermissionDto: UpdateMenuPermissionDto) {
    const permission = await this.menuPermissionRepository.findById(id);
    if (!permission) {
      throw new NotFoundException('Menu permission not found');
    }

    const updated = await this.menuPermissionRepository.update(id, updateMenuPermissionDto);
    return this.responseTransformer.transform(updated);
  }

  async remove(id: number) {
    const permission = await this.menuPermissionRepository.findById(id);
    if (!permission) {
      throw new NotFoundException('Menu permission not found');
    }

    await this.menuPermissionRepository.softDelete(id);
    return this.responseTransformer.transform({ message: 'Menu permission deleted successfully' });
  }

  async restore(id: number) {
    const permission = await this.menuPermissionRepository.findWithDeleted(id);
    if (!permission) {
      throw new NotFoundException('Menu permission not found');
    }

    if (!permission.deleted_at) {
      throw new DomainException('Menu permission is not deleted', HttpStatus.BAD_REQUEST);
    }

    const restored = await this.menuPermissionRepository.restore(id);
    if (!restored) {
      throw new DomainException('Failed to restore menu permission', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return this.responseTransformer.transform(restored);
  }

  async findByRole(roleId: number) {
    const role = await this.roleRepository.findById(roleId);
    if (!role) {
      throw new DomainException('Role not found', HttpStatus.NOT_FOUND);
    }

    const permissions = await this.menuPermissionRepository.findByRole(roleId);
    return this.responseTransformer.transform(permissions);
  }
}