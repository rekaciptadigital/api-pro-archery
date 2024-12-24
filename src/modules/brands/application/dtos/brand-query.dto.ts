import { IsOptional, IsBoolean, IsString, IsEnum } from "class-validator";
import { Transform } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { PaginationQueryDto } from "@/common/pagination/dto/pagination-query.dto";

export enum BrandSortField {
  ID = "id",
  NAME = "name",
  CREATED_AT = "created_at"
}

export enum SortOrder {
  ASC = "ASC",
  DESC = "DESC"
}

export class BrandQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ 
    enum: BrandSortField,
    description: 'Field to sort by',
    default: BrandSortField.CREATED_AT
  })
  @IsOptional()
  @IsEnum(BrandSortField)
  sort?: BrandSortField = BrandSortField.CREATED_AT;

  @ApiPropertyOptional({ 
    enum: SortOrder,
    description: 'Sort direction',
    default: SortOrder.DESC
  })
  @IsOptional()
  @IsEnum(SortOrder)
  order?: SortOrder = SortOrder.DESC;

  @ApiPropertyOptional({ description: 'Search by name or code' })
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