import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../domain/repositories/user.repository';
import { CreateUserDto, UpdateUserDto } from '../dtos/user.dto';
import { UpdateUserStatusDto } from '../dtos/user-status.dto';
import { UserQueryDto } from '../dtos/user-query.dto';
import { UserValidator } from '../../domain/validators/user.validator';
import { UserQueryBuilder } from '../../domain/builders/user-query.builder';
import { UserSearchCriteria } from '../../domain/value-objects/user-search.value-object';
import { ResponseTransformer } from '../../../../common/transformers/response.transformer';
import { RoleFeaturePermission } from '../../../permissions/domain/entities/role-feature-permission.entity';
import { Repository, In, IsNull } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Feature, Permission, UserWithPermissionsResponse, Role } from '../../domain/interfaces/permission-response.interface';
import { UserWithRoles, UserRole } from '../../domain/interfaces/user-role.interface';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userValidator: UserValidator,
    private readonly responseTransformer: ResponseTransformer,
    @InjectRepository(RoleFeaturePermission)
    private readonly permissionRepository: Repository<RoleFeaturePermission>
  ) {}

  async create(createUserDto: CreateUserDto) {
    await this.userValidator.validateEmail(createUserDto.email);

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = await this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      status: createUserDto.status ?? true,
    });

    return this.responseTransformer.transform(user);
  }

  private async getUserPermissions(roleIds: number[]): Promise<{
    features: Feature[];
    permissions: Permission[];
  }> {
    if (!roleIds.length) {
      return { features: [], permissions: [] };
    }

    const permissions = await this.permissionRepository.find({
      where: {
        role_id: In(roleIds),
        status: true,
        deleted_at: IsNull()
      },
      relations: ['feature', 'role'],
      order: {
        feature: {
          name: 'ASC'
        }
      }
    });

    const uniqueFeatures = new Map<string, Feature>();
    const uniquePermissions = new Map<string, Permission>();

    permissions.forEach(permission => {
      if (permission.feature && permission.feature.status) {
        // Add feature
        uniqueFeatures.set(permission.feature.id.toString(), {
          id: permission.feature.id.toString(),
          name: permission.feature.name
        });

        // Add permissions based on methods
        Object.entries(permission.methods).forEach(([method, enabled]) => {
          if (enabled) {
            const permissionCode = `${permission.feature.name.toLowerCase()}.${method}`;
            uniquePermissions.set(permissionCode, {
              id: permission.id.toString(),
              name: `${permission.feature.name} ${method.toUpperCase()}`,
              code: permissionCode
            });
          }
        });
      }
    });

    return {
      features: Array.from(uniqueFeatures.values()),
      permissions: Array.from(uniquePermissions.values())
    };
  }

  private transformUserResponse(
    user: UserWithRoles,
    roleFeaturePermissions: { features: Feature[]; permissions: Permission[] }
  ): UserWithPermissionsResponse {
    const activeRole = user.user_roles?.find((ur: UserRole) => ur.role?.status && !ur.deleted_at)?.role || null;
    const role: Role | null = activeRole ? {
      id: activeRole.id,
      name: activeRole.name,
      description: activeRole.description,
      status: activeRole.status
    } : null;

    return {
      id: user.id,
      nip: user.nip,
      nik: user.nik,
      first_name: user.first_name,
      last_name: user.last_name,
      photo_profile: user.photo_profile,
      email: user.email,
      phone_number: user.phone_number,
      address: user.address,
      status: user.status,
      role,
      role_feature_permissions: roleFeaturePermissions,
      created_at: user.created_at,
      updated_at: user.updated_at
    };
  }

  async findAll(query: UserQueryDto) {
    const searchCriteria = UserSearchCriteria.create({
      firstName: query.firstName,
      lastName: query.lastName,
      email: query.email,
      page: query.page,
      limit: query.limit,
      sort: query.sort,
      order: query.order,
    });

    const queryBuilder = UserQueryBuilder.create(
      this.userRepository.getRepository(),
      'user'
    )
      .applySearchCriteria(searchCriteria)
      .applyPagination(searchCriteria.page, searchCriteria.limit)
      .applySorting(searchCriteria.sort, searchCriteria.order)
      .build();

    const [users, total] = await queryBuilder.getManyAndCount();

    const enrichedUsers = await Promise.all(
      users.map(async (user: UserWithRoles) => {
        const roleIds = user.user_roles?.filter((ur: UserRole) => ur.role?.status && !ur.deleted_at)
                                      .map(ur => ur.role.id) || [];
        const roleFeaturePermissions = await this.getUserPermissions(roleIds);
        return this.transformUserResponse(user, roleFeaturePermissions);
      })
    );

    return this.responseTransformer.transformPaginated(
      enrichedUsers,
      total,
      searchCriteria.page,
      searchCriteria.limit,
      {
        first: this.buildPageUrl(query, 1),
        previous: searchCriteria.page > 1 ? this.buildPageUrl(query, searchCriteria.page - 1) : null,
        current: this.buildPageUrl(query, searchCriteria.page),
        next: searchCriteria.page * searchCriteria.limit < total ? 
              this.buildPageUrl(query, searchCriteria.page + 1) : null,
        last: this.buildPageUrl(query, Math.ceil(total / searchCriteria.limit))
      }
    );
  }

  async findOne(id: number) {
    const queryBuilder = UserQueryBuilder.create(
      this.userRepository.getRepository(),
      'user'
    )
      .build()
      .andWhere('user.id = :id', { id });

    const user = await queryBuilder.getOne() as UserWithRoles;
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const roleIds = user.user_roles?.filter((ur: UserRole) => ur.role?.status && !ur.deleted_at)
                                  .map(ur => ur.role.id) || [];
    const roleFeaturePermissions = await this.getUserPermissions(roleIds);
    const transformedUser = this.transformUserResponse(user, roleFeaturePermissions);

    return this.responseTransformer.transform(transformedUser);
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateUserDto.email) {
      await this.userValidator.validateEmail(updateUserDto.email, id);
    }

    const updated = await this.userRepository.update(id, updateUserDto);
    return this.responseTransformer.transform(updated);
  }

  async updateStatus(id: number, updateStatusDto: UpdateUserStatusDto) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.userRepository.update(id, updateStatusDto);
    return this.responseTransformer.transform({ message: 'User status updated successfully' });
  }

  async remove(id: number) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.userRepository.softDelete(id);
    return this.responseTransformer.transformDelete('User');
  }

  private buildPageUrl(query: UserQueryDto, page: number): string {
    const baseUrl = process.env.APP_URL || 'http://localhost:4000';
    const url = new URL(`${baseUrl}/users`);
    
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && key !== 'page') {
        url.searchParams.set(key, value.toString());
      }
    });
    
    url.searchParams.set('page', page.toString());
    return url.toString();
  }
}