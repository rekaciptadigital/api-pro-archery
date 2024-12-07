import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../../users/domain/repositories/user.repository';
import { RoleRepository } from '../../../roles/domain/repositories/role.repository';
import { UserRoleRepository } from '../repositories/user-role.repository';
import { DomainException } from '../../../common/exceptions/domain.exception';
import { HttpStatus } from '@nestjs/common';

@Injectable()
export class UserRoleValidator {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository,
    private readonly userRoleRepository: UserRoleRepository,
  ) {}

  async validateForCreate(userId: number, roleId: number): Promise<void> {
    // 1. Validate user and role existence and status
    await this.validateUserAndRoleStatus(userId, roleId);
    
    // 2. Check for existing user role
    const existingUserRole = await this.userRoleRepository.findByUserAndRole(userId, roleId);
    if (existingUserRole) {
      throw new DomainException(
        'User already has this role assigned',
        HttpStatus.CONFLICT
      );
    }
  }

  async validateForUpdate(id: number, userId: number, roleId: number): Promise<void> {
    // 1. Validate user and role existence and status
    await this.validateUserAndRoleStatus(userId, roleId);

    // 2. Check for existing user role
    const existingUserRole = await this.userRoleRepository.findByUserAndRole(userId, roleId);
    if (existingUserRole && existingUserRole.id !== id) {
      throw new DomainException(
        'Another user-role mapping already exists with this combination',
        HttpStatus.CONFLICT
      );
    }
  }

  private async validateUserAndRoleStatus(userId: number, roleId: number): Promise<void> {
    // Validate user exists and is active
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new DomainException('User not found', HttpStatus.NOT_FOUND);
    }
    if (!user.status) {
      throw new DomainException(
        'Cannot assign role to inactive user',
        HttpStatus.BAD_REQUEST
      );
    }

    // Validate role exists and is active
    const role = await this.roleRepository.findById(roleId);
    if (!role) {
      throw new DomainException('Role not found', HttpStatus.NOT_FOUND);
    }
    if (!role.status) {
      throw new DomainException(
        'Cannot assign inactive role',
        HttpStatus.BAD_REQUEST
      );
    }
  }
}