import { Injectable, NotFoundException } from '@nestjs/common';
import { TaxRepository } from '../../domain/repositories/tax.repository';
import { CreateTaxDto, UpdateTaxDto, UpdateTaxStatusDto } from '../dtos/tax.dto';
import { TaxQueryDto } from '../dtos/tax-query.dto';
import { TaxValidator } from '../../domain/validators/tax.validator';
import { PaginationHelper } from '@/common/pagination/helpers/pagination.helper';
import { ResponseTransformer } from '@/common/transformers/response.transformer';
import { ILike } from 'typeorm';
import { DomainException } from '@/common/exceptions/domain.exception';
import { HttpStatus } from '@nestjs/common';

@Injectable()
export class TaxService {
  constructor(
    private readonly taxRepository: TaxRepository,
    private readonly taxValidator: TaxValidator,
    private readonly paginationHelper: PaginationHelper,
    private readonly responseTransformer: ResponseTransformer,
  ) {}

  async create(createTaxDto: CreateTaxDto) {
    await this.taxValidator.validateName(createTaxDto.name);
    await this.taxValidator.validatePercentage(createTaxDto.percentage);

    const tax = await this.taxRepository.create({
      ...createTaxDto,
      status: createTaxDto.status ?? true,
    });

    return this.responseTransformer.transform(tax);
  }

  async findAll(query: TaxQueryDto) {
    const { skip, take } = this.paginationHelper.getSkipTake(query.page, query.limit);

    const where: any = {};
    
    if (query.status !== undefined) {
      where.status = query.status;
    }

    if (query.search) {
      where.name = ILike(`%${query.search}%`);
    }

    const [taxes, total] = await this.taxRepository.findAndCountWithDeleted({
      where,
      skip,
      take,
      order: { created_at: 'DESC' },
    });

    const paginationData = this.paginationHelper.generatePaginationData({
      serviceName: 'taxes',
      totalItems: total,
      page: query.page,
      limit: query.limit,
      customParams: query.toCustomParams()
    });

    return this.responseTransformer.transformPaginated(
      taxes,
      total,
      query.page || 1,
      query.limit || 10,
      paginationData.links
    );
  }

  async findOne(id: number) {
    const tax = await this.taxRepository.findWithDeleted(id);
    if (!tax) {
      throw new NotFoundException('Tax not found');
    }
    return this.responseTransformer.transform(tax);
  }

  async update(id: number, updateTaxDto: UpdateTaxDto) {
    const tax = await this.taxRepository.findById(id);
    if (!tax) {
      throw new NotFoundException('Tax not found');
    }

    if (updateTaxDto.name) {
      await this.taxValidator.validateName(updateTaxDto.name);
    }

    if (updateTaxDto.percentage !== undefined) {
      await this.taxValidator.validatePercentage(updateTaxDto.percentage);
    }

    const updated = await this.taxRepository.update(id, updateTaxDto);
    return this.responseTransformer.transform(updated);
  }

  async updateStatus(id: number, updateStatusDto: UpdateTaxStatusDto) {
    const tax = await this.taxRepository.findById(id);
    if (!tax) {
      throw new NotFoundException('Tax not found');
    }

    await this.taxRepository.update(id, updateStatusDto);
    return this.responseTransformer.transform({
      id,
      status: updateStatusDto.status,
      updated_at: new Date()
    });
  }

  async remove(id: number) {
    const tax = await this.taxRepository.findById(id);
    if (!tax) {
      throw new NotFoundException('Tax not found');
    }

    await this.taxRepository.softDelete(id);
    return this.responseTransformer.transform({ message: 'Tax deleted successfully' });
  }

  async restore(id: number) {
    const tax = await this.taxRepository.findWithDeleted(id);
    if (!tax) {
      throw new NotFoundException('Tax not found');
    }

    if (!tax.deleted_at) {
      throw new DomainException('Tax is not deleted', HttpStatus.BAD_REQUEST);
    }

    const restored = await this.taxRepository.restore(id);
    if (!restored) {
      throw new DomainException('Failed to restore tax', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return this.responseTransformer.transform(restored);
  }
}