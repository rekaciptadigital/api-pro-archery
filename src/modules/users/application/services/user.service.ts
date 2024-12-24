import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../domain/repositories/user.repository';
import { CreateUserDto, UpdateUserDto } from '../dtos/user.dto';
import { UpdateUserStatusDto } from '../dtos/user-status.dto';
import { UserListQueryDto } from '../dtos/user-list.dto';
import { UserValidator } from '../../domain/validators/user.validator';
import { ResponseTransformer } from '@/common/transformers/response.transformer';
import { PaginationHelper } from '@/common/pagination/helpers/pagination.helper';
import { PasswordService } from '@/modules/auth/application/services/password.service';
import { DomainException } from '@/common/exceptions/domain.exception';
import { HttpStatus } from '@nestjs/common';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userValidator: UserValidator,
    private readonly responseTransformer: ResponseTransformer,
    private readonly paginationHelper: PaginationHelper,
    private readonly passwordService: PasswordService
  ) {}

  async create(createUserDto: CreateUserDto) {
    // Validate email
    const existingUser = await this.userRepository.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new DomainException('Email already exists', HttpStatus.CONFLICT);
    }

    // Hash password
    const hashedPassword = await this.passwordService.hashPassword(createUserDto.password);

    // Create user
    const user = await this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      status: createUserDto.status ?? true
    });

    // Return response without password
    return this.responseTransformer.transform({
      ...user,
      password: undefined
    });
  }

  async findAll(query: UserListQueryDto) {
    const { skip, take } = this.paginationHelper.getSkipTake(query.page, query.limit);
    
    const [users, total] = await this.userRepository.findUsers(
      skip,
      take,
      query.sort,
      query.order,
      query.search
    );

    const paginationData = this.paginationHelper.generatePaginationData({
      serviceName: 'users',
      totalItems: total,
      page: query.page,
      limit: query.limit,
      customParams: query.toCustomParams()
    });

    return this.responseTransformer.transformPaginated(
      users.map(user => ({ ...user, password: undefined })),
      total,
      query.page || 1,
      query.limit || 10,
      paginationData.links
    );
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOneWithOptions({
      where: { id },
      relations: ['user_roles', 'user_roles.role']
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.responseTransformer.transform({
      ...user,
      password: undefined
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateUserDto.email) {
      await this.userValidator.validateEmailForUpdate(updateUserDto.email, id);
    }

    if (updateUserDto.password) {
      updateUserDto.password = await this.passwordService.hashPassword(updateUserDto.password);
    }

    const updated = await this.userRepository.update(id, updateUserDto);
    return this.responseTransformer.transform({
      ...updated,
      password: undefined
    });
  }

  async updateStatus(id: number, updateStatusDto: UpdateUserStatusDto) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository.update(id, updateStatusDto);
    return this.responseTransformer.transform({
      message: 'User status updated successfully'
    });
  }

  async remove(id: number) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository.softDelete(id);
    return this.responseTransformer.transform({
      message: 'User deleted successfully'
    });
  }

  async restore(id: number) {
    const user = await this.userRepository.findWithDeleted(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.deleted_at) {
      throw new DomainException('User is not deleted', HttpStatus.BAD_REQUEST);
    }

    const restored = await this.userRepository.restore(id);
    if (!restored) {
      throw new DomainException('Failed to restore user', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return this.responseTransformer.transform({
      ...restored,
      password: undefined
    });
  }
}