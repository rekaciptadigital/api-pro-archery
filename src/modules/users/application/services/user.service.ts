import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { UserRepository } from '../../domain/repositories/user.repository';
import { CreateUserDto, UpdateUserDto } from '../dtos/user.dto';
import { PaginationQueryDto } from '../../../../common/pagination/dto/pagination-query.dto';
import { PaginationHelper } from '../../../../common/pagination/helpers/pagination.helper';
import { ResponseTransformer } from '../../../../common/transformers/response.transformer';
import { FindOptionsWhere, IsNull } from 'typeorm';
import { User } from '../../domain/entities/user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly paginationHelper: PaginationHelper,
    private readonly responseTransformer: ResponseTransformer,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.userRepository.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = await this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      status: createUserDto.status ?? true,
    });

    return this.responseTransformer.transform(user);
  }

  async findAll(query: PaginationQueryDto) {
    const { skip, take } = this.paginationHelper.getSkipTake(query.page, query.limit);
    const [users, total] = await this.userRepository.findAndCount({
      where: { deleted_at: IsNull() } as FindOptionsWhere<User>,
      relations: ['user_roles', 'user_roles.role'],
      skip,
      take,
      order: { created_at: 'DESC' },
    });

    const paginationData = this.paginationHelper.generatePaginationData({
      serviceName: 'users',
      totalItems: total,
      page: query.page,
      limit: query.limit,
    });

    return this.responseTransformer.transformPaginated(
      users,
      total,
      query.page || 1,
      query.limit || 10,
      paginationData.links
    );
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOneWithOptions({
      where: { id, deleted_at: IsNull() } as FindOptionsWhere<User>,
      relations: ['user_roles', 'user_roles.role'],
    });

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
      const existingUser = await this.userRepository.findByEmail(updateUserDto.email);
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Email already exists');
      }
    }

    await this.userRepository.update(id, updateUserDto);
    return this.responseTransformer.transform({ message: 'User updated successfully' });
  }

  async remove(id: number) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.userRepository.softDelete(id);
    return this.responseTransformer.transformDelete('User');
  }
}