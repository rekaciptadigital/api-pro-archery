import { IsOptional, IsBoolean, IsString, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '@/common/pagination/dto/pagination-query.dto';

export class ProductQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter by status' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return undefined;
  })
  @IsBoolean()
  status?: boolean;

  @ApiPropertyOptional({ description: 'Search by name or SKU' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by brand ID' })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  brand_id?: number;

  @ApiPropertyOptional({ description: 'Filter by tax ID' })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  tax_id?: number;

  toCustomParams(): Record<string, string> {
    return {
      ...(this.status !== undefined && { status: this.status ? '1' : '0' }),
      ...(this.search && { search: this.search }),
      ...(this.brand_id && { brand_id: this.brand_id.toString() }),
      ...(this.tax_id && { tax_id: this.tax_id.toString() }),
      page: (this.page || 1).toString(),
      limit: (this.limit || 10).toString()
    };
  }
}