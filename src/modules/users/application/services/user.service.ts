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
import { Repository, IsNull } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserWithPermissionsResponse, Role, RoleFeaturePermission as RoleFeaturePermissionInterface } from '../../domain/interfaces/permission-response.interface';
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

  private async getRoleFeaturePermissions(roleId: number): Promise<RoleFeaturePermissionInterface[]> {
    if (!roleId) {
      return [];
    }

    const permissions = await this.permissionRepository.find({
      where: {
        role_id: roleId,
        status: true,
        deleted_at: IsNull()
      },
      relations: ['feature'],
      order: {
        created_at: 'DESC'
      }
    });

    return permissions.map(permission => ({
      id: permission.id,
      role_id: permission.role_id,
      feature_id: permission.feature_id,
      methods: {
        get: permission.methods.get || false,
        post: permission.methods.post || false,
        put: permission.methods.put || false,
        patch: permission.methods.patch || false,
        delete: permission.methods.delete || false
      },
      status: permission.status,
      created_at: permission.created_at,
      updated_at: permission.updated_at,
      deleted_at: permission.deleted_at,
      feature: {
        id: permission.feature.id,
        name: permission.feature.name,
        description: permission.feature.description,
        status: permission.feature.status,
        created_at: permission.feature.created_at,
        updated_at: permission.feature.updated_at,
        deleted_at: permission.feature.deleted_at
      }
    }));
  }

  private transformUserResponse(
    user: UserWithRoles,
    roleFeaturePermissions: RoleFeaturePermissionInterface[]
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
        const activeRole = user.user_roles?.find((ur: UserRole) => ur.role?.status && !ur.deleted_at)?.role;
        const roleFeaturePermissions = activeRole ? await this.getRoleFeaturePermissions(activeRole.id) : [];
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

    const activeRole = user.user_roles?.find((ur: UserRole) => ur.role?.status && !ur.deleted_at)?.role;
    const roleFeaturePermissions = activeRole ? await this.getRoleFeaturePermissions(activeRole.id) : [];
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