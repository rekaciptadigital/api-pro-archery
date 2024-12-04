import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddressDto {
  @ApiProperty()
  street: string;

  @ApiProperty()
  city: string;

  @ApiProperty()
  state: string;

  @ApiProperty()
  postal_code: string;

  @ApiProperty()
  country: string;
}

export class UserPreferencesDto {
  @ApiProperty()
  language: string;

  @ApiProperty()
  timezone: string;

  @ApiProperty()
  notifications: boolean;
}

export class UserRoleDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty({ type: [String] })
  permissions: string[];
}

export class UserResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  username: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  first_name: string;

  @ApiPropertyOptional()
  last_name?: string;

  @ApiPropertyOptional()
  phone?: string;

  @ApiPropertyOptional()
  address?: AddressDto;

  @ApiProperty()
  role: UserRoleDto;

  @ApiPropertyOptional()
  preferences?: UserPreferencesDto;

  @ApiProperty()
  status: string;

  @ApiPropertyOptional()
  last_login?: Date;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}

export class PaginatedUserResponseDto {
  @ApiProperty({ type: [UserResponseDto] })
  data: UserResponseDto[];

  @ApiProperty()
  metadata: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
  };
}