import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../domain/repositories/user.repository';
import { CreateUserDto, UpdateUserDto } from '../dtos/user.dto';
import { UpdateUserStatusDto } from '../dtos/user-status.dto';
import { UserQueryDto } from '../dtos/user-query.dto';
import { UserValidator } from '../../domain/validators/user.validator';
import { UserQueryBuilder } from '../../domain/builders/user-query.builder';
import { UserSearchCriteria } from '../../domain/value-objects/user-search.value-object';
import { ResponseTransformer } from '../../../../common/transformers/response.transformer';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userValidator: UserValidator,
    private readonly responseTransformer: ResponseTransformer,
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

    return this.responseTransformer.transformPaginated(
      users,
      total,
      searchCriteria.page,
      searchCriteria.limit,
      {
        first: this.buildPageUrl(query, 1),
        previous: searchCriteria.page > 1 ? this.buildPageUrl(query, searchCriteria.page - 1) : null,
        current: this.buildPageUrl(query, searchCriteria.page),
        next: searchCriteria.page * searchCriteria.limit < total ? this.buildPageUrl(query, searchCriteria.page + 1) : null,
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

    const user = await queryBuilder.getOne();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.responseTransformer.transform(user);
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

    const updated = await this.userRepository.update(id, updateStatusDto);
    return this.responseTransformer.transform(updated);
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