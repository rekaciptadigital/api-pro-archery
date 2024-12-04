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

    const queryBuilder = this.userRepository.createQueryBuilder('user');
    
    try {
      queryBuilder
        .leftJoinAndSelect('user.userRoles', 'userRoles')
        .leftJoinAndSelect('userRoles.role', 'role')
        .skip(skip)
        .take(limit);

      if (sort) {
        queryBuilder.orderBy(`user.${sort}`, order?.toUpperCase() as 'ASC' | 'DESC');
      }

      if (role) {
        queryBuilder.andWhere('role.name = :role', { role });
      }

      if (search) {
        queryBuilder.andWhere(
          '(user.username ILIKE :search OR user.email ILIKE :search)',
          { search: `%${search}%` },
        );
      }

      const [users, total] = await queryBuilder.getManyAndCount();
      const data = users.map((user: User) => this.mapUserToResponse(user, user.userRoles || []));

      return {
        data,
        metadata: {
          current_page: page,
          total_pages: Math.ceil(total / limit),
          total_items: total,
          items_per_page: limit,
        },
      };
    } catch (error) {
      // If there's an error with relations, fallback to basic user query
      const [users, total] = await this.userRepository.findAndCount({
        skip,
        take: limit,
        order: sort ? { [sort]: order?.toUpperCase() } : undefined,
      });

      const data = users.map((user: User) => this.mapUserToResponse(user, []));

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
  }

  async findOne(id: number): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    let userRoles: UserRole[] = [];
    try {
      userRoles = await this.userRoleRepository.findByUser(id);
    } catch (error) {
      // If there's an error fetching roles, continue with empty roles
    }

    return this.mapUserToResponse(user, userRoles);
  }

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.userRepository.create(createUserDto);
    return this.mapUserToResponse(user, []);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.userRepository.update(id, updateUserDto);
    let userRoles: UserRole[] = [];
    try {
      userRoles = await this.userRoleRepository.findByUser(id);
    } catch (error) {
      // If there's an error fetching roles, continue with empty roles
    }
    return this.mapUserToResponse(user, userRoles);
  }

  async remove(id: number): Promise<void> {
    await this.userRepository.softDelete(id);
  }

  private mapUserToResponse(user: User, userRoles: UserRole[]): UserResponseDto {
    const defaultRole: UserRoleDto = {
      id: 0,
      name: 'No Role',
      permissions: [],
    };

    const role = userRoles?.[0]?.role;
    const userRole: UserRoleDto = role ? {
      id: role.id,
      name: role.name,
      permissions: [],
    } : defaultRole;

    return {
      id: user.id,
      username: user.username || '',
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name || '',
      phone: user.phone_number || '',
      status: user.status ? 'active' : 'inactive',
      role: userRole,
      created_at: user.created_at,
      updated_at: user.updated_at,
      last_login: user.last_login || null,
    };
  }
}