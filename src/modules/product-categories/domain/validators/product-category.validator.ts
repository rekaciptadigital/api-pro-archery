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
    const baseCode = this.generateBaseCode(name);
    let code = baseCode;
    let counter = 1;

    // Check if code exists and generate new one with counter
    while (await this.productCategoryRepository.findByCodeWithDeleted(code)) {
      code = `${baseCode}-${counter}`;
      counter++;
    }

    return code;
  }

  private generateBaseCode(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with dash
      .replace(/^-+|-+$/g, ""); // Remove leading/trailing dashes
  }

  private isValidCodeFormat(code: string): boolean {
    const codeRegex = /^[a-zA-Z0-9-]+$/;
    return codeRegex.test(code);
  }
}
