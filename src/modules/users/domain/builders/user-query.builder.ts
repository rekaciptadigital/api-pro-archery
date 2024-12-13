import { SelectQueryBuilder, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserSearchCriteria } from '../value-objects/user-search.value-object';

export class UserQueryBuilder {
  private constructor(private readonly queryBuilder: SelectQueryBuilder<User>) {}

  static create(repository: Repository<User>, alias: string): UserQueryBuilder {
    const queryBuilder = repository
      .createQueryBuilder(alias)
      .leftJoinAndSelect(`${alias}.user_roles`, 'user_roles', 'user_roles.deleted_at IS NULL')
      .leftJoinAndSelect('user_roles.role', 'role', 'role.deleted_at IS NULL AND role.status = true')
      .where(`${alias}.deleted_at IS NULL`);

    return new UserQueryBuilder(queryBuilder);
  }

  build(): SelectQueryBuilder<User> {
    return this.queryBuilder;
  }

  applySearchCriteria(criteria: UserSearchCriteria): this {
    // Implementation for applying search criteria
    return this;
  }

  applyPagination(page: number, limit: number): this {
    // Implementation for applying pagination
    return this;
  }

  applySorting(sort: string, order: 'ASC' | 'DESC'): this {
    // Implementation for applying sorting
    return this;
  }
}