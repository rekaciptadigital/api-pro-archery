import { Injectable, NotFoundException } from '@nestjs/common';
import { VariantRepository } from '../../domain/repositories/variant.repository';
import { CreateVariantDto, UpdateVariantDto, UpdateVariantStatusDto } from '../dtos/variant.dto';
import { VariantQueryDto } from '../dtos/variant-query.dto';
import { VariantValidator } from '../../domain/validators/variant.validator';
import { PaginationHelper } from '@/common/pagination/helpers/pagination.helper';
import { ResponseTransformer } from '@/common/transformers/response.transformer';
import { DomainException } from '@/common/exceptions/domain.exception';
import { HttpStatus } from '@nestjs/common';

@Injectable()
export class VariantService {
  constructor(
    private readonly variantRepository: VariantRepository,
    private readonly variantValidator: VariantValidator,
    private readonly paginationHelper: PaginationHelper,
    private readonly responseTransformer: ResponseTransformer
  ) {}

  async create(createVariantDto: CreateVariantDto) {
    await this.variantValidator.validateName(createVariantDto.name);
    await this.variantValidator.validateValues(createVariantDto.values);

    // Get next display order
    const count = await this.variantRepository.getActiveVariantsCount();
    const nextOrder = count + 1;

    const variant = await this.variantRepository.create({
      name: createVariantDto.name,
      display_order: nextOrder,
      status: createVariantDto.status ?? true,
      values: createVariantDto.values.map(value => ({
        value: value
      }))
    });

    return this.responseTransformer.transform({
      ...variant,
      values: variant.values.map(v => v.value)
    });
  }

  async findAll(query: VariantQueryDto) {
    const { skip, take } = this.paginationHelper.getSkipTake(query.page, query.limit);
    
    const [variants, total] = await this.variantRepository.findActiveVariants(skip, take);

    const transformedVariants = variants.map(variant => ({
      ...variant,
      values: variant.values.map(v => v.value)
    }));

    const paginationData = this.paginationHelper.generatePaginationData({
      serviceName: 'variants',
      totalItems: total,
      page: query.page,
      limit: query.limit,
      customParams: query.toCustomParams()
    });

    return this.responseTransformer.transformPaginated(
      transformedVariants,
      total,
      query.page || 1,
      query.limit || 10,
      paginationData.links
    );
  }

  async findOne(id: number) {
    const variant = await this.variantRepository.findOneWithOptions({
      where: { id },
      relations: ['values']
    });

    if (!variant) {
      throw new NotFoundException('Variant not found');
    }

    return this.responseTransformer.transform({
      ...variant,
      values: variant.values.map(v => v.value)
    });
  }

  async update(id: number, updateVariantDto: UpdateVariantDto) {
    const variant = await this.variantRepository.findById(id);
    if (!variant) {
      throw new NotFoundException('Variant not found');
    }

    if (updateVariantDto.name) {
      await this.variantValidator.validateName(updateVariantDto.name);
    }

    if (updateVariantDto.values) {
      await this.variantValidator.validateValues(updateVariantDto.values);
    }

    // Validate display_order
    const totalVariants = await this.variantRepository.getActiveVariantsCount();
    if (updateVariantDto.display_order > totalVariants) {
      throw new DomainException(
        `Display order cannot exceed total number of variants (${totalVariants})`,
        HttpStatus.BAD_REQUEST
      );
    }

    // Handle display order update
    if (updateVariantDto.display_order !== variant.display_order) {
      await this.variantRepository.swapDisplayOrder(
        id,
        variant.display_order!,
        updateVariantDto.display_order
      );
    }

    // Update variant with values
    const updated = await this.variantRepository.updateWithValues(
      id,
      {
        name: updateVariantDto.name,
        status: updateVariantDto.status,
        display_order: updateVariantDto.display_order
      },
      updateVariantDto.values
    );

    return this.responseTransformer.transform({
      ...updated,
      values: updated.values.map(v => v.value)
    });
  }

  async updateStatus(id: number, updateStatusDto: UpdateVariantStatusDto) {
    const variant = await this.variantRepository.findById(id);
    if (!variant) {
      throw new NotFoundException('Variant not found');
    }

    await this.variantRepository.update(id, updateStatusDto);
    return this.responseTransformer.transform({
      id,
      status: updateStatusDto.status,
      updated_at: new Date()
    });
  }

  async remove(id: number) {
    const variant = await this.variantRepository.findById(id);
    if (!variant) {
      throw new NotFoundException('Variant not found');
    }

    // Set display_order to null before soft delete
    await this.variantRepository.update(id, { display_order: null });
    await this.variantRepository.softDelete(id);

    // Reorder remaining variants
    if (variant.display_order) {
      await this.variantRepository.reorderAfterDelete(variant.display_order);
    }
    
    return this.responseTransformer.transform({ 
      message: 'Variant deleted successfully' 
    });
  }

  async restore(id: number) {
    const variant = await this.variantRepository.findWithDeleted(id);
    if (!variant) {
      throw new NotFoundException('Variant not found');
    }

    if (!variant.deleted_at) {
      throw new DomainException('Variant is not deleted', HttpStatus.BAD_REQUEST);
    }

    // Get new display order (count + 1)
    const count = await this.variantRepository.getActiveVariantsCount();
    const newDisplayOrder = count + 1;

    // Restore variant with new display order
    await this.variantRepository.restore(id);
    await this.variantRepository.update(id, { display_order: newDisplayOrder });

    const restored = await this.variantRepository.findById(id);
    if (!restored) {
      throw new DomainException('Failed to restore variant', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return this.responseTransformer.transform({
      ...restored,
      values: restored.values.map(v => v.value)
    });
  }
}