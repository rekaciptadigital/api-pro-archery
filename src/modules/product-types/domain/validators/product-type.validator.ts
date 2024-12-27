import { Injectable } from "@nestjs/common";
import { ProductTypeRepository } from "../repositories/product-type.repository";
import { DomainException } from "@/common/exceptions/domain.exception";
import { HttpStatus } from "@nestjs/common";

@Injectable()
export class ProductTypeValidator {
  constructor(private readonly productTypeRepository: ProductTypeRepository) {}

  validateName(name: string): void {
    if (name.length > 255) {
      throw new DomainException(
        "Product type name cannot exceed 255 characters",
        HttpStatus.BAD_REQUEST
      );
    }

    if (!/^[a-zA-Z0-9\s-]+$/.test(name)) {
      throw new DomainException(
        "Product type name can only contain letters, numbers, spaces, and hyphens",
        HttpStatus.BAD_REQUEST
      );
    }
  }

  validateCode(code: string): void {
    if (!this.isValidCodeFormat(code)) {
      throw new DomainException(
        "Invalid code format. Code must be alphanumeric and may contain hyphens.",
        HttpStatus.BAD_REQUEST
      );
    }
  }

  private isValidCodeFormat(code: string): boolean {
    const codeRegex = /^[a-zA-Z0-9-]+$/;
    return codeRegex.test(code);
  }
}
