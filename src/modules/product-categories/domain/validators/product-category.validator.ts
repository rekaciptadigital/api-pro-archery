import { Injectable } from "@nestjs/common";
import { ProductCategoryRepository } from "../repositories/product-category.repository";
import { DomainException } from "@/common/exceptions/domain.exception";
import { HttpStatus } from "@nestjs/common";

@Injectable()
export class ProductCategoryValidator {
  constructor(
    private readonly productCategoryRepository: ProductCategoryRepository
  ) {}

  async validateName(name: string): Promise<void> {
    if (!name || name.trim().length === 0) {
      throw new DomainException("Category name cannot be empty");
    }

    if (name.length > 255) {
      throw new DomainException("Category name cannot exceed 255 characters");
    }
  }

  private async validateCode(code: string): Promise<void> {
    if (!code || code.trim().length === 0) {
      throw new DomainException("Category code cannot be empty");
    }

    if (!this.isValidCodeFormat(code)) {
      throw new DomainException(
        "Invalid code format. Code must be alphanumeric and may contain hyphens.",
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async validateParentId(parentId: number | null | undefined): Promise<void> {
    if (!parentId) return;

    const parent = await this.productCategoryRepository.findById(parentId);
    if (!parent) {
      throw new DomainException(
        "Parent category not found",
        HttpStatus.NOT_FOUND
      );
    }

    if (!parent.status) {
      throw new DomainException(
        "Cannot assign to inactive parent category",
        HttpStatus.BAD_REQUEST
      );
    }

    // Check hierarchy depth
    const depth = await this.getHierarchyDepth(parentId);
    if (depth >= 5) {
      // 4 because current category will be the 5th level
      throw new DomainException(
        "Maximum category depth of 5 levels reached",
        HttpStatus.BAD_REQUEST
      );
    }
  }

  private async getHierarchyDepth(categoryId: number): Promise<number> {
    let currentId = categoryId;
    let depth = 0;

    while (currentId) {
      const category = await this.productCategoryRepository.findById(currentId);
      if (!category) break;

      depth++;
      currentId = category.parent_id || 0;
    }

    return depth;
  }

  async generateUniqueCode(name: string): Promise<string> {
    const timestamp = new Date().getTime();

    // Get last product category to determine next counter
    const lastCategory =
      await this.productCategoryRepository.findLastCategory();
    let counter = 1;

    if (lastCategory) {
      const match = lastCategory.code.match(/^PC(\d{4})/);
      if (match) {
        counter = parseInt(match[1]) + 1;
      }
    }

    let code = this.formatCode(counter, timestamp);

    // Ensure uniqueness in case of conflicts
    while (await this.productCategoryRepository.findByCodeWithDeleted(code)) {
      counter++;
      code = this.formatCode(counter, timestamp);
    }

    return code;
  }

  private formatCode(counter: number, timestamp: number): string {
    // Format counter to 4 digits with leading zeros
    const paddedCounter = counter.toString().padStart(4, "0");
    return `PC${paddedCounter}-${timestamp}`;
  }

  private isValidCodeFormat(code: string): boolean {
    // Update regex to match new format: PC0001-1234567890
    const codeRegex = /^PC\d{4}-\d+$/;
    return codeRegex.test(code);
  }
}
