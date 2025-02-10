import { Injectable, NotFoundException } from '@nestjs/common';
import { InventoryLocationRepository } from '../../domain/repositories/inventory-location.repository';
import { CreateInventoryLocationDto, UpdateInventoryLocationDto } from '../dtos/inventory-location.dto';
import { InventoryLocationQueryDto } from '../dtos/inventory-location-query.dto';
import { InventoryLocationValidator } from '../../domain/validators/inventory-location.validator';
import { PaginationHelper } from '@/common/pagination/helpers/pagination.helper';
import { ResponseTransformer } from '@/common/transformers/response.transformer';
import { DomainException } from '@/common/exceptions/domain.exception';
import { HttpStatus } from '@nestjs/common';

@Injectable()
export class InventoryLocationService {
  constructor(
    private readonly inventoryLocationRepository: InventoryLocationRepository,
    private readonly inventoryLocationValidator: InventoryLocationValidator,
    private readonly paginationHelper: PaginationHelper,
    private readonly responseTransformer: ResponseTransformer
  ) {}

  async create(createInventoryLocationDto: CreateInventoryLocationDto) {
    await this.inventoryLocationValidator.validateCode(createInventoryLocationDto.code);
    await this.inventoryLocationValidator.validateName(createInventoryLocationDto.name);
    await this.inventoryLocationValidator.validateType(createInventoryLocationDto.type);

    const location = await this.inventoryLocationRepository.create({
      ...createInventoryLocationDto,
      status: createInventoryLocationDto.status ?? true
    });

    return this.responseTransformer.transform(location);
  }

  async findAll(query: InventoryLocationQueryDto) {
    const { skip, take } = this.paginationHelper.getSkipTake(query.page, query.limit);
    
    const [locations, total] = await this.inventoryLocationRepository.findLocations(
      skip,
      take,
      query.search,
      query.type,
      query.status
    );

    // Group locations by type
    const groupedLocations = locations.reduce((acc, location) => {
      const type = location.type.toLowerCase();
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(location);
      return acc;
    }, {} as Record<string, any[]>);

    // Transform to array format
    const result = Object.entries(groupedLocations).map(([type, locations]) => ({
      type,
      locations
    }));

    const paginationData = this.paginationHelper.generatePaginationData({
      serviceName: 'inventory-locations',
      totalItems: total,
      page: query.page,
      limit: query.limit,
      customParams: query.toCustomParams()
    });

    return this.responseTransformer.transformPaginated(
      result,
      total,
      query.page || 1,
      query.limit || 10,
      paginationData.links
    );
  }

  async findOne(id: number) {
    const location = await this.inventoryLocationRepository.findById(id);
    if (!location) {
      throw new DomainException(
        'Location not found or has been deleted.',
        HttpStatus.NOT_FOUND
      );
    }
    return this.responseTransformer.transform(location);
  }

  async update(id: number, updateInventoryLocationDto: UpdateInventoryLocationDto) {
    const location = await this.inventoryLocationRepository.findById(id);
    if (!location) {
      throw new DomainException(
        'Location not found or has been deleted.',
        HttpStatus.NOT_FOUND
      );
    }

    await this.inventoryLocationValidator.validateName(updateInventoryLocationDto.name);
    await this.inventoryLocationValidator.validateType(updateInventoryLocationDto.type);

    const updated = await this.inventoryLocationRepository.update(id, updateInventoryLocationDto);
    return this.responseTransformer.transform(updated);
  }

  async remove(id: number) {
    const location = await this.inventoryLocationRepository.findById(id);
    if (!location) {
      throw new DomainException(
        'Location not found or has been deleted.',
        HttpStatus.NOT_FOUND
      );
    }

    // TODO: Add check for linked stock products when that feature is implemented
    // const hasLinkedProducts = await this.stockProductRepository.findByLocationId(id);
    // if (hasLinkedProducts) {
    //   throw new DomainException(
    //     'Cannot delete location because it is still linked to product stock.',
    //     HttpStatus.BAD_REQUEST
    //   );
    // }

    await this.inventoryLocationRepository.softDelete(id);
    return this.responseTransformer.transform({
      message: 'Location deleted successfully'
    });
  }
}