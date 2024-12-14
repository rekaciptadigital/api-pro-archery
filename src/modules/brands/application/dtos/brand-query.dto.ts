import { IsOptional, IsBoolean, IsString, IsInt, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '@/common/pagination/dto/pagination-query.dto';

export class BrandQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter by status' })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  status?: boolean;

  @ApiPropertyOptional({ description: 'Search by name or code' })
  @IsOptional()
  @IsString()
  search?: string;

  toCustomParams(): Record<string, string | number> {
    const params: Record<string, string | number> = {};
    if (this.status !== undefined) {
      params.status = this.status ? '1' : '0';
    }
    if (this.search) {
      params.search = this.search;
    }
    if (this.page) {
      params.page = this.page;
    }
    if (this.limit) {
      params.limit = this.limit;
    }
    return params;
  }
}