import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { UserRepository } from '../../domain/repositories/user.repository';
import { CreateUserDto, UpdateUserDto } from '../dtos/user.dto';
import { PaginationQueryDto } from '../../../../common/pagination/dto/pagination-query.dto';
import { PaginationHelper } from '../../../../common/pagination/helpers/pagination.helper';
import { UserMapper } from '../mappers/user.mapper';
import { IUserWithRole } from '../../domain/interfaces/user.interface';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly paginationHelper: PaginationHelper,
  ) {}

  async findAll(query: PaginationQueryDto) {
    const { skip, take } = this.paginationHelper.getSkipTake(query.page, query.limit);

    const queryBuilder = this.userRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.user_roles', 'user_roles')
      .leftJoinAndSelect('user_roles.role', 'role')
      .where('user.deleted_at IS NULL')
      .skip(skip)
      .take(take);

    const [users, total] = await queryBuilder.getManyAndCount();
    const mappedUsers = users.map(user => UserMapper.toResponse(user));

    return this.paginationHelper.paginate(mappedUsers, {
      serviceName: 'users',
      totalItems: total,
      page: query.page,
      limit: query.limit,
    });
  }

  async findOne(id: number): Promise<IUserWithRole> {
    const user = await this.userRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.user_roles', 'user_roles')
      .leftJoinAndSelect('user_roles.role', 'role')
      .where('user.id = :id', { id })
      .andWhere('user.deleted_at IS NULL')
      .getOne();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return UserMapper.toResponse(user);
  }

  async create(createUserDto: CreateUserDto): Promise<IUserWithRole> {
    const existingUser = await this.userRepository.findByEmail(createUserDto.email);

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    
    const user = await this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      status: createUserDto.status ?? true
    });

    return UserMapper.toResponse(user);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<IUserWithRole> {
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

    const updatedUser = await this.userRepository.update(id, updateUserDto);
    return UserMapper.toResponse(updatedUser);
  }

  async remove(id: number): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.userRepository.softDelete(id);
  }
}