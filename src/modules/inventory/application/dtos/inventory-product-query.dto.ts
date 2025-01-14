import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '@/common/pagination/dto/pagination-query.dto';

export enum InventoryProductSortField {
  ID = 'id',
  PRODUCT_NAME = 'product_name',
  SKU = 'sku',
  CREATED_AT = 'created_at'
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC'
}

export class InventoryProductQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ 
    enum: InventoryProductSortField,
    description: 'Field to sort by',
    default: InventoryProductSortField.CREATED_AT
  })
  @IsOptional()
  @IsEnum(InventoryProductSortField)
  sort?: InventoryProductSortField = InventoryProductSortField.CREATED_AT;

  @ApiPropertyOptional({ 
    enum: SortOrder,
    description: 'Sort direction',
    default: SortOrder.DESC
  })
  @IsOptional()
  @IsEnum(SortOrder)
  order?: SortOrder = SortOrder.DESC;

  @ApiPropertyOptional({ description: 'Search term' })
  @IsOptional()
  @IsString()
  search?: string;

  toCustomParams(): Record<string, string> {
    return {
      ...(this.search && { search: this.search }),
      ...(this.sort && { sort: this.sort }),
      ...(this.order && { order: this.order }),
      page: (this.page || 1).toString(),
      limit: (this.limit || 10).toString()
    };
  }
}