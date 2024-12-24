import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { DomainException } from '../../../common/exceptions/domain.exception';
import { HttpStatus } from '@nestjs/common';

@Injectable()
export class UserValidator {
  constructor(private readonly userRepository: UserRepository) {}

  async validateEmailForUpdate(email: string, userId: number): Promise<void> {
    // Validate email format
    if (!this.isValidEmailFormat(email)) {
      throw new DomainException('Invalid email format', HttpStatus.BAD_REQUEST);
    }

    // Check if email exists for another user (including deleted)
    const existingUser = await this.userRepository.findByEmailIncludingDeleted(email);
    
    if (existingUser) {
      // If email belongs to another user
      if (existingUser.id !== userId) {
        throw new DomainException(
          'Email is already registered to another user',
          HttpStatus.CONFLICT
        );
      }
      
      // If email belongs to same user but account is deleted
      if (existingUser.deleted_at) {
        throw new DomainException(
          'Cannot update to this email as it belongs to a deleted account',
          HttpStatus.CONFLICT
        );
      }
    }
  }

  async validateEmailForCreation(email: string): Promise<{ existingUser: any | null, isDeleted: boolean }> {
    if (!this.isValidEmailFormat(email)) {
      throw new DomainException('Invalid email format', HttpStatus.BAD_REQUEST);
    }

    const existingUser = await this.userRepository.findByEmailIncludingDeleted(email);
    if (!existingUser) {
      return { existingUser: null, isDeleted: false };
    }

    return {
      existingUser,
      isDeleted: !!existingUser.deleted_at
    };
  }

  private isValidEmailFormat(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}