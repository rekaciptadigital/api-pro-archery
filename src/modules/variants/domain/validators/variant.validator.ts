import { Injectable } from '@nestjs/common';
import { VariantRepository } from '../repositories/variant.repository';
import { DomainException } from '@/common/exceptions/domain.exception';
import { HttpStatus } from '@nestjs/common';

@Injectable()
export class VariantValidator {
  constructor(private readonly variantRepository: VariantRepository) {}

  async validateName(name: string): Promise<void> {
    if (!name || name.trim().length === 0) {
      throw new DomainException('Variant name cannot be empty');
    }

    if (name.length > 255) {
      throw new DomainException('Variant name cannot exceed 255 characters');
    }
  }

  async validateValues(values: string[]): Promise<void> {
    if (!values || values.length === 0) {
      throw new DomainException('Variant must have at least one value');
    }

    if (values.some(value => !value || value.trim().length === 0)) {
      throw new DomainException('Variant values cannot be empty');
    }

    if (values.some(value => value.length > 50)) {
      throw new DomainException('Variant values cannot exceed 50 characters');
    }

    const uniqueValues = new Set(values.map(v => v.toLowerCase()));
    if (uniqueValues.size !== values.length) {
      throw new DomainException('Variant values must be unique (case-insensitive)');
    }
  }

  async validateDisplayOrder(displayOrder: number): Promise<void> {
    if (displayOrder < 1) {
      throw new DomainException('Display order must be a positive number');
    }
  }
}