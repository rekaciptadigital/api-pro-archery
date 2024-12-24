import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { DomainException } from '@/common/exceptions/domain.exception';
import { HttpStatus } from '@nestjs/common';

@Injectable()
export class UserValidator {
  constructor(private readonly userRepository: UserRepository) {}

  async validateEmailForUpdate(newEmail: string, userId: number): Promise<void> {
    // Validate email format
    if (!this.isValidEmailFormat(newEmail)) {
      throw new DomainException('Invalid email format', HttpStatus.BAD_REQUEST);
    }

    // Get current user to check if it's the same email
    const currentUser = await this.userRepository.findById(userId);
    if (!currentUser) {
      throw new DomainException('User not found', HttpStatus.NOT_FOUND);
    }

    // If email hasn't changed, allow the update
    if (currentUser.email.toLowerCase() === newEmail.toLowerCase()) {
      return;
    }

    // Check if email exists (including soft-deleted users)
    const existingUser = await this.userRepository.findByEmailIncludingDeleted(newEmail);
    if (existingUser) {
      throw new DomainException(
        'Email is already registered to another user',
        HttpStatus.CONFLICT
      );
    }
  }

  private isValidEmailFormat(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}