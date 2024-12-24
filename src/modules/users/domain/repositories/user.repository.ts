import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not, ILike } from 'typeorm';
import { User } from '../entities/user.entity';
import { BaseRepository } from '@/common/repositories/base.repository';
import { UserSortField, SortOrder } from '../../application/dtos/user-list.dto';

@Injectable()
export class UserRepository extends BaseRepository<User> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {
    super(userRepository);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { 
        email,
        deleted_at: IsNull()
      }
    });
  }

  async findByEmailIncludingDeleted(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      withDeleted: true
    });
  }

  async findUsers(
    skip: number,
    take: number,
    sort: UserSortField = UserSortField.CREATED_AT,
    order: SortOrder = SortOrder.DESC,
    search?: string
  ): Promise<[User[], number]> {
    const query = this.userRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.user_roles', 'user_roles')
      .leftJoinAndSelect('user_roles.role', 'role')
      .where('user.deleted_at IS NULL');

    if (search) {
      query.andWhere(
        '(LOWER(user.first_name) LIKE LOWER(:search) OR ' +
        'LOWER(user.last_name) LIKE LOWER(:search) OR ' +
        'LOWER(user.email) LIKE LOWER(:search))',
        { search: `%${search}%` }
      );
    }

    query.orderBy(`user.${sort}`, order)
      .skip(skip)
      .take(take);

    return query.getManyAndCount();
  }

  async findWithDeleted(id: number): Promise<User | null> {
    return this.repository.findOne({
      where: { id } as any,
      withDeleted: true
    });
  }

  async restore(id: number): Promise<User | null> {
    await this.repository.restore(id);
    return this.findById(id);
  }
}