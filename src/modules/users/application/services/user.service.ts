import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { UserRepository } from '../../domain/repositories/user.repository';
import { CreateUserDto, UpdateUserDto } from '../dtos/user.dto';
import { UserQueryDto } from '../dtos/user-query.dto';
import { UserMapper } from '../mappers/user.mapper';
import { UserSearchCriteria } from '../../domain/value-objects/user-search.value-object';
import { IUserWithRole, IPaginatedUsers } from '../../domain/interfaces/user.interface';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
  ) {}

  async findAll(query: UserQueryDto): Promise<IPaginatedUsers> {
    const searchCriteria = UserSearchCriteria.create(query);
    const skip = (searchCriteria.page - 1) * searchCriteria.limit;

    const queryBuilder = this.userRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.user_roles', 'user_roles')
      .leftJoinAndSelect('user_roles.role', 'role')
      .where('user.deleted_at IS NULL')
      .skip(skip)
      .take(searchCriteria.limit);

    if (searchCriteria.sort) {
      queryBuilder.orderBy(`user.${searchCriteria.sort}`, searchCriteria.order.toUpperCase() as 'ASC' | 'DESC');
    }

    if (searchCriteria.search) {
      queryBuilder.andWhere(
        '(user.first_name ILIKE :search OR user.email ILIKE :search OR user.nip ILIKE :search OR user.nik ILIKE :search)',
        { search: `%${searchCriteria.search}%` },
      );
    }

    const [users, total] = await queryBuilder.getManyAndCount();

    return {
      data: users.map(user => UserMapper.toResponse(user)),
      metadata: {
        current_page: searchCriteria.page,
        total_pages: Math.ceil(total / searchCriteria.limit),
        total_items: total,
        items_per_page: searchCriteria.limit,
      },
    };
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