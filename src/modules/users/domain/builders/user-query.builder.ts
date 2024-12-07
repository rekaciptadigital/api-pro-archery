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

  applySearchCriteria(criteria: UserSearchCriteria): this {
    const { firstName, lastName, email } = criteria;
    const alias = this.queryBuilder.alias;

    if (firstName) {
      this.queryBuilder.andWhere(`LOWER(${alias}.first_name) LIKE LOWER(:firstName)`, {
        firstName: `%${firstName}%`
      });
    }

    if (lastName) {
      this.queryBuilder.andWhere(`LOWER(${alias}.last_name) LIKE LOWER(:lastName)`, {
        lastName: `%${lastName}%`
      });
    }

    if (email) {
      this.queryBuilder.andWhere(`LOWER(${alias}.email) LIKE LOWER(:email)`, {
        email: `%${email}%`
      });
    }

    return this;
  }

  applyPagination(page: number, limit: number): this {
    const skip = (page - 1) * limit;
    this.queryBuilder
      .skip(skip)
      .take(limit);

    return this;
  }

  applySorting(sort: string, order: 'ASC' | 'DESC'): this {
    const alias = this.queryBuilder.alias;
    this.queryBuilder.orderBy(`${alias}.${sort}`, order);
    return this;
  }

  build(): SelectQueryBuilder<User> {
    return this.queryBuilder;
  }
}