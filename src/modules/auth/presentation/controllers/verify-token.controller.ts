import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { VerifyTokenService } from '../../application/services/verify-token.service';
import { VerifyTokenDto } from '../../application/dtos/verify-token.dto';
import { Public } from '../../domain/decorators/public.decorator';

@ApiTags('auth')
@Controller('auth')
export class VerifyTokenController {
  constructor(private readonly verifyTokenService: VerifyTokenService) {}

  @Public()
  @Post('verify-token')
  @ApiOperation({ summary: 'Verify JWT token validity' })
  @ApiResponse({ status: 200, description: 'Token verification result' })
  async verifyToken(@Body() verifyTokenDto: VerifyTokenDto) {
    return this.verifyTokenService.verify(verifyTokenDto.token);
  }
}