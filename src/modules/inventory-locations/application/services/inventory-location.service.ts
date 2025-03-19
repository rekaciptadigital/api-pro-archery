import { Injectable, NotFoundException } from "@nestjs/common";
import { InventoryLocationRepository } from "../../domain/repositories/inventory-location.repository";
import {
  CreateInventoryLocationDto,
  UpdateInventoryLocationDto,
} from "../dtos/inventory-location.dto";
import { InventoryLocationQueryDto } from "../dtos/inventory-location-query.dto";
import { InventoryLocationValidator } from "../../domain/validators/inventory-location.validator";
import { PaginationHelper } from "@/common/pagination/helpers/pagination.helper";
import { ResponseTransformer } from "@/common/transformers/response.transformer";
import { DomainException } from "@/common/exceptions/domain.exception";
import { HttpStatus } from "@nestjs/common";
import { InventoryLocation } from "../../domain/entities/inventory-location.entity";

@Injectable()
export class InventoryLocationService {
  constructor(
    private readonly inventoryLocationRepository: InventoryLocationRepository,
    private readonly inventoryLocationValidator: InventoryLocationValidator,
    private readonly paginationHelper: PaginationHelper,
    private readonly responseTransformer: ResponseTransformer
  ) {}

  async create(createInventoryLocationDto: CreateInventoryLocationDto) {
    await this.inventoryLocationValidator.validateCode(
      createInventoryLocationDto.code
    );
    await this.inventoryLocationValidator.validateName(
      createInventoryLocationDto.name
    );
    await this.inventoryLocationValidator.validateType(
      createInventoryLocationDto.type
    );

    await this.inventoryLocationValidator.validateParentId(
      createInventoryLocationDto.parent_id ?? null
    );

    const location = await this.inventoryLocationRepository.create({
      ...createInventoryLocationDto,
      status: createInventoryLocationDto.status ?? true,
    });

    return this.responseTransformer.transform(location);
  }

  async findAll(query: InventoryLocationQueryDto) {
    const { skip, take } = this.paginationHelper.getSkipTake(
      query.page,
      query.limit
    );

    const allLocations = await this.inventoryLocationRepository.findAll();
    type LocationWithChildren = InventoryLocation & {
      children: LocationWithChildren[];
    };
    const locationMap = new Map<number, LocationWithChildren>();
    allLocations.forEach((location) => {
      locationMap.set(location.id, { ...location, children: [] });
    });

    const rootLocations: LocationWithChildren[] = [];
    allLocations.forEach((location) => {
      const locationWithChildren = locationMap.get(location.id);
      if (location.parent_id === null) {
        rootLocations.push(locationWithChildren!);
      } else {
        const parent = locationMap.get(location.parent_id);
        if (parent) {
          parent.children.push(locationWithChildren!);
        }
      }
    });

    const filteredRootLocations = rootLocations.filter((location) => {
      if (query.search) {
        return (
          location.name.toLowerCase().includes(query.search.toLowerCase()) ||
          location.code.toLowerCase().includes(query.search.toLowerCase())
        );
      }
      if (query.type) {
        return location.type === query.type;
      }
      if (query.status !== undefined) {
        return location.status === query.status;
      }
      return true;
    });

    const start = ((query.page || 1) - 1) * take;
    const paginatedLocations = filteredRootLocations.slice(start, start + take);
    const total = filteredRootLocations.length;

    const paginationData = this.paginationHelper.generatePaginationData({
      serviceName: "inventory-locations",
      totalItems: total,
      page: query.page,
      limit: query.limit,
      customParams: query.toCustomParams(),
    });

    return this.responseTransformer.transformPaginated(
      paginatedLocations,
      total,
      query.page || 1,
      query.limit || 10,
      paginationData.links
    );
  }

  async findOne(id: number) {
    const location = await this.inventoryLocationRepository.findById(id);

    if (!location) {
      throw new NotFoundException("Location not found");
    }

    const locationWithParent =
      await this.getLocationWithParentAndChildren(location);
    return this.responseTransformer.transform(locationWithParent);
  }

  private async getLocationWithParentAndChildren(
    location: InventoryLocation
  ): Promise<InventoryLocation> {
    if (location.parent_id) {
      const parent = await this.inventoryLocationRepository.findById(
        location.parent_id
      );
      if (parent) {
        const parentWithParentAndChildren =
          await this.getLocationWithParentAndChildren(parent);
        location.parent = parentWithParentAndChildren;
      }
    }

    const children = await this.inventoryLocationRepository.findChildren(
      location.id
    );
    location.children = children;

    return location;
  }

  async update(
    id: number,
    updateInventoryLocationDto: UpdateInventoryLocationDto
  ) {
    const location = await this.inventoryLocationRepository.findById(id);
    if (!location) {
      throw new DomainException(
        "Location not found or has been deleted.",
        HttpStatus.NOT_FOUND
      );
    }

    await this.inventoryLocationValidator.validateCodeForUpdate(
      updateInventoryLocationDto.code,
      id
    );
    await this.inventoryLocationValidator.validateName(
      updateInventoryLocationDto.name
    );
    await this.inventoryLocationValidator.validateType(
      updateInventoryLocationDto.type
    );

    await this.inventoryLocationValidator.validateParentId(
      updateInventoryLocationDto.parent_id ?? null
    );

    Object.assign(location, updateInventoryLocationDto);
    return this.inventoryLocationRepository.save(location);
  }

  async remove(id: number) {
    const location = await this.inventoryLocationRepository.findById(id);
    if (!location) {
      throw new DomainException(
        "Location not found or has been deleted.",
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
      message: "Location deleted successfully",
    });
  }
}
