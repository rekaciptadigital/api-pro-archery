import { Injectable } from '@nestjs/common';
import { ProductCategoryRepository } from '../repositories/product-category.repository';
import { DomainException } from '@/common/exceptions/domain.exception';
import { HttpStatus } from '@nestjs/common';

@Injectable()
export class ProductCategoryValidator {
  constructor(
    private readonly productCategoryRepository: ProductCategoryRepository
  ) {}

  async validateName(name: string): Promise<void> {
    if (!name || name.trim().length === 0) {
      throw new DomainException('Category name cannot be empty');
    }

    if (name.length > 255) {
      throw new DomainException('Category name cannot exceed 255 characters');
    }
  }

  async validateCode(code: string): Promise<void> {
    if (!code || code.trim().length === 0) {
      throw new DomainException('Category code cannot be empty');
    }

    if (!this.isValidCodeFormat(code)) {
      throw new DomainException(
        'Invalid code format. Code must be alphanumeric and may contain hyphens.',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async validateParentId(parentId: number | null | undefined): Promise<void> {
    if (!parentId) return;

    const parent = await this.productCategoryRepository.findById(parentId);
    if (!parent) {
      throw new DomainException('Parent category not found', HttpStatus.NOT_FOUND);
    }

    if (!parent.status) {
      throw new DomainException(
        'Cannot assign to inactive parent category',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  private isValidCodeFormat(code: string): boolean {
    const codeRegex = /^[a-zA-Z0-9-]+$/;
    return codeRegex.test(code);
  }
}