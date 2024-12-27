import { Injectable, NotFoundException } from "@nestjs/common";
import { ProductTypeRepository } from "../../domain/repositories/product-type.repository";
import { CreateProductTypeDto } from "../dtos/create-product-type.dto";
import { UpdateProductTypeDto } from "../dtos/update-product-type.dto";
import { ProductTypeQueryDto } from "../dtos/product-type-query.dto";
import { ProductTypeValidator } from "../../domain/validators/product-type.validator";
import { PaginationHelper } from "@/common/pagination/helpers/pagination.helper";
import { ResponseTransformer } from "@/common/transformers/response.transformer";
import { DomainException } from "@/common/exceptions/domain.exception";
import { HttpStatus } from "@nestjs/common";

@Injectable()
export class ProductTypeService {
  constructor(
    private readonly productTypeRepository: ProductTypeRepository,
    private readonly productTypeValidator: ProductTypeValidator,
    private readonly paginationHelper: PaginationHelper,
    private readonly responseTransformer: ResponseTransformer
  ) {}

  async create(createProductTypeDto: CreateProductTypeDto) {
    // Check for existing product type with the same code (including deleted ones)
    const existingProductType =
      await this.productTypeRepository.findByCodeWithDeleted(
        createProductTypeDto.code
      );

    if (existingProductType) {
      // If product type exists and not deleted, throw error
      if (!existingProductType.deleted_at) {
        throw new DomainException(
          "Product type code already exists",
          HttpStatus.CONFLICT
        );
      }

      // If product type exists but is deleted, restore and update it
      await this.productTypeRepository.restore(existingProductType.id);
      const updated = await this.productTypeRepository.update(
        existingProductType.id,
        {
          ...createProductTypeDto,
          status: createProductTypeDto.status ?? true,
        }
      );

      return this.responseTransformer.transform(updated);
    }

    // If no existing product type found, create new one
    const productType = await this.productTypeRepository.create({
      ...createProductTypeDto,
      status: createProductTypeDto.status ?? true,
    });

    return this.responseTransformer.transform(productType);
  }

  async findAll(query: ProductTypeQueryDto) {
    const { skip, take } = this.paginationHelper.getSkipTake(
      query.page,
      query.limit
    );

    const [productTypes, total] =
      await this.productTypeRepository.findProductTypes(
        skip,
        take,
        query.sort,
        query.order,
        query.search,
        query.status
      );

    const paginationData = this.paginationHelper.generatePaginationData({
      serviceName: "product-types",
      totalItems: total,
      page: query.page,
      limit: query.limit,
      customParams: query.toCustomParams(),
    });

    return this.responseTransformer.transformPaginated(
      productTypes,
      total,
      query.page || 1,
      query.limit || 10,
      paginationData.links
    );
  }

  async findOne(id: number) {
    const productType = await this.productTypeRepository.findById(id);
    if (!productType) {
      throw new NotFoundException("Product type not found");
    }
    return this.responseTransformer.transform(productType);
  }

  async update(id: number, updateProductTypeDto: UpdateProductTypeDto) {
    const productType = await this.productTypeRepository.findById(id);
    if (!productType) {
      throw new NotFoundException("Product type not found");
    }

    if (
      updateProductTypeDto.code &&
      updateProductTypeDto.code !== productType.code
    ) {
      // Check for existing product type with the same code (including deleted ones)
      const existingProductType =
        await this.productTypeRepository.findByCodeWithDeleted(
          updateProductTypeDto.code
        );

      if (existingProductType) {
        // If product type exists and not deleted, throw error
        if (!existingProductType.deleted_at) {
          throw new DomainException(
            "Product type code already exists",
            HttpStatus.CONFLICT
          );
        }

        // If product type exists but is deleted, restore and merge data
        await this.productTypeRepository.restore(existingProductType.id);
        await this.productTypeRepository.softDelete(id); // Delete the current one

        const updated = await this.productTypeRepository.update(
          existingProductType.id,
          {
            ...updateProductTypeDto,
            status: updateProductTypeDto.status ?? existingProductType.status,
          }
        );

        return this.responseTransformer.transform(updated);
      }
    }

    // If no existing product type found or no code change, update normally
    const updated = await this.productTypeRepository.update(id, {
      ...updateProductTypeDto,
      ...(updateProductTypeDto.status !== undefined && {
        status: updateProductTypeDto.status,
      }),
    });

    return this.responseTransformer.transform(updated);
  }

  async remove(id: number) {
    const productType = await this.productTypeRepository.findById(id);
    if (!productType) {
      throw new NotFoundException("Product type not found");
    }

    await this.productTypeRepository.softDelete(id);
    return this.responseTransformer.transform({
      message: "Product type deleted successfully",
    });
  }

  async restore(id: number) {
    const productType = await this.productTypeRepository.findWithDeleted(id);
    if (!productType) {
      throw new NotFoundException("Product type not found");
    }

    if (!productType.deleted_at) {
      throw new DomainException(
        "Product type is not deleted",
        HttpStatus.BAD_REQUEST
      );
    }

    const restored = await this.productTypeRepository.restore(id);
    if (!restored) {
      throw new DomainException(
        "Failed to restore product type",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    return this.responseTransformer.transform(restored);
  }
}
