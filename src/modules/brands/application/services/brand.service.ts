import { Injectable, NotFoundException } from "@nestjs/common";
import { BrandRepository } from "../../domain/repositories/brand.repository";
import {
  CreateBrandDto,
  UpdateBrandDto,
  UpdateBrandStatusDto,
} from "../dtos/brand.dto";
import { BrandQueryDto } from "../dtos/brand-query.dto";
import { BrandValidator } from "../../domain/validators/brand.validator";
import { PaginationHelper } from "@/common/pagination/helpers/pagination.helper";
import { ResponseTransformer } from "@/common/transformers/response.transformer";
import { ILike } from "typeorm";
import { DomainException } from "@/common/exceptions/domain.exception";
import { HttpStatus } from "@nestjs/common";

@Injectable()
export class BrandService {
  constructor(
    private readonly brandRepository: BrandRepository,
    private readonly brandValidator: BrandValidator,
    private readonly paginationHelper: PaginationHelper,
    private readonly responseTransformer: ResponseTransformer
  ) {}

  async create(createBrandDto: CreateBrandDto) {
    await this.brandValidator.validateCode(createBrandDto.code);
    await this.brandValidator.validateName(createBrandDto.name);

    const brand = await this.brandRepository.create({
      ...createBrandDto,
      status: createBrandDto.status ?? true,
    });

    return this.responseTransformer.transform(brand);
  }

  async findAll(query: BrandQueryDto) {
    const { skip, take } = this.paginationHelper.getSkipTake(
      query.page,
      query.limit
    );

    const where: any = {};

    if (query.status !== undefined) {
      where.status = query.status;
    }

    if (query.search) {
      where.name = ILike(`%${query.search}%`);
    }

    const [brands, total] = await this.brandRepository.findAndCountWithDeleted({
      where,
      skip,
      take,
      order: { created_at: "DESC" },
    });

    const paginationData = this.paginationHelper.generatePaginationData({
      serviceName: "brands",
      totalItems: total,
      page: query.page,
      limit: query.limit,
      customParams: query.toCustomParams(),
    });

    return this.responseTransformer.transformPaginated(
      brands,
      total,
      query.page || 1,
      query.limit || 10,
      paginationData.links
    );
  }

  async findOne(id: number) {
    const brand = await this.brandRepository.findWithDeleted(id);
    if (!brand) {
      throw new NotFoundException("Brand not found");
    }
    return this.responseTransformer.transform(brand);
  }

  async update(id: number, updateBrandDto: UpdateBrandDto) {
    const brand = await this.brandRepository.findById(id);
    if (!brand) {
      throw new NotFoundException("Brand not found");
    }

    if (updateBrandDto.code && updateBrandDto.code !== brand.code) {
      await this.brandValidator.validateCode(updateBrandDto.code, id);
    }

    if (updateBrandDto.name) {
      await this.brandValidator.validateName(updateBrandDto.name);
    }

    const updated = await this.brandRepository.update(id, updateBrandDto);
    return this.responseTransformer.transform(updated);
  }

  async updateStatus(id: number, updateStatusDto: UpdateBrandStatusDto) {
    const brand = await this.brandRepository.findById(id);
    if (!brand) {
      throw new NotFoundException("Brand not found");
    }

    await this.brandRepository.update(id, updateStatusDto);
    return this.responseTransformer.transform({
      id,
      status: updateStatusDto.status,
    });
  }

  async remove(id: number) {
    const brand = await this.brandRepository.findById(id);
    if (!brand) {
      throw new NotFoundException("Brand not found");
    }

    await this.brandRepository.softDelete(id);
    return this.responseTransformer.transform({
      message: "Brand deleted successfully",
    });
  }

  async restore(id: number) {
    const brand = await this.brandRepository.findWithDeleted(id);
    if (!brand) {
      throw new NotFoundException("Brand not found");
    }

    if (!brand.deleted_at) {
      throw new DomainException("Brand is not deleted", HttpStatus.BAD_REQUEST);
    }

    const restored = await this.brandRepository.restore(id);
    if (!restored) {
      throw new DomainException(
        "Failed to restore brand",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    return this.responseTransformer.transform(restored);
  }
}
