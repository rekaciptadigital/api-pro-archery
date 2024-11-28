import { Injectable } from '@nestjs/common';
import { DomainException } from '../../../common/exceptions/domain.exception';
import { UserRepository } from '../../domain/repositories/user.repository';
import { CreateUserDto, UpdateUserDto } from '../dtos/user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.userRepository.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new DomainException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = await this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    const { password, ...result } = user;
    return result;
  }

  async findAll() {
    const users = await this.userRepository.findAll();
    return users.map(user => {
      const { password, ...result } = user;
      return result;
    });
  }

  async findOne(id: number) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new DomainException('User not found');
    }

    const { password, ...result } = user;
    return result;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new DomainException('User not found');
    }

    const updatedUser = await this.userRepository.update(id, updateUserDto);
    const { password, ...result } = updatedUser;
    return result;
  }

  async remove(id: number) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new DomainException('User not found');
    }

    await this.userRepository.softDelete(id);
  }
}