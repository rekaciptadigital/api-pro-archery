import { IsOptional, IsBoolean, IsString, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '@/common/pagination/dto/pagination-query.dto';

export enum ProductCategorySortField {
  CREATED_AT = 'created_at',
  NAME = 'name'
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC'
}

export class ProductCategoryQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ 
    enum: ProductCategorySortField,
    description: 'Field to sort by',
    default: ProductCategorySortField.CREATED_AT
  })
  @IsOptional()
  @IsEnum(ProductCategorySortField)
  sort?: ProductCategorySortField = ProductCategorySortField.CREATED_AT;

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
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by status' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return undefined;
  })
  @IsBoolean()
  status?: boolean;

  toCustomParams(): Record<string, string> {
    return {
      ...(this.search && { search: this.search }),
      ...(this.status !== undefined && { status: this.status ? '1' : '0' }),
      ...(this.sort && { sort: this.sort }),
      ...(this.order && { order: this.order }),
      page: (this.page || 1).toString(),
      limit: (this.limit || 10).toString()
    };
  }
}