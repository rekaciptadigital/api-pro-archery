import { Injectable } from '@nestjs/common';
import { BrandRepository } from '../repositories/brand.repository';
import { DomainException } from '@/common/exceptions/domain.exception';
import { HttpStatus } from '@nestjs/common';

@Injectable()
export class BrandValidator {
  constructor(private readonly brandRepository: BrandRepository) {}

  async validateCode(code: string, excludeId?: number): Promise<void> {
    if (!code || code.trim().length === 0) {
      throw new DomainException('Brand code cannot be empty');
    }

    if (!this.isValidCodeFormat(code)) {
      throw new DomainException(
        'Invalid code format. Code must be alphanumeric and may contain hyphens.',
        HttpStatus.BAD_REQUEST
      );
    }

    const existingBrand = await this.brandRepository.findByCode(code, excludeId);
    if (existingBrand) {
      throw new DomainException(
        'Brand code already exists',
        HttpStatus.CONFLICT
      );
    }
  }

  async validateName(name: string): Promise<void> {
    if (!name || name.trim().length === 0) {
      throw new DomainException('Brand name cannot be empty');
    }
  }

  private isValidCodeFormat(code: string): boolean {
    const codeRegex = /^[a-zA-Z0-9-]+$/;
    return codeRegex.test(code);
  }
}