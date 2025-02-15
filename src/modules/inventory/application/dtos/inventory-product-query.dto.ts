import { IsOptional, IsString, IsEnum, IsBoolean } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { PaginationQueryDto } from "@/common/pagination/dto/pagination-query.dto";

export enum InventoryProductSortField {
  ID = "id",
  PRODUCT_NAME = "product_name",
  SKU = "sku",
  CREATED_AT = "created_at",
}

export enum SortOrder {
  ASC = "ASC",
  DESC = "DESC",
}

export class InventoryProductQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    enum: InventoryProductSortField,
    description: "Field to sort by",
    default: InventoryProductSortField.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(InventoryProductSortField)
  sort?: InventoryProductSortField = InventoryProductSortField.CREATED_AT;

  @ApiPropertyOptional({
    enum: SortOrder,
    description: "Sort direction",
    default: SortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  order?: SortOrder = SortOrder.DESC;

  @ApiPropertyOptional({ description: "Search term" })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: "Filter by status",
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }: { value: any }) => {
    if (value === "true") return true;
    if (value === "false") return false;
    return undefined;
  })
  status?: boolean;

  toCustomParams(): Record<string, string> {
    return {
      ...(this.search && { search: this.search }),
      ...(this.sort && { sort: this.sort }),
      ...(this.order && { order: this.order }),
      page: (this.page || 1).toString(),
      limit: (this.limit || 10).toString(),
    };
  }
}
