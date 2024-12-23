import { IsOptional, IsBoolean, IsString, IsEnum } from "class-validator";
import { Transform } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { PaginationQueryDto } from "@/common/pagination/dto/pagination-query.dto";

export enum SortOrder {
  ASC = "ASC",
  DESC = "DESC",
}

export class BrandQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: "Search by name" })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: "Sort field", default: "created_at" })
  @IsOptional()
  @IsString()
  sort?: string = "created_at";

  @ApiPropertyOptional({
    description: "Sort order",
    enum: SortOrder,
    default: SortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  order?: SortOrder = SortOrder.DESC;

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
