import { Injectable } from '@nestjs/common';
import { ProductTypeRepository } from '../repositories/product-type.repository';
import { DomainException } from '@/common/exceptions/domain.exception';
import { HttpStatus } from '@nestjs/common';

@Injectable()
export class ProductTypeValidator {
  constructor(private readonly productTypeRepository: ProductTypeRepository) {}

  async validateCode(code: string, excludeId?: number): Promise<void> {
    if (!code || code.trim().length === 0) {
      throw new DomainException('Product type code cannot be empty');
    }

    if (!this.isValidCodeFormat(code)) {
      throw new DomainException(
        'Invalid code format. Code must be alphanumeric and may contain hyphens.',
        HttpStatus.BAD_REQUEST
      );
    }

    const existingProductType = await this.productTypeRepository.findByCode(code, excludeId);
    if (existingProductType) {
      throw new DomainException(
        'Product type code already exists',
        HttpStatus.CONFLICT
      );
    }
  }

  async validateName(name: string): Promise<void> {
    if (!name || name.trim().length === 0) {
      throw new DomainException('Product type name cannot be empty');
    }

    if (name.length > 255) {
      throw new DomainException('Product type name cannot exceed 255 characters');
    }
  }

  private isValidCodeFormat(code: string): boolean {
    const codeRegex = /^[a-zA-Z0-9-]+$/;
    return codeRegex.test(code);
  }
}