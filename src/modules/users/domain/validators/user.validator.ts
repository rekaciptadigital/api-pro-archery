import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { DomainException } from '../../../common/exceptions/domain.exception';
import { HttpStatus } from '@nestjs/common';

@Injectable()
export class UserValidator {
  constructor(private readonly userRepository: UserRepository) {}

  async validateEmail(email: string, userId?: number): Promise<void> {
    if (!this.isValidEmailFormat(email)) {
      throw new DomainException('Invalid email format', HttpStatus.BAD_REQUEST);
    }

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser && existingUser.id !== userId) {
      throw new DomainException(
        'Email is already in use by another user',
        HttpStatus.CONFLICT
      );
    }
  }

  private isValidEmailFormat(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}