import { Injectable } from "@nestjs/common";
import { UserRoleRepository } from "../../domain/repositories/user-role.repository";
import { CreateUserRoleDto, UpdateUserRoleDto, UpdateUserRoleStatusDto } from "../dtos/user-role.dto";
import { UserRoleValidator } from "../../domain/validators/user-role.validator";
import { ResponseTransformer } from "../../../../common/transformers/response.transformer";
import { DomainException } from "@/common/exceptions/domain.exception";
import { HttpStatus } from "@nestjs/common";

@Injectable()
export class UserRoleService {
  constructor(
    private readonly userRoleRepository: UserRoleRepository,
    private readonly userRoleValidator: UserRoleValidator,
    private readonly responseTransformer: ResponseTransformer
  ) {}

  async create(createUserRoleDto: CreateUserRoleDto) {
    await this.userRoleValidator.validateForCreate(
      createUserRoleDto.user_id,
      createUserRoleDto.role_id
    );

    const userRole = await this.userRoleRepository.create({
      ...createUserRoleDto,
      status: createUserRoleDto.status ?? true,
    });

    return this.responseTransformer.transform(userRole);
  }

  async findAll() {
    const userRoles = await this.userRoleRepository.findAllWithRelations();
    return this.responseTransformer.transform(userRoles);
  }

  async findOne(id: number) {
    const userRole = await this.userRoleRepository.findOneWithRelations(id);
    if (!userRole) {
      throw new DomainException('User role not found', HttpStatus.NOT_FOUND);
    }

    return this.responseTransformer.transform(userRole);
  }

  async update(id: number, updateUserRoleDto: UpdateUserRoleDto) {
    const userRole = await this.userRoleRepository.findById(id);
    if (!userRole) {
      throw new DomainException('User role not found', HttpStatus.NOT_FOUND);
    }

    await this.userRoleValidator.validateForUpdate(
      id,
      userRole.user_id,
      updateUserRoleDto.role_id
    );

    const updated = await this.userRoleRepository.update(id, updateUserRoleDto);
    return this.responseTransformer.transform(updated);
  }

  async updateStatus(id: number, updateStatusDto: UpdateUserRoleStatusDto) {
    const userRole = await this.userRoleRepository.findById(id);
    if (!userRole) {
      throw new DomainException('User role not found', HttpStatus.NOT_FOUND);
    }

    const updated = await this.userRoleRepository.update(id, updateStatusDto);
    return this.responseTransformer.transform(updated);
  }

  async remove(id: number) {
    const userRole = await this.userRoleRepository.findById(id);
    if (!userRole) {
      throw new DomainException('User role not found', HttpStatus.NOT_FOUND);
    }

    await this.userRoleRepository.softDelete(id);
    return this.responseTransformer.transform({ message: 'User role deleted successfully' });
  }

  async restore(id: number) {
    const userRole = await this.userRoleRepository.findWithDeleted(id);
    if (!userRole) {
      throw new DomainException('User role not found', HttpStatus.NOT_FOUND);
    }

    if (!userRole.deleted_at) {
      throw new DomainException('User role is not deleted', HttpStatus.BAD_REQUEST);
    }

    const restored = await this.userRoleRepository.restore(id);
    if (!restored) {
      throw new DomainException('Failed to restore user role', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return this.responseTransformer.transform(restored);
  }
}