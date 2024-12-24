import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../domain/repositories/user.repository';
import { ResponseTransformer } from '../../../../common/transformers/response.transformer';
import { CreateUserDto, UpdateUserDto } from '../dtos/user.dto';
import { UpdateUserStatusDto } from '../dtos/user-status.dto';
import { PaginationQueryDto } from '../../../../common/pagination/dto/pagination-query.dto';
import { PaginationHelper } from '../../../../common/pagination/helpers/pagination.helper';
import { PasswordService } from '../../../auth/application/services/password.service';
import { DomainException } from '@/common/exceptions/domain.exception';
import { HttpStatus } from '@nestjs/common';
import { UserValidator } from '../../domain/validators/user.validator';
import { DataSource } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly responseTransformer: ResponseTransformer,
    private readonly paginationHelper: PaginationHelper,
    private readonly passwordService: PasswordService,
    private readonly userValidator: UserValidator,
    private readonly dataSource: DataSource
  ) {}

  private excludePasswordField<T extends Record<string, any>>(data: T): Omit<T, 'password'> {
    const { password, ...rest } = data;
    return rest;
  }

  async create(createUserDto: CreateUserDto) {
    const { existingUser, isDeleted } = await this.userValidator.validateEmailForCreation(
      createUserDto.email
    );

    // Start transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let user;
      const hashedPassword = await this.passwordService.hashPassword(createUserDto.password);

      if (existingUser && isDeleted) {
        // Restore and update the soft-deleted user
        await this.userRepository.restore(existingUser.id);
        user = await this.userRepository.update(existingUser.id, {
          ...createUserDto,
          password: hashedPassword,
          status: createUserDto.status ?? true
        });
      } else if (existingUser) {
        throw new DomainException(
          'Email is already registered',
          HttpStatus.CONFLICT
        );
      } else {
        // Create new user
        user = await this.userRepository.create({
          ...createUserDto,
          password: hashedPassword,
          status: createUserDto.status ?? true
        });
      }

      await queryRunner.commitTransaction();
      return this.responseTransformer.transform(this.excludePasswordField(user));
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(query: PaginationQueryDto) {
    const { skip, take } = this.paginationHelper.getSkipTake(query.page, query.limit);

    const [users, total] = await this.userRepository.findAndCount({
      relations: ['user_roles', 'user_roles.role'],
      skip,
      take,
      order: { created_at: 'DESC' }
    });

    const usersWithoutPassword = users.map(user => this.excludePasswordField(user));

    const paginationData = this.paginationHelper.generatePaginationData({
      serviceName: 'users',
      totalItems: total,
      page: query.page,
      limit: query.limit,
      customParams: {
        page: query.page?.toString() || '1',
        limit: query.limit?.toString() || '10'
      }
    });

    return this.responseTransformer.transformPaginated(
      usersWithoutPassword,
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

    return this.responseTransformer.transform(this.excludePasswordField(user));
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validate email if it's being updated
    if (updateUserDto.email) {
      await this.userValidator.validateEmailForUpdate(updateUserDto.email, id);
    }

    const dataToUpdate = { ...updateUserDto };

    if (updateUserDto.password) {
      dataToUpdate.password = await this.passwordService.hashPassword(updateUserDto.password);
    }

    const updated = await this.userRepository.update(id, dataToUpdate);
    return this.responseTransformer.transform(this.excludePasswordField(updated));
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
    return this.responseTransformer.transform({ message: 'User deleted successfully' });
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

    return this.responseTransformer.transform(this.excludePasswordField(restored));
  }
}