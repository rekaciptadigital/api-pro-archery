import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../domain/repositories/user.repository';
import { ResponseTransformer } from '../../../../common/transformers/response.transformer';
import { CreateUserDto, UpdateUserDto } from '../dtos/user.dto';
import { UpdateUserStatusDto } from '../dtos/user-status.dto';
import { PaginationQueryDto } from '../../../../common/pagination/dto/pagination-query.dto';
import { PaginationHelper } from '../../../../common/pagination/helpers/pagination.helper';
import { PasswordService } from '../../../auth/application/services/password.service';
import { IsNull } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly responseTransformer: ResponseTransformer,
    private readonly paginationHelper: PaginationHelper,
    private readonly passwordService: PasswordService
  ) {}

  private excludePasswordField<T extends Record<string, any>>(data: T): Omit<T, 'password'> {
    const { password, ...rest } = data;
    return rest;
  }

  async findAll(query: PaginationQueryDto) {
    const { skip, take } = this.paginationHelper.getSkipTake(query.page, query.limit);

    const [users, total] = await this.userRepository.findAndCount({
      where: { deleted_at: IsNull() },
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

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await this.passwordService.hashPassword(createUserDto.password);
    
    const user = await this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      status: createUserDto.status ?? true
    });

    return this.responseTransformer.transform(this.excludePasswordField(user));
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
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
}