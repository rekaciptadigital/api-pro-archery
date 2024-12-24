import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '@/common/pagination/dto/pagination-query.dto';

export enum UserSortField {
  NAME = 'first_name',
  EMAIL = 'email',
  CREATED_AT = 'created_at'
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC'
}

export class UserListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ 
    enum: UserSortField,
    description: 'Field to sort by',
    default: UserSortField.CREATED_AT
  })
  @IsOptional()
  @IsEnum(UserSortField)
  sort?: UserSortField = UserSortField.CREATED_AT;

  @ApiPropertyOptional({ 
    enum: SortOrder,
    description: 'Sort direction',
    default: SortOrder.DESC
  })
  @IsOptional()
  @IsEnum(SortOrder)
  order?: SortOrder = SortOrder.DESC;

  @ApiPropertyOptional({ 
    description: 'Search term for filtering by name or email' 
  })
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