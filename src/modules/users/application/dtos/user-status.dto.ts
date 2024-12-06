import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserStatusDto {
  @ApiProperty({
    description: 'User status (true for active, false for inactive)',
    example: true
  })
  @IsBoolean()
  status: boolean;
}