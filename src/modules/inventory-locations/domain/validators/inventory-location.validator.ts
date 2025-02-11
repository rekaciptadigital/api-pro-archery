import { Injectable } from "@nestjs/common";
import { InventoryLocationRepository } from "../repositories/inventory-location.repository";
import { DomainException } from "@/common/exceptions/domain.exception";
import { HttpStatus } from "@nestjs/common";

@Injectable()
export class InventoryLocationValidator {
  constructor(
    private readonly inventoryLocationRepository: InventoryLocationRepository
  ) {}

  async validateCode(code: string): Promise<void> {
    if (!code || code.trim().length === 0) {
      throw new DomainException("Location code cannot be empty");
    }

    if (code.length > 20) {
      throw new DomainException("Location code cannot exceed 20 characters");
    }

    if (!this.isValidCodeFormat(code)) {
      throw new DomainException(
        "Invalid code format. Code must be alphanumeric and may contain hyphens.",
        HttpStatus.BAD_REQUEST
      );
    }

    const existingLocation =
      await this.inventoryLocationRepository.findByCode(code);
    if (existingLocation) {
      throw new DomainException(
        "Location code already exists",
        HttpStatus.CONFLICT
      );
    }
  }

  async validateCodeForUpdate(code: string, id: number): Promise<void> {
    if (!code || code.trim().length === 0) {
      throw new DomainException("Location code cannot be empty");
    }

    if (code.length > 20) {
      throw new DomainException("Location code cannot exceed 20 characters");
    }

    if (!this.isValidCodeFormat(code)) {
      throw new DomainException(
        "Invalid code format. Code must be alphanumeric and may contain hyphens.",
        HttpStatus.BAD_REQUEST
      );
    }

    const existingLocation =
      await this.inventoryLocationRepository.findByCode(code);
    if (existingLocation && existingLocation.id !== id) {
      throw new DomainException(
        "Location code already exists",
        HttpStatus.CONFLICT
      );
    }
  }

  async validateName(name: string): Promise<void> {
    if (!name || name.trim().length === 0) {
      throw new DomainException("Location name cannot be empty");
    }

    if (name.length > 255) {
      throw new DomainException("Location name cannot exceed 255 characters");
    }
  }

  async validateType(type: string): Promise<void> {
    if (!type || type.trim().length === 0) {
      throw new DomainException("Location type cannot be empty");
    }

    if (type.length > 50) {
      throw new DomainException("Location type cannot exceed 50 characters");
    }

    const validTypes = [
      "Warehouse",
      "Store",
      "Affiliate Store",
      "Booth",
      "Other",
    ];
    if (!validTypes.includes(type)) {
      throw new DomainException(
        "Invalid location type. Must be either Warehouse, Store, Booth, Affiliate Store, Other only",
        HttpStatus.BAD_REQUEST
      );
    }
  }

  private isValidCodeFormat(code: string): boolean {
    const codeRegex = /^[a-zA-Z0-9-]+$/;
    return codeRegex.test(code);
  }
}
