import { Injectable, NotFoundException } from '@nestjs/common';
import { RoleRepository } from '../../domain/repositories/role.repository';
import { CreateRoleDto, UpdateRoleDto, UpdateRoleStatusDto } from '../dtos/role.dto';
import { PaginationHelper } from '../../../../common/pagination/helpers/pagination.helper';
import { PaginationQueryDto } from '../../../../common/pagination/dto/pagination-query.dto';
import { ResponseTransformer } from '../../../../common/transformers/response.transformer';
import { IsNull } from 'typeorm';

@Injectable()
export class RoleService {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly paginationHelper: PaginationHelper,
    private readonly responseTransformer: ResponseTransformer,
  ) {}

  // ... other methods remain the same ...

  async remove(id: number) {
    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    await this.roleRepository.softDelete(id);
    return this.responseTransformer.transformDelete('Role');
  }
}