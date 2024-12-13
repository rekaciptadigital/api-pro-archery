import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../domain/repositories/user.repository';
import { ResponseTransformer } from '../../../../common/transformers/response.transformer';
import { UserQueryBuilder } from '../../domain/builders/user-query.builder';
import { UserSearchCriteria } from '../../domain/value-objects/user-search.value-object';
import { UserQueryDto } from '../dtos/user-query.dto';
import { CreateUserDto, UpdateUserDto } from '../dtos/user.dto';
import { UpdateUserStatusDto } from '../dtos/user-status.dto';
import { UserWithRoles, UserRole } from '../../domain/interfaces/user-role.interface';
import { RoleFeaturePermission } from '../../../permissions/domain/entities/role-feature-permission.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiResponse } from '../../../../common/interfaces/api-response.interface';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly responseTransformer: ResponseTransformer,
    @InjectRepository(RoleFeaturePermission)
    private readonly permissionRepository: Repository<RoleFeaturePermission>
  ) {}

  async findAll(query: UserQueryDto) {
    const searchCriteria = UserSearchCriteria.create(query);
    const queryBuilder = UserQueryBuilder.create(
      this.userRepository.getRepository(),
      'user'
    )
      .applySearchCriteria(searchCriteria)
      .applyPagination(searchCriteria.page, searchCriteria.limit)
      .applySorting(searchCriteria.sort, searchCriteria.order)
      .build();

    const [users, total] = await queryBuilder.getManyAndCount();
    const enrichedUsers = await this.enrichUsersWithPermissions(users);

    return this.responseTransformer.transformPaginated(
      enrichedUsers,
      total,
      searchCriteria.page,
      searchCriteria.limit,
      this.generatePaginationLinks(query, searchCriteria, total)
    );
  }

  async findOne(id: number) {
    const user = await this.findUserById(id);
    const enrichedUser = await this.enrichUserWithPermissions(user);
    return this.responseTransformer.transform(enrichedUser, false);
  }

  async create(createUserDto: CreateUserDto) {
    const user = await this.userRepository.create(createUserDto);
    return this.responseTransformer.transform(user, false);
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findUserById(id);
    const updated = await this.userRepository.update(id, updateUserDto);
    return this.responseTransformer.transform(updated, false);
  }

  async updateStatus(id: number, updateStatusDto: UpdateUserStatusDto) {
    const user = await this.findUserById(id);
    await this.userRepository.update(id, updateStatusDto);
    return this.responseTransformer.transform({ message: 'User status updated successfully' }, false);
  }

  async remove(id: number) {
    const user = await this.findUserById(id);
    await this.userRepository.softDelete(id);
    return this.responseTransformer.transform({ message: 'User deleted successfully' }, false);
  }

  private async findUserById(id: number): Promise<UserWithRoles> {
    const user = await this.userRepository.findOneWithOptions({
      where: { id },
      relations: ['user_roles', 'user_roles.role']
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user as UserWithRoles;
  }

  // Helper methods implementation...
  private async enrichUsersWithPermissions(users: UserWithRoles[]) {
    // Implementation
    return users;
  }

  private async enrichUserWithPermissions(user: UserWithRoles) {
    // Implementation
    return user;
  }

  private generatePaginationLinks(query: UserQueryDto, criteria: UserSearchCriteria, total: number) {
    // Implementation
    return {
      first: '',
      previous: null,
      current: '',
      next: null,
      last: ''
    };
  }
}