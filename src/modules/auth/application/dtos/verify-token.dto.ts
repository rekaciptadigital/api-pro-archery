import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyTokenDto {
  @ApiProperty({ description: 'JWT token to verify' })
  @IsString()
  token: string;
}