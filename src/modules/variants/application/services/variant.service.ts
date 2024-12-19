import { Injectable, NotFoundException } from '@nestjs/common';
import { VariantRepository } from '../../domain/repositories/variant.repository';
import { CreateVariantDto, UpdateVariantDto, UpdateVariantStatusDto } from '../dtos/variant.dto';
import { VariantQueryDto } from '../dtos/variant-query.dto';
import { VariantValidator } from '../../domain/validators/variant.validator';
import { PaginationHelper } from '@/common/pagination/helpers/pagination.helper';
import { ResponseTransformer } from '@/common/transformers/response.transformer';
import { ILike } from 'typeorm';
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
    await this.variantValidator.validateDisplayOrder(createVariantDto.display_order);

    const variant = await this.variantRepository.create({
      name: createVariantDto.name,
      display_order: createVariantDto.display_order,
      status: createVariantDto.status ?? true,
      values: createVariantDto.values.map(value => ({ value }))
    });

    return this.responseTransformer.transform({
      ...variant,
      values: variant.values.map(v => v.value)
    });
  }

  async findAll(query: VariantQueryDto) {
    const { skip, take } = this.paginationHelper.getSkipTake(query.page, query.limit);

    const where: any = {};
    
    if (query.status !== undefined) {
      where.status = query.status;
    }

    if (query.search) {
      where.name = ILike(`%${query.search}%`);
    }

    const [variants, total] = await this.variantRepository.findAndCount({
      where,
      skip,
      take,
      order: { display_order: 'ASC' },
      relations: ['values']
    });

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
    const variant = await this.variantRepository.findById(id);
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

    if (updateVariantDto.display_order) {
      await this.variantValidator.validateDisplayOrder(updateVariantDto.display_order);
    }

    const updated = await this.variantRepository.update(id, {
      ...updateVariantDto,
      values: updateVariantDto.values?.map(value => ({ value }))
    });

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

    await this.variantRepository.softDelete(id);
    await this.variantRepository.shiftDisplayOrdersDown(variant.display_order);
    
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

    const maxDisplayOrder = await this.variantRepository.getMaxDisplayOrder();
    const newDisplayOrder = maxDisplayOrder + 1;

    const restored = await this.variantRepository.restore(id);
    if (!restored) {
      throw new DomainException('Failed to restore variant', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    await this.variantRepository.update(id, { display_order: newDisplayOrder });
    const updatedVariant = await this.variantRepository.findById(id);
    
    if (!updatedVariant) {
      throw new DomainException('Failed to retrieve updated variant', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return this.responseTransformer.transform({
      ...updatedVariant,
      values: updatedVariant.values.map(v => v.value)
    });
  }
}