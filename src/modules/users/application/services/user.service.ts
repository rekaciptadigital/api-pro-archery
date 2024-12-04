import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../domain/repositories/user.repository';
import { CreateUserDto, UpdateUserDto } from '../dtos/user.dto';
import { UserQueryDto } from '../dtos/user-query.dto';
import { UserResponseDto, PaginatedUserResponseDto, UserRoleDto } from '../dtos/user-response.dto';
import { UserRoleRepository } from '../../../user-roles/domain/repositories/user-role.repository';
import { User } from '../../domain/entities/user.entity';
import { UserRole } from '../../../user-roles/domain/entities/user-role.entity';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userRoleRepository: UserRoleRepository,
  ) {}

  async findAll(query: UserQueryDto): Promise<PaginatedUserResponseDto> {
    const { page = 1, limit = 10, sort, order, role, search } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.userRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'roles')
      .skip(skip)
      .take(limit);

    if (sort) {
      queryBuilder.orderBy(`user.${sort}`, order?.toUpperCase() as 'ASC' | 'DESC');
    }

    if (role) {
      queryBuilder.andWhere('roles.name = :role', { role });
    }

    if (search) {
      queryBuilder.andWhere(
        '(user.username ILIKE :search OR user.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [users, total] = await queryBuilder.getManyAndCount();
    const userRoles = await Promise.all(
      users.map((user: User) => this.userRoleRepository.findByUser(user.id))
    );

    const data = users.map((user: User, index: number) => this.mapUserToResponse(user, userRoles[index]));

    return {
      data,
      metadata: {
        current_page: page,
        total_pages: Math.ceil(total / limit),
        total_items: total,
        items_per_page: limit,
      },
    };
  }

  async findOne(id: number): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const userRoles = await this.userRoleRepository.findByUser(id);
    return this.mapUserToResponse(user, userRoles);
  }

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.userRepository.create(createUserDto);
    const userRoles = await this.userRoleRepository.findByUser(user.id);
    return this.mapUserToResponse(user, userRoles);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.userRepository.update(id, updateUserDto);
    const userRoles = await this.userRoleRepository.findByUser(id);
    return this.mapUserToResponse(user, userRoles);
  }

  async remove(id: number): Promise<void> {
    await this.userRepository.softDelete(id);
  }

  private mapUserToResponse(user: User, userRoles: UserRole[]): UserResponseDto {
    const role = userRoles[0]?.role;

    const userRole: UserRoleDto = {
      id: role?.id || 0,
      name: role?.name || 'No Role',
      permissions: [],
    };

    return {
      id: user.id,
      username: user.username || '',
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone_number,
      status: user.status ? 'active' : 'inactive',
      role: userRole,
      created_at: user.created_at,
      updated_at: user.updated_at,
      last_login: user.last_login,
    };
  }
}