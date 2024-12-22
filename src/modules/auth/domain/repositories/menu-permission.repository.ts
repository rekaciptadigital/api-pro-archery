import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { MenuPermission } from '../entities/menu-permission.entity';
import { BaseRepository } from '@/common/repositories/base.repository';

@Injectable()
export class MenuPermissionRepository extends BaseRepository<MenuPermission> {
  constructor(
    @InjectRepository(MenuPermission)
    private readonly menuPermissionRepository: Repository<MenuPermission>
  ) {
    super(menuPermissionRepository);
  }

  async findByRoleAndMenuKey(roleId: number, menuKey: string): Promise<MenuPermission | null> {
    return this.menuPermissionRepository.findOne({
      where: {
        role_id: roleId,
        menu_key: menuKey,
        deleted_at: IsNull()
      } as any
    });
  }

  async findByRole(roleId: number): Promise<MenuPermission[]> {
    return this.menuPermissionRepository.find({
      where: {
        role_id: roleId,
        deleted_at: IsNull()
      } as any,
      relations: ['role']
    });
  }
}