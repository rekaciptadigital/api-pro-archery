import { Injectable } from '@nestjs/common';
import { TaxRepository } from '../repositories/tax.repository';
import { DomainException } from '@/common/exceptions/domain.exception';
import { HttpStatus } from '@nestjs/common';

@Injectable()
export class TaxValidator {
  constructor(private readonly taxRepository: TaxRepository) {}

  async validateName(name: string): Promise<void> {
    if (!name || name.trim().length === 0) {
      throw new DomainException('Tax name cannot be empty');
    }

    if (name.length > 255) {
      throw new DomainException('Tax name cannot exceed 255 characters');
    }
  }

  async validatePercentage(percentage: number): Promise<void> {
    if (percentage < 0 || percentage > 100) {
      throw new DomainException('Tax percentage must be between 0 and 100');
    }
  }
}