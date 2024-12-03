import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { UserRoleRepository } from "../../domain/repositories/user-role.repository";
import { CreateUserRoleDto, UpdateUserRoleDto, UpdateUserRoleStatusDto } from "../dtos/user-role.dto";
import { UserRepository } from "../../../users/domain/repositories/user.repository";
import { RoleRepository } from "../../../roles/domain/repositories/role.repository";

@Injectable()
export class UserRoleService {
  constructor(
    private readonly userRoleRepository: UserRoleRepository,
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository
  ) {}

  async create(createUserRoleDto: CreateUserRoleDto) {
    const user = await this.userRepository.findById(createUserRoleDto.user_id);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    const role = await this.roleRepository.findById(createUserRoleDto.role_id);
    if (!role) {
      throw new NotFoundException("Role not found");
    }

    const existingUserRole = await this.userRoleRepository.findByUserAndRole(
      createUserRoleDto.user_id,
      createUserRoleDto.role_id
    );

    if (existingUserRole) {
      throw new ConflictException("User already has this role");
    }

    const userRole = await this.userRoleRepository.create(createUserRoleDto);
    return {
      user_role_id: userRole.id,
      user_id: userRole.user_id,
      role_id: userRole.role_id,
    };
  }

  async findAll() {
    const userRoles = await this.userRoleRepository.findAllWithRelations();
    return userRoles.map((userRole) => ({
      user_role_id: userRole.id,
      user: {
        id: userRole.user.id,
        first_name: userRole.user.first_name,
        last_name: userRole.user.last_name,
        email: userRole.user.email,
      },
      role: {
        id: userRole.role.id,
        name: userRole.role.name,
        description: userRole.role.description,
      },
    }));
  }

  async findOne(id: number) {
    const userRole = await this.userRoleRepository.findOneWithRelations(id);
    if (!userRole) {
      throw new NotFoundException("User role not found");
    }

    return {
      user_role_id: userRole.id,
      user: {
        id: userRole.user.id,
        first_name: userRole.user.first_name,
        last_name: userRole.user.last_name,
        email: userRole.user.email,
      },
      role: {
        id: userRole.role.id,
        name: userRole.role.name,
        description: userRole.role.description,
      },
    };
  }

  async update(id: number, updateUserRoleDto: UpdateUserRoleDto) {
    const userRole = await this.userRoleRepository.findById(id);
    if (!userRole) {
      throw new NotFoundException("User role not found");
    }

    const role = await this.roleRepository.findById(updateUserRoleDto.role_id);
    if (!role) {
      throw new NotFoundException("Role not found");
    }

    await this.userRoleRepository.update(id, updateUserRoleDto);
  }

  async updateStatus(id: number, updateStatusDto: UpdateUserRoleStatusDto) {
    const userRole = await this.userRoleRepository.findById(id);
    if (!userRole) {
      throw new NotFoundException("User role not found");
    }

    await this.userRoleRepository.update(id, updateStatusDto);
  }

  async remove(id: number) {
    const userRole = await this.userRoleRepository.findById(id);
    if (!userRole) {
      throw new NotFoundException("User role not found");
    }

    await this.userRoleRepository.softDelete(id);
  }
}