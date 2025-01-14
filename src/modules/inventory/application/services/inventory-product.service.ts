import { Injectable, NotFoundException } from '@nestjs/common';
import { InventoryProductRepository } from '../../domain/repositories/inventory-product.repository';
import { CreateInventoryProductDto } from '../dtos/create-inventory-product.dto';
import { UpdateInventoryProductDto } from '../dtos/update-inventory-product.dto';
import { InventoryProductQueryDto } from '../dtos/inventory-product-query.dto';
import { PaginationHelper } from '@/common/pagination/helpers/pagination.helper';
import { ResponseTransformer } from '@/common/transformers/response.transformer';
import { DomainException } from '@/common/exceptions/domain.exception';
import { HttpStatus } from '@nestjs/common';
import { ProductSlug } from '../../domain/value-objects/product-slug.value-object';
import { SKU } from '../../domain/value-objects/sku.value-object';
import { DataSource } from 'typeorm';

@Injectable()
export class InventoryProductService {
  constructor(
    private readonly inventoryProductRepository: InventoryProductRepository,
    private readonly paginationHelper: PaginationHelper,
    private readonly responseTransformer: ResponseTransformer,
    private readonly dataSource: DataSource
  ) {}

  async create(createInventoryProductDto: CreateInventoryProductDto) {
    // Validate SKU format
    if (!SKU.isValid(createInventoryProductDto.sku)) {
      throw new DomainException('Invalid SKU format');
    }

    // Check for existing SKU or unique_code
    const existingProduct = await this.inventoryProductRepository.findBySkuOrUniqueCode(
      createInventoryProductDto.sku,
      createInventoryProductDto.unique_code
    );

    if (existingProduct) {
      throw new DomainException('SKU or unique code already exists', HttpStatus.CONFLICT);
    }

    // Generate slug from product name
    const slug = ProductSlug.create(createInventoryProductDto.product_name).getValue();

    // Create product with relationships in a transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const product = await queryRunner.manager.save('inventory_products', {
        ...createInventoryProductDto,
        slug
      });

      // Save categories
      if (createInventoryProductDto.categories?.length) {
        const categories = createInventoryProductDto.categories.map(category => ({
          inventory_product_id: product.id,
          ...category
        }));
        await queryRunner.manager.save('inventory_product_categories', categories);
      }

      // Save variants and their values
      if (createInventoryProductDto.variants?.length) {
        for (const variant of createInventoryProductDto.variants) {
          const savedVariant = await queryRunner.manager.save('inventory_product_selected_variants', {
            inventory_product_id: product.id,
            variant_id: variant.variant_id,
            variant_name: variant.variant_name
          });

          if (variant.variant_values?.length) {
            const variantValues = variant.variant_values.map(value => ({
              inventory_product_variant_id: savedVariant.id,
              ...value
            }));
            await queryRunner.manager.save('inventory_product_selected_variant_values', variantValues);
          }
        }
      }

      // Save product variants
      if (createInventoryProductDto.product_by_variant?.length) {
        const productVariants = createInventoryProductDto.product_by_variant.map(variant => ({
          inventory_product_id: product.id,
          ...variant
        }));
        await queryRunner.manager.save('inventory_product_by_variants', productVariants);
      }

      await queryRunner.commitTransaction();

      const createdProduct = await this.inventoryProductRepository.findOneWithRelations(product.id);
      return this.responseTransformer.transform(createdProduct);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(query: InventoryProductQueryDto) {
    const { skip, take } = this.paginationHelper.getSkipTake(query.page, query.limit);
    
    const [products, total] = await this.inventoryProductRepository.findProducts(
      skip,
      take,
      query.sort,
      query.order,
      query.search
    );

    const paginationData = this.paginationHelper.generatePaginationData({
      serviceName: 'inventory',
      totalItems: total,
      page: query.page,
      limit: query.limit,
      customParams: query.toCustomParams()
    });

    return this.responseTransformer.transformPaginated(
      products,
      total,
      query.page || 1,
      query.limit || 10,
      paginationData.links
    );
  }

  async findOne(id: number) {
    const product = await this.inventoryProductRepository.findOneWithRelations(id);
    if (!product) {
      throw new NotFoundException('Inventory product not found');
    }
    return this.responseTransformer.transform(product);
  }

  async update(id: number, updateInventoryProductDto: UpdateInventoryProductDto) {
    const product = await this.inventoryProductRepository.findById(id);
    if (!product) {
      throw new NotFoundException('Inventory product not found');
    }

    // Check for existing soft-deleted product with same SKU/unique_code
    if (updateInventoryProductDto.sku || updateInventoryProductDto.unique_code) {
      const existingProduct = await this.inventoryProductRepository.findBySkuOrUniqueCodeWithDeleted(
        updateInventoryProductDto.sku || product.sku,
        updateInventoryProductDto.unique_code
      );

      if (existingProduct && existingProduct.id !== id) {
        if (existingProduct.deleted_at) {
          // Restore the soft-deleted product
          await this.inventoryProductRepository.restore(existingProduct.id);
          throw new DomainException(
            'Product with this SKU/unique code has been restored. Please try again with different values.',
            HttpStatus.CONFLICT
          );
        } else {
          throw new DomainException('SKU or unique code already exists', HttpStatus.CONFLICT);
        }
      }
    }

    // Update product and relationships in a transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update main product
      if (updateInventoryProductDto.product_name) {
        updateInventoryProductDto.slug = ProductSlug.create(updateInventoryProductDto.product_name).getValue();
      }

      await queryRunner.manager.update('inventory_products', id, updateInventoryProductDto);

      // Update relationships if provided
      if (updateInventoryProductDto.categories) {
        await queryRunner.manager.delete('inventory_product_categories', { inventory_product_id: id });
        const categories = updateInventoryProductDto.categories.map(category => ({
          inventory_product_id: id,
          ...category
        }));
        await queryRunner.manager.save('inventory_product_categories', categories);
      }

      if (updateInventoryProductDto.variants) {
        // Delete existing variants and their values
        const existingVariants = await queryRunner.manager.find('inventory_product_selected_variants', {
          where: { inventory_product_id: id }
        });
        
        for (const variant of existingVariants) {
          await queryRunner.manager.delete('inventory_product_selected_variant_values', {
            inventory_product_variant_id: variant.id
          });
        }
        await queryRunner.manager.delete('inventory_product_selected_variants', { inventory_product_id: id });

        // Create new variants and values
        for (const variant of updateInventoryProductDto.variants) {
          const savedVariant = await queryRunner.manager.save('inventory_product_selected_variants', {
            inventory_product_id: id,
            variant_id: variant.variant_id,
            variant_name: variant.variant_name
          });

          if (variant.variant_values?.length) {
            const variantValues = variant.variant_values.map(value => ({
              inventory_product_variant_id: savedVariant.id,
              ...value
            }));
            await queryRunner.manager.save('inventory_product_selected_variant_values', variantValues);
          }
        }
      }

      if (updateInventoryProductDto.product_by_variant) {
        await queryRunner.manager.delete('inventory_product_by_variants', { inventory_product_id: id });
        const productVariants = updateInventoryProductDto.product_by_variant.map(variant => ({
          inventory_product_id: id,
          ...variant
        }));
        await queryRunner.manager.save('inventory_product_by_variants', productVariants);
      }

      await queryRunner.commitTransaction();

      const updatedProduct = await this.inventoryProductRepository.findOneWithRelations(id);
      return this.responseTransformer.transform(updatedProduct);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: number) {
    const product = await this.inventoryProductRepository.findById(id);
    if (!product) {
      throw new NotFoundException('Inventory product not found');
    }

    await this.inventoryProductRepository.softDelete(id);
    return this.responseTransformer.transform({ message: 'Inventory product deleted successfully' });
  }
}