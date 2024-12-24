import { IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '@/common/pagination/dto/pagination-query.dto';

export enum VariantSortField {
  ID = 'id',
  DISPLAY_ORDER = 'display_order',
  CREATED_AT = 'created_at'
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC'
}

export class VariantQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ 
    enum: VariantSortField,
    description: 'Field to sort by',
    default: VariantSortField.ID
  })
  @IsOptional()
  @IsEnum(VariantSortField)
  sort?: VariantSortField = VariantSortField.ID;

  @ApiPropertyOptional({ 
    enum: SortOrder,
    description: 'Sort direction',
    default: SortOrder.DESC
  })
  @IsOptional()
  @IsEnum(SortOrder)
  order?: SortOrder = SortOrder.DESC;

  @ApiPropertyOptional({ description: 'Search by name' })
  @IsOptional()
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