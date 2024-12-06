import { Injectable } from '@nestjs/common';
import { RoleRepository } from '../repositories/role.repository';
import { RoleException } from '../exceptions/role.exception';
import { HttpStatus } from '@nestjs/common';

@Injectable()
export class RoleValidator {
  constructor(private readonly roleRepository: RoleRepository) {}

  async validateName(name: string): Promise<void> {
    await this.validateNameNotEmpty(name);
    await this.validateNameUnique(name);
  }

  async validateForOperation(name: string, excludeId?: number): Promise<void> {
    await this.validateNameNotEmpty(name);
    await this.validateNameUniqueForUpdate(name, excludeId);
  }

  private async validateNameNotEmpty(name: string): Promise<void> {
    if (!name || name.trim().length === 0) {
      throw new RoleException('Role name cannot be empty');
    }
  }

  private async validateNameUnique(name: string): Promise<void> {
    const existingRole = await this.roleRepository.findByNameCaseInsensitive(name);

    if (existingRole) {
      throw new RoleException(
        `Role name '${name}' already exists. Please choose a different name.`,
        HttpStatus.CONFLICT
      );
    }
  }

  private async validateNameUniqueForUpdate(name: string, excludeId?: number): Promise<void> {
    const existingRole = await this.roleRepository.findByNameCaseInsensitive(name);

    if (existingRole && existingRole.id !== excludeId) {
      throw new RoleException(
        `Role name '${name}' already exists. Please choose a different name.`,
        HttpStatus.CONFLICT
      );
    }
  }
}