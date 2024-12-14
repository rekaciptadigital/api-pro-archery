import { IsOptional, IsBoolean, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '@/common/pagination/dto/pagination-query.dto';

export class BrandQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter by status' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return undefined;
  })
  @IsBoolean()
  status?: boolean;

  @ApiPropertyOptional({ description: 'Search by name' })
  @IsOptional()
  @IsString()
  search?: string;

  toCustomParams(): Record<string, string> {
    return {
      ...(this.status !== undefined && { status: this.status ? '1' : '0' }),
      ...(this.search && { search: this.search }),
      page: (this.page || 1).toString(),
      limit: (this.limit || 10).toString()
    };
  }
}