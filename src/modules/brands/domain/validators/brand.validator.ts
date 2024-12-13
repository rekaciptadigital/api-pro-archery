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
}